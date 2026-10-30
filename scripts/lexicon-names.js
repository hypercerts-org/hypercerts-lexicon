/**
 * Naming helpers shared by the code generators (generate-exports.js and
 * generate-records.js), so the same lexicon gets the same name in every
 * export surface of the package.
 */

import { dirname, parse } from "node:path";

/**
 * Split camelCase string into parts with underscores
 * e.g., "contributionDetails" -> "contribution_Details"
 */
export function splitCamelCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2");
}

/**
 * Convert file path to import name for raw JSON (UPPERCASE constant)
 * e.g., "app/certified/location.json" -> "LOCATION_LEXICON_JSON"
 * e.g., "app/certified/badge/award.json" -> "BADGE_AWARD_LEXICON_JSON"
 * e.g., "com/atproto/repo/strongRef.json" -> "STRONG_REF_LEXICON_JSON"
 * e.g., "org/hypercerts/claim/contributionDetails.json" -> "CONTRIBUTION_DETAILS_LEXICON_JSON"
 */
export function pathToImportName(filePath) {
  const parsed = parse(filePath);
  const baseName = parsed.name;
  const parentDir = dirname(filePath);

  // Special case for 'defs' files - include parent directory
  if (baseName === "defs") {
    const parentName = parentDir.split("/").pop();
    return `${parentName.toUpperCase()}_DEFS_LEXICON_JSON`;
  }

  // For external lexicons (com.atproto.*, app.bsky.*, pub.leaflet.*),
  // use enough path segments to avoid collisions between namespaces
  if (
    filePath.startsWith("com/") ||
    filePath.startsWith("app/bsky/") ||
    filePath.startsWith("pub/")
  ) {
    const parts = parentDir.split("/");
    // Use last two meaningful path segments + baseName for disambiguation
    // e.g., app/bsky/richtext/facet -> BSKY_RICHTEXT_FACET
    //        pub/leaflet/richtext/facet -> LEAFLET_RICHTEXT_FACET
    //        pub/leaflet/blocks/text -> LEAFLET_BLOCKS_TEXT
    //        com/atproto/repo/strongRef -> STRONG_REF (keep existing behavior)
    if (filePath.startsWith("com/")) {
      return `${splitCamelCase(baseName).toUpperCase()}_LEXICON_JSON`;
    }
    const prefix = parts.slice(1).join("_"); // skip top-level (app/pub/com)
    return `${prefix.toUpperCase()}_${splitCamelCase(baseName).toUpperCase()}_LEXICON_JSON`;
  }

  // For files in subdirectories, include the subdirectory name
  if (parentDir.includes("/")) {
    const parts = parentDir.split("/");
    const lastDir = parts[parts.length - 1];

    // If it's a meaningful subdirectory (not just namespace)
    if (
      lastDir !== "claim" &&
      lastDir !== "certified" &&
      lastDir !== "helper"
    ) {
      return `${lastDir.toUpperCase()}_${splitCamelCase(baseName).toUpperCase()}_LEXICON_JSON`;
    }
  }

  return `${splitCamelCase(baseName).toUpperCase()}_LEXICON_JSON`;
}

/**
 * Convert file path to namespace export name
 * e.g., "app/certified/location.json" -> "AppCertifiedLocation"
 */
export function pathToNamespace(filePath) {
  const withoutExt = filePath.replace(/\.json$/, "");
  const parts = withoutExt.split("/");

  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
