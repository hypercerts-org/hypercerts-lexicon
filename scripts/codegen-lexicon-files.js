#!/usr/bin/env node

/**
 * Print the list of lexicon JSON files that `lex gen-*` should process, one per
 * line — i.e. every lexicon under `lexicons/` EXCEPT permission-set lexicons.
 *
 * `lex gen-api` / `gen-md` / `gen-ts` cannot codegen a `type: "permission-set"`
 * def (it has no TypeScript shape and the CLI throws on it). Permission sets are
 * published as-is, so they must be excluded from the codegen globs.
 *
 * This is the **single source of truth** for that exclusion — both the codegen
 * scripts (via this list) and `scripts/generate-exports.js` (via the same
 * `main.type === "permission-set"` check) skip the same files by **content**,
 * not by path, so they cannot drift as files move.
 *
 * Usage (in package.json): pipe into `xargs -0`, e.g.
 *   `node ./scripts/codegen-lexicon-files.js | xargs -0 lex gen-api --yes ./generated`
 * Piping (not `$(…)`) is deliberate: a failure or empty output here propagates
 * through the pipeline instead of being swallowed by command substitution, and
 * `xargs` avoids ARG_MAX limits. Output is NUL-delimited for `xargs -0`.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

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

const files = findJsonFiles(lexiconsDir)
  .filter((f) => !isPermissionSet(f))
  .sort();

// Fail loudly rather than let the codegen run on an empty arg list (which could
// otherwise "succeed" producing nothing). The pipeline (`node … | xargs lex …`)
// already propagates this non-zero exit, unlike a `$(…)` substitution.
if (files.length === 0) {
  process.stderr.write("codegen-lexicon-files: no lexicons found\n");
  process.exit(1);
}

// NUL-delimited for `xargs -0` — robust against any path characters.
process.stdout.write(files.join("\0") + "\0");
