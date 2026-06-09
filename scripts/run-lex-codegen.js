#!/usr/bin/env node

/**
 * Run a `lex` codegen subcommand over every lexicon under `lexicons/` EXCEPT
 * permission-set lexicons.
 *
 * `lex gen-api` / `gen-md` / `gen-ts` cannot codegen a `type: "permission-set"`
 * def — it has no TypeScript shape and the CLI throws on it. Permission sets are
 * published as-is, so they are excluded from codegen. The exclusion is by
 * **content** (`defs.main.type === "permission-set"`), the same check
 * `scripts/generate-exports.js` uses — so the two cannot drift as files move.
 *
 * Why a Node runner rather than a shell pipeline:
 *  - `lex … $(node …)` swallows a producer failure (command substitution discards
 *    its exit code) and can hit ARG_MAX.
 *  - `node … | xargs -0 lex …` needs `set -o pipefail` to propagate a producer
 *    failure, and `pipefail` is NOT portable across the `sh` npm runs scripts
 *    with (rejected by the dash on GitHub's Ubuntu runners).
 *  This runner is a single process with one authoritative exit code, passes the
 *  file list to `lex` as argv (no shell, no ARG_MAX), and forwards lex's exit
 *  code. No shell builtins involved.
 *
 * Usage (in package.json):
 *   node ./scripts/run-lex-codegen.js gen-api --yes ./generated
 *   node ./scripts/run-lex-codegen.js gen-ts-obj > generated/DO-NOT-USE-lexicons.ts
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const lexiconsDir = fileURLToPath(new URL("../lexicons", import.meta.url));

function findJsonFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findJsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

function isPermissionSet(file) {
  try {
    return (
      JSON.parse(readFileSync(file, "utf-8"))?.defs?.main?.type ===
      "permission-set"
    );
  } catch {
    return false; // let lex surface a parse error rather than silently skip
  }
}

const lexArgs = process.argv.slice(2);
if (lexArgs.length === 0) {
  process.stderr.write(
    "run-lex-codegen: expected a lex subcommand, e.g. `gen-api --yes ./generated`\n",
  );
  process.exit(2);
}

const files = findJsonFiles(lexiconsDir)
  .filter((f) => !isPermissionSet(f))
  .sort();

// Fail loudly rather than run lex on an empty list (which could "succeed"
// producing nothing).
if (files.length === 0) {
  process.stderr.write("run-lex-codegen: no lexicons found\n");
  process.exit(1);
}

// `shell: false` (the default) — args are passed as argv, so there is no shell
// word-splitting, no ARG_MAX limit from a command line, and lex's exit code is
// ours. stdio inherited so `> file` redirection in the npm script still works.
const result = spawnSync("lex", [...lexArgs, ...files], { stdio: "inherit" });
if (result.error) {
  process.stderr.write(
    `run-lex-codegen: failed to spawn lex: ${result.error.message}\n`,
  );
  process.exit(1);
}
process.exit(result.status ?? 1);
