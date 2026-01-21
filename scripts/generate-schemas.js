#!/usr/bin/env node
/**
 * Auto-generates SCHEMAS.md from lexicon JSON files.
 * Automatically discovers lexicons and calculates optimal table widths.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const lexiconsDir = join(projectRoot, "lexicons");

// File system utilities
function findJsonFiles(dir, baseDir = dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findJsonFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      results.push(relative(baseDir, fullPath));
    }
  }

  return results;
}

function readLexicon(filePath) {
  const fullPath = join(lexiconsDir, filePath);
  const content = readFileSync(fullPath, "utf-8");
  return JSON.parse(content);
}

// Type and metadata extraction
function getTypeString(prop) {
  if (!prop.type) return "unknown";
  if (prop.type === "array") {
    return prop.items?.type === "ref" ? "ref" : prop.items?.type || "array";
  }
  return prop.type;
}

function getComments(prop) {
  const comments = [];
  if (prop.maxLength) comments.push(`maxLength: ${prop.maxLength}`);
  if (prop.maxGraphemes) comments.push(`maxGraphemes: ${prop.maxGraphemes}`);
  if (prop.maxSize) comments.push(`maxSize: ${prop.maxSize}`);
  if (prop.accept?.length > 0)
    comments.push(`accepts: ${prop.accept.join(", ")}`);
  if (prop.knownValues) {
    comments.push(
      `Known values: ${prop.knownValues.map((v) => `\`${v}\``).join(", ")}`,
    );
  }
  return comments.join(", ");
}

function extractPropertyRows(record, required = [], localDefs = null) {
  const props = record.properties;
  if (!props) return [];

  return Object.entries(props).map(([name, prop]) => {
    let description = (prop.description || "").trim();

    // For local refs, look up description from defs
    if (prop.type === "ref" && prop.ref?.startsWith("#") && localDefs) {
      const refName = prop.ref.substring(1);
      description = (localDefs[refName]?.description || description).trim();
    }

    return {
      name,
      type: getTypeString(prop),
      required: required?.includes(name) ? "yes" : "no",
      description,
      comments: getComments(prop),
    };
  });
}

// Table rendering with auto-calculated widths
function calculateColumnWidths(rows, headers) {
  const widths = headers.map((h) => h.length);

  for (const row of rows) {
    const values = [
      `\`${row.name}\``,
      `\`${row.type}\``,
      row.required,
      row.description,
    ];
    if (row.comments !== undefined) {
      values.push(row.comments);
    }

    values.forEach((val, i) => {
      if (i < widths.length) {
        widths[i] = Math.max(widths[i], val.length);
      }
    });
  }

  return widths;
}

function pad(str, length) {
  return str + " ".repeat(Math.max(0, length - str.length));
}

function formatRow(cells, widths) {
  return "| " + cells.map((cell, i) => pad(cell, widths[i])).join(" | ") + " |";
}

function formatSeparatorRow(headers, widths) {
  const separators = widths.map((w) => "-".repeat(w));
  return `| ${separators.join(" | ")} |`;
}

function renderTable(rows, includeComments = false) {
  if (rows.length === 0) return [];

  const headers = includeComments
    ? ["Property", "Type", "Required", "Description", "Comments"]
    : ["Property", "Type", "Required", "Description"];

  const widths = calculateColumnWidths(rows, headers);
  const output = [
    formatRow(headers, widths),
    formatSeparatorRow(headers, widths),
  ];

  for (const row of rows) {
    const cells = [
      `\`${row.name}\``,
      `\`${row.type}\``,
      row.required,
      row.description,
    ];
    if (includeComments) {
      cells.push(row.comments || "");
    }
    output.push(formatRow(cells, widths));
  }

  return output;
}

// Lexicon categorization and naming
function categorizeLexicons(lexicons) {
  const categories = {
    certified: [],
    hypercerts: [],
    external: [],
  };

  for (const lex of lexicons) {
    const id = lex.data.id;
    if (id.startsWith("app.certified.")) {
      categories.certified.push(lex);
    } else if (id.startsWith("org.hypercerts.")) {
      categories.hypercerts.push(lex);
    } else {
      categories.external.push(lex);
    }
  }

  return categories;
}

// Section generators
function generateDefsSection(lexicon) {
  const defs = Object.entries(lexicon.data.defs)
    .filter(([name]) => name !== "main")
    .map(([name, def]) => ({
      name,
      type: def.type || "unknown",
      description: def.description || "",
    }));

  if (defs.length === 0) return [];

  const defComments = {
    smallBlob: "Has `blob` property (blob, up to 10MB)",
    largeBlob: "Has `blob` property (blob, up to 100MB)",
    smallImage: "Has `image` property (blob, up to 5MB)",
    largeImage: "Has `image` property (blob, up to 10MB)",
    uri: "Has `uri` property (string, format uri)",
  };

  const headers = ["Def", "Type", "Description", "Comments"];
  const rows = defs.map((d) => [
    `\`${d.name}\``,
    `\`${d.type}\``,
    d.description,
    defComments[d.name] || "",
  ]);

  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => r[i].length)),
  );

  const output = [
    "#### Defs",
    "",
    formatRow(headers, widths),
    formatSeparatorRow(headers, widths),
  ];

  for (const row of rows) {
    output.push(formatRow(row, widths));
  }

  return output;
}

function generateLexiconSection(lexicon, isFirst = false) {
  const output = [];
  const id = lexicon.data.id;
  const mainDef = lexicon.data.defs?.main;

  if (!isFirst) {
    output.push("---", "");
  }

  output.push(`### \`${id}\``, "");

  // Special case: org.hypercerts.defs has no main, only defs
  if (id === "org.hypercerts.defs") {
    output.push(
      "**Description:** Common type definitions used across all certified protocols.",
      "",
    );
    const defsOutput = generateDefsSection(lexicon);
    output.push(...defsOutput);
    output.push("");
    return output;
  }

  if (!mainDef) return output;

  if (mainDef.description) {
    output.push(`**Description:** ${mainDef.description}`, "");
  }

  // Determine key type
  const keyType = mainDef.key || "tid";
  output.push(`**Key:** \`${keyType}\``, "");

  // Standard properties table
  if (mainDef.record) {
    output.push("#### Properties", "");
    const required = mainDef.record.required || [];
    const rows = extractPropertyRows(
      mainDef.record,
      required,
      lexicon.data.defs,
    );

    if (rows.length > 0) {
      const hasComments = rows.some((r) => r.comments);
      output.push(...renderTable(rows, hasComments));
    }
  }

  // Handle additional defs (beyond main)
  const additionalDefs = Object.entries(lexicon.data.defs || {})
    .filter(([name]) => name !== "main")
    .filter(([, def]) => def.type === "object" && def.properties);

  if (additionalDefs.length > 0) {
    output.push("", "#### Defs", "");
    for (const [defName, defData] of additionalDefs) {
      output.push(`##### ${defName}`, "");
      const defRows = extractPropertyRows(defData, defData.required || []);
      if (defRows.length > 0) {
        output.push(...renderTable(defRows, false));
      }
    }
  }

  output.push("");
  return output;
}

function generateMarkdown() {
  const jsonFiles = findJsonFiles(lexiconsDir).sort();
  const lexicons = jsonFiles.map((path) => ({
    path,
    data: readLexicon(path),
  }));

  const categories = categorizeLexicons(lexicons);

  const output = [
    "# Schema Reference",
    "",
    "> This file is auto-generated from lexicon definitions.",
    "> Do not edit manually.",
    "",
  ];

  // Hypercerts Lexicons (main lexicons come first)
  if (categories.hypercerts.length > 0) {
    output.push("## Hypercerts Lexicons", "");
    output.push(
      "Hypercerts-specific lexicons for tracking impact work and claims.",
      "",
    );

    const hypercertsOrder = [
      "org.hypercerts.claim.activity",
      "org.hypercerts.claim.contribution",
      "org.hypercerts.claim.evaluation",
      "org.hypercerts.claim.evidence",
      "org.hypercerts.claim.measurement",
      "org.hypercerts.claim.collection",
      "org.hypercerts.claim.collection.project",
      "org.hypercerts.claim.rights",
      "org.hypercerts.funding.receipt",
    ];

    let isFirst = true;
    for (const id of hypercertsOrder) {
      const lex = lexicons.find((l) => l.data.id === id);
      if (lex) {
        output.push(...generateLexiconSection(lex, isFirst));
        isFirst = false;
      }
    }
  }

  // Certified Lexicons (common/shared lexicons come after)
  if (categories.certified.length > 0) {
    output.push("---", "", "## Certified Lexicons", "");
    output.push(
      "Certified lexicons are common/shared lexicons that can be used across multiple protocols.",
      "",
    );

    // Define desired order for certified lexicons
    const certifiedOrder = [
      "org.hypercerts.defs",
      "app.certified.location",
      "app.certified.badge.definition",
      "app.certified.badge.award",
      "app.certified.badge.response",
    ];

    let isFirst = true;
    for (const id of certifiedOrder) {
      const lex = lexicons.find((l) => l.data.id === id);
      if (lex) {
        output.push(...generateLexiconSection(lex, isFirst));
        isFirst = false;
      }
    }
  }

  // Notes section
  output.push("---", "", "## Notes", "");
  const notes = [
    "All timestamps use the `datetime` format (ISO 8601)",
    "Strong references (`com.atproto.repo.strongRef`) include both the URI and CID of the referenced record",
    "Union types allow multiple possible formats (e.g., URI or blob)",
    "Array items may have constraints like `maxLength` to limit the number of elements",
    "String fields may have both `maxLength` (bytes) and `maxGraphemes` (Unicode grapheme clusters) constraints",
  ];
  output.push(...notes.map((note) => `- ${note}`));

  return output.join("\n") + "\n";
}

async function main() {
  try {
    const content = generateMarkdown();
    const outputPath = join(projectRoot, "SCHEMAS.md");
    writeFileSync(outputPath, content, "utf-8");
    console.log(`✅ Generated ${outputPath}`);
  } catch (error) {
    console.error("❌ Error generating SCHEMAS.md:", error);
    process.exit(1);
  }
}

main();
