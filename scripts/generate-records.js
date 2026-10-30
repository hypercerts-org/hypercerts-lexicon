#!/usr/bin/env node
/**
 * Generates generated/records/ for the `@hypercerts-org/lexicon/records`
 * subpath: lex-compatible schemas for @atproto/lex, in lex's own layout.
 *
 * - Runs the modern @atproto/lex generator (`lex build --index-file`) over
 *   every lexicon except permission sets, so referenced definitions are
 *   included. The index exports lex's NSID namespace tree (`app`, `com`,
 *   `org`, `pub`), so consumers write `org.hypercerts.claim.activity`, as in
 *   the @atproto/lex documentation.
 *
 * The legacy `lex` CLI (@atproto/lex-cli) also installs a `lex` binary, so
 * this script runs @atproto/lex's own entry point directly.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const lexiconsDir = join(projectRoot, "lexicons");
const outDir = join(projectRoot, "generated", "records");
const lexEntry = join(
  projectRoot,
  "node_modules",
  "@atproto",
  "lex",
  "bin",
  "lex",
);

/** Plain code-unit comparison, independent of locale. */
const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** Parsed lexicon documents under lexicons/. */
function readLexicons() {
  return readdirSync(lexiconsDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => {
      const file = join(entry.parentPath, entry.name);
      try {
        return JSON.parse(readFileSync(file, "utf-8"));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse lexicon ${file}: ${message}`);
      }
    });
}

function main() {
  if (!existsSync(lexEntry)) {
    throw new Error(
      `@atproto/lex is not installed at ${lexEntry}; run \`npm install\` first.`,
    );
  }
  const lexicons = readLexicons();
  const permissionSets = lexicons
    .filter((doc) => doc?.defs?.main?.type === "permission-set")
    .map((doc) => doc.id)
    .sort(byCodeUnit);

  execFileSync(
    process.execPath,
    [
      lexEntry,
      "build",
      "--lexicons",
      lexiconsDir,
      "--out",
      outDir,
      "--clear",
      "--index-file",
      ...(permissionSets.length > 0 ? ["--exclude", ...permissionSets] : []),
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );

  const records = lexicons.filter((doc) => doc?.defs?.main?.type === "record");
  console.log(
    `✅ Generated generated/records/ (${records.length} records, ${lexicons.length - permissionSets.length} lexicons)`,
  );
}

main();
