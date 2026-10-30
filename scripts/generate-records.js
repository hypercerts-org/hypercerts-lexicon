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
 * - Puts lex's exports and imports in a fixed order, because lex's output
 *   otherwise depends on the order the file system lists files in.
 *
 * The legacy `lex` CLI (@atproto/lex-cli) also installs a `lex` binary, so
 * this script runs @atproto/lex's own entry point directly.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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

/** Order of the export forms lex writes in namespace modules. */
const exportRank = (line) =>
  line.startsWith("export * as ") ? 2 : line.startsWith("export {") ? 1 : 0;

/**
 * Puts the lines lex writes in a fixed order. lex reads lexicon files in the
 * order the file system lists them, which differs between machines, and that
 * order leaks into its output: the exports of namespace modules and the
 * imports of `.defs` modules. Namespace modules get a record's own exports
 * first, then the child namespaces by name; `.defs` modules import their
 * dependencies by name.
 */
function normalize(source, isDefs) {
  const lines = source.split("\n");
  if (isDefs) {
    const start = lines.findIndex((line) => line.startsWith("import * as "));
    if (start === -1) return source;
    let end = start;
    while (lines[end]?.startsWith("import * as ")) end++;
    const imports = lines.slice(start, end).sort(byCodeUnit);
    return [...lines.slice(0, start), ...imports, ...lines.slice(end)].join(
      "\n",
    );
  }
  const first = lines.findIndex((line) => line.startsWith("export "));
  if (first === -1) return source;
  const rest = lines.slice(first).filter((line) => line !== "");
  if (rest.some((line) => !line.startsWith("export "))) {
    throw new Error("Unexpected namespace module layout from @atproto/lex");
  }
  rest.sort((a, b) => exportRank(a) - exportRank(b) || byCodeUnit(a, b));
  return [...lines.slice(0, first), ...rest, ""].join("\n");
}

/** Applies normalize() to every generated module. */
function normalizeOutput(dir) {
  const files = readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => join(entry.parentPath, entry.name));
  for (const file of files) {
    const source = readFileSync(file, "utf-8");
    const normalized = normalize(source, file.endsWith(".defs.ts"));
    if (normalized !== source) writeFileSync(file, normalized);
  }
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
  normalizeOutput(outDir);

  const records = lexicons.filter((doc) => doc?.defs?.main?.type === "record");
  console.log(
    `✅ Generated generated/records/ (${records.length} records, ${lexicons.length - permissionSets.length} lexicons)`,
  );
}

main();
