#!/usr/bin/env node
/**
 * Auto-generates generated/exports.ts from lexicon JSON files and generated types.
 *
 * This script scans the lexicons/ directory and creates:
 * - Import statements for all lexicon JSON files
 * - Re-exports HYPERCERTS_SCHEMAS (from generated/lexicons.js) for all lexicons
 * - Re-exports HYPERCERTS_NSIDS (from generated/lexicons.js) for NSIDs
 * - Re-exports for individual lexicons
 * - Re-exports for all generated type namespaces
 * - Re-exports for core utilities from generated code
 *
 * Run this after adding/removing lexicon JSON files to keep generated/exports.ts in sync.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, relative, parse } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const lexiconsDir = join(projectRoot, "lexicons");

/**
 * Recursively find all JSON files in a directory
 */
function findJsonFiles(dir, baseDir = dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findJsonFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      const relativePath = relative(baseDir, fullPath);
      results.push(relativePath);
    }
  }

  return results;
}

/**
 * Convert file path to import name for raw JSON (UPPERCASE constant)
 * e.g., "app/certified/location.json" -> "LOCATION_LEXICON_JSON"
 * e.g., "app/certified/badge/award.json" -> "BADGE_AWARD_LEXICON_JSON"
 * e.g., "com/atproto/repo/strongRef.json" -> "STRONGREF_LEXICON_JSON"
 */
function pathToImportName(filePath) {
  const parsed = parse(filePath);
  const baseName = parsed.name;
  const parentDir = dirname(filePath);

  // Special case for 'defs' files - include parent directory
  if (baseName === "defs") {
    const parentName = parentDir.split("/").pop();
    return `${parentName.toUpperCase()}_DEFS_LEXICON_JSON`;
  }

  // For external lexicons (com.atproto.*), use just the base name
  if (filePath.startsWith("com/")) {
    return `${baseName.toUpperCase()}_LEXICON_JSON`;
  }

  // For files in subdirectories, include the subdirectory name
  if (parentDir.includes("/")) {
    const parts = parentDir.split("/");
    const lastDir = parts[parts.length - 1];

    // If it's a meaningful subdirectory (not just namespace)
    if (lastDir !== "claim" && lastDir !== "certified") {
      return `${lastDir.toUpperCase()}_${baseName.toUpperCase()}_LEXICON_JSON`;
    }
  }

  return `${baseName.toUpperCase()}_LEXICON_JSON`;
}

/**
 * Convert import name to lexicon doc constant name
 * e.g., "ACTIVITY_LEXICON_JSON" -> "ACTIVITY_LEXICON_DOC"
 */
function importNameToLexiconDocName(importName) {
  return importName.replace(/_JSON$/, "_DOC");
}

/**
 * Convert import name to NSID constant name
 * e.g., "ACTIVITY_LEXICON_JSON" -> "ACTIVITY_NSID"
 */
function importNameToNsidName(importName) {
  return importName.replace(/_LEXICON_JSON$/, "_NSID");
}

/**
 * Convert import name to friendly key for HYPERCERTS_NSIDS object
 * e.g., "ACTIVITY_LEXICON_JSON" -> "ACTIVITY"
 * e.g., "BADGE_AWARD_LEXICON_JSON" -> "BADGE_AWARD"
 */
function importNameToFriendlyKey(importName) {
  return importName.replace(/_LEXICON_JSON$/, "");
}

/**
 * Convert file path to namespace export name
 * e.g., "app/certified/location.json" -> "AppCertifiedLocation"
 */
