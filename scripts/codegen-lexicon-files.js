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
 * Usage (in package.json): `lex gen-api --yes ./generated $(node ./scripts/codegen-lexicon-files.js)`
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

process.stdout.write(files.join("\n") + "\n");