function pathToNamespace(filePath) {
  const withoutExt = filePath.replace(/\.json$/, "");
  const parts = withoutExt.split("/");

  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Convert file path to generated type path
 * e.g., "app/certified/location.json" -> "./types/app/certified/location.js"
 */
function pathToGeneratedType(filePath) {
  const withoutExt = filePath.replace(/\.json$/, "");
  return `./types/${withoutExt}.js`;
}

/**
 * Read lexicon NSID from JSON file
 */
function readNsid(filePath) {
  const fullPath = join(lexiconsDir, filePath);
  const content = readFileSync(fullPath, "utf-8");
  const lexicon = JSON.parse(content);
  return lexicon.lexicon === 1 ? lexicon.id : null;
}

/**
 * Generate generated/exports.ts content
 */
function generateIndex() {
  const jsonFiles = findJsonFiles(lexiconsDir).sort();

  const lexicons = jsonFiles.map((filePath) => ({
    path: filePath,
    importName: pathToImportName(filePath),
    namespace: pathToNamespace(filePath),
    generatedTypePath: pathToGeneratedType(filePath),
    nsid: readNsid(filePath),
  }));

  // Filter out lexicons without NSIDs (should be rare)
  const validLexicons = lexicons.filter((lex) => lex.nsid);

  // Build the file content
  const lines = [];

  // Auto-generation warning header
  const timestamp = new Date().toISOString();
  lines.push(`/**`);
  lines.push(` * @file Auto-generated exports for hypercert lexicons`);
  lines.push(` *`);
  lines.push(` * ⚠️  DO NOT EDIT THIS FILE MANUALLY ⚠️`);
  lines.push(` *`);
  lines.push(
    ` * This file is automatically generated by scripts/generate-exports.js`,
  );
  lines.push(` * Generated: ${timestamp}`);
  lines.push(` *`);
  lines.push(` * To regenerate this file, run:`);
  lines.push(` *   npm run gen-api`);
  lines.push(` * or:`);
  lines.push(` *   npm run gen-index`);
  lines.push(` *`);
  lines.push(` * ---`);
  lines.push(` *`);
  lines.push(` * Hypercert lexicon definitions for AT Protocol.`);
  lines.push(` *`);
  lines.push(` * This module exports the lexicon documents, collection names,`);
  lines.push(
    ` * and generated TypeScript types for all hypercert-related record types.`,
  );
  lines.push(` *`);
  lines.push(` * @packageDocumentation`);
  lines.push(` */`);
  lines.push(``);

  lines.push(`import { lexicons } from "./lexicons.js";`);
  lines.push(``);

  // Imports
  for (const lex of validLexicons) {
    lines.push(
      `import ${lex.importName} from "../lexicons/${lex.path.replace(/\\/g, "/")}";`,
    );
  }

  // Re-export individual lexicons
  lines.push(``);
  lines.push(`// Re-export individual lexicon JSON objects for direct access`);
  lines.push(`export {`);
  for (const lex of validLexicons) {
    lines.push(`  ${lex.importName},`);
  }
  lines.push(`};`);
  lines.push(``);

  // Re-export core utilities
  lines.push(`// Re-export lexicon schemas, validation, and IDs`);
  lines.push(`export {`);
  lines.push(`  schemas as HYPERCERTS_SCHEMAS,`);
  lines.push(`  schemaDict as HYPERCERTS_SCHEMA_DICT,`);
  lines.push(`  lexicons,`);
  lines.push(`  validate,`);
  lines.push(
    `  ids as HYPERCERTS_NSIDS_BY_TYPE, // NSID constants mapped to type namespaces`,
  );
  lines.push(`} from "./lexicons.js";`);
  lines.push(``);

  // Export individual NSID constants (defined first so they can be used below)
  lines.push(`// Individual NSID constants`);
  for (const lex of validLexicons) {
    const constName = importNameToNsidName(lex.importName);
    lines.push(`export const ${constName} = "${lex.nsid}" as const;`);
  }
  lines.push(``);

  // Generate HYPERCERTS_NSIDS object (dynamically from discovered lexicons)
  lines.push(`/**`);
  lines.push(` * Collection NSIDs organized by semantic record type.`);
  lines.push(` *`);
  lines.push(
    ` * Use these constants when performing record operations to ensure`,
  );
  lines.push(` * correct collection names.`);
  lines.push(` */`);
  lines.push(`export const HYPERCERTS_NSIDS = {`);

  for (const lex of validLexicons) {
    const friendlyKey = importNameToFriendlyKey(lex.importName);
    const nsidConstName = importNameToNsidName(lex.importName);
    lines.push(`  ${friendlyKey}: ${nsidConstName},`);
  }

  lines.push(`} as const;`);
  lines.push(``);

  // Generate HYPERCERTS_LEXICON_JSON object (dynamically from discovered lexicons)
  lines.push(`/**`);
  lines.push(` * Lexicon JSON objects organized by semantic record type.`);
  lines.push(` */`);
  lines.push(`export const HYPERCERTS_LEXICON_JSON = {`);

  for (const lex of validLexicons) {
    const friendlyKey = importNameToFriendlyKey(lex.importName);
    lines.push(`  ${friendlyKey}: ${lex.importName},`);
  }

  lines.push(`} as const;`);
  lines.push(``);

  // Export individual lexicon objects from the lexicons instance
  lines.push(`// Individual lexicon objects (typed, from lexicons.get())`);
  for (const lex of validLexicons) {
    const docName = importNameToLexiconDocName(lex.importName);
    const nsidName = importNameToNsidName(lex.importName);
    lines.push(`export const ${docName} = lexicons.get(${nsidName})!;`);
  }
  lines.push(``);

  // Generate HYPERCERTS_LEXICON_DOC object (dynamically from discovered lexicons)
  lines.push(`/**`);
  lines.push(` * Lexicon document objects organized by semantic record type.`);
  lines.push(` */`);
  lines.push(`export const HYPERCERTS_LEXICON_DOC = {`);

  for (const lex of validLexicons) {
    const friendlyKey = importNameToFriendlyKey(lex.importName);
    const docName = importNameToLexiconDocName(lex.importName);
    lines.push(`  ${friendlyKey}: ${docName},`);
  }

  lines.push(`} as const;`);
  lines.push(``);

  // Re-export type namespaces
  lines.push(`// Re-export generated types as namespaces (avoiding conflicts)`);
  for (const lex of validLexicons) {
    lines.push(`export * as ${lex.namespace} from "${lex.generatedTypePath}";`);
  }
  lines.push(``);

  lines.push(`// Re-export utilities`);
  lines.push(`export * from "./util.js";`);

  return lines.join("\n") + "\n";
}

// Main execution
async function main() {
  try {
    const content = generateIndex();
    const outputPath = join(projectRoot, "generated", "exports.ts");
    writeFileSync(outputPath, content, "utf-8");

    // Format the generated file with Prettier
    try {
      execSync(`npx prettier --write "${outputPath}"`, { stdio: "ignore" });
      console.log(`✅ Generated and formatted ${outputPath}`);
    } catch (formatError) {
      console.log(
        `✅ Generated ${outputPath} (formatting failed: ${formatError})`,
      );
    }
  } catch (error) {
    console.error("❌ Error generating index:", error);
    process.exit(1);
  }
}

main();
