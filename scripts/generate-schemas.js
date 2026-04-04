#!/usr/bin/env node
/**
 * Auto-generates SCHEMAS.md from lexicon JSON files.
 * Automatically discovers lexicons and calculates optimal table widths.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import stringWidth from "string-width";

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
    const itemType =
      prop.items?.type === "ref" ? "ref" : prop.items?.type || "unknown";
    return `${itemType}[]`;
  }
  return prop.type;
}

function getComments(prop) {
  const comments = [];
  if (prop.maxLength) comments.push(`maxLength: ${prop.maxLength}`);
  if (prop.maxGraphemes) comments.push(`maxGraphemes: ${prop.maxGraphemes}`);
  if (prop.maxSize) comments.push(`maxSize: ${prop.maxSize}`);
  if (prop.accept?.length > 0)
    comments.push(`accepts: ${prop.accept.map((a) => `\`${a}\``).join(", ")}`);
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
      required: required?.includes(name) ? "✅" : "❌",
      description,
      comments: getComments(prop),
    };
  });
}

// Table rendering with auto-calculated widths
function calculateColumnWidths(rows, headers) {
  const widths = headers.map((h) => getVisualWidth(h));

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
        widths[i] = Math.max(widths[i], getVisualWidth(val));
      }
    });
  }

  return widths;
}

/**
 * Get the visual/display width of a string in a monospace terminal.
 * Uses the string-width package which properly handles emojis, full-width characters, etc.
 */
function getVisualWidth(str) {
  return stringWidth(str);
}

function pad(str, length) {
  const visualWidth = getVisualWidth(str);
  return str + " ".repeat(Math.max(0, length - visualWidth));
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
    defs: {
      title: "Type Definitions",
      description: "Common type definitions used across all protocols.",
      lexicons: [],
      ordering: (lex) => lex.data.id,
    },
    hypercerts: {
      title: "Hypercerts Lexicons",
      description:
        "Hypercerts-specific lexicons for tracking impact work and claims.",
      lexicons: [],
      ordering: (lex) => lex.data.id,
    },
    certified: {
      title: "Certified Lexicons",
      description:
        "Certified lexicons are common/shared lexicons that can be used across multiple protocols.",
      lexicons: [],
      ordering: (lex) => {
        const order = [
          "app.certified.location",
          "app.certified.badge.definition",
          "app.certified.badge.award",
          "app.certified.badge.response",
        ];
        const index = order.indexOf(lex.data.id);
        return index === -1 ? 999 : index;
      },
    },
    external: {
      title: "External Lexicons",
      description: "External lexicons from other protocols and systems.",
      lexicons: [],
      ordering: (lex) => lex.data.id,
    },
  };

  for (const lex of lexicons) {
    const id = lex.data.id;
    if (id === "org.hypercerts.defs" || id === "app.certified.defs") {
      categories.defs.lexicons.push(lex);
    } else if (id.startsWith("app.certified.")) {
      categories.certified.lexicons.push(lex);
    } else if (id.startsWith("org.hypercerts.")) {
      categories.hypercerts.lexicons.push(lex);
    } else {
      categories.external.lexicons.push(lex);
    }
  }

  return categories;
}

// Section generators
function generateLexiconHeader(lexicon, isFirst) {
  const output = [];
  const id = lexicon.data.id;

  if (!isFirst) {
    output.push("---", "");
  }

  output.push(`### \`${id}\``, "");
  return output;
}

function generateDescription(description) {
  return description ? [`**Description:** ${description}`, ""] : [];
}

function generateMainSection(mainDef, lexicon) {
  const output = [];

  if (!mainDef) return output;

  output.push(...generateDescription(mainDef.description));

  // Object types (e.g., celExpression) have no record key
  if (mainDef.type === "record") {
    const keyType = mainDef.key || "tid";
    output.push(`**Key:** \`${keyType}\``, "");
  }

  // Determine where properties live: record types nest under main.record,
  // object types have properties directly on main
  const propsSource = mainDef.record || mainDef;
  const hasProperties = propsSource.properties !== undefined;

  if (hasProperties) {
    output.push("#### Properties", "");
    const required = propsSource.required || [];
    const rows = extractPropertyRows(propsSource, required, lexicon.data.defs);

    if (rows.length > 0) {
      const hasComments = rows.some((r) => r.comments);
      output.push(...renderTable(rows, hasComments));
    }
  }

  return { output, hasProperties };
}

function generateAdditionalDefsSection(lexicon, hasPropertiesBefore = false) {
  const output = [];

  const additionalDefs = Object.entries(lexicon.data.defs || {})
    .filter(([name]) => name !== "main")
    .filter(([, def]) => def.type === "object" && def.properties);

  if (additionalDefs.length === 0) return output;

  // Add leading blank if there were properties before this section
  if (hasPropertiesBefore) {
    output.push("");
  }

  output.push("#### Defs", "");

  additionalDefs.forEach(([defName, defData], index) => {
    output.push(`##### \`${lexicon.data.id}#${defName}\``);
    if (defData.description) {
      output.push("", defData.description);
    }
    output.push("");
    const defRows = extractPropertyRows(
      defData,
      defData.required || [],
      lexicon.data.defs,
    );
    if (defRows.length > 0) {
      output.push(...renderTable(defRows, false));
      // Add blank line after table only if not the last def
      if (index < additionalDefs.length - 1) {
        output.push("");
      }
    }
  });

  return output;
}

function generateLexiconSection(lexicon, isFirst = false) {
  const output = [];
  const mainDef = lexicon.data.defs?.main;

  output.push(...generateLexiconHeader(lexicon, isFirst));

  // Use lexicon description if no main, otherwise use main's description
  let hasProperties = false;
  if (mainDef) {
    const mainResult = generateMainSection(mainDef, lexicon);
    output.push(...mainResult.output);
    hasProperties = mainResult.hasProperties;
  } else {
    output.push(...generateDescription(lexicon.data.description));
  }

  // Always generate additional defs (this handles defs-only lexicons too)
  const additionalDefs = generateAdditionalDefsSection(lexicon, hasProperties);
  output.push(...additionalDefs);

  // Add trailing blank unless we end with just description/key (no tables)
  const hasAdditionalDefs = additionalDefs.length > 0;
  if (hasProperties || hasAdditionalDefs) {
    output.push("");
  }

  return output;
}

function generateCategoryMarkdown(
  category,
  allLexicons,
  emittedIds,
  isFirstCategory = false,
) {
  const output = [];

  if (!isFirstCategory) {
    output.push("---", "");
  }

  output.push(`## ${category.title}`, "");
  output.push(category.description, "");

  // Sort lexicons according to the category's ordering function
  const orderedLexicons = [...category.lexicons].sort((a, b) => {
    const aOrder = category.ordering(a);
    const bOrder = category.ordering(b);
    if (typeof aOrder === "string" && typeof bOrder === "string") {
      return aOrder.localeCompare(bOrder);
    }
    return aOrder - bOrder;
  });

  let isFirst = true;
  for (const lex of orderedLexicons) {
    if (lex && !emittedIds.has(lex.data.id)) {
      output.push(...generateLexiconSection(lex, isFirst));
      emittedIds.add(lex.data.id);
      isFirst = false;
    }
  }

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

  // Track emitted schema IDs to ensure no duplicates
  const emittedIds = new Set();

  // Generate sections for each category in order
  const categoryOrder = ["hypercerts", "certified", "defs", "external"];
  let isFirstCategory = true;

  for (const categoryKey of categoryOrder) {
    const category = categories[categoryKey];
    if (category.lexicons.length === 0) continue;

    output.push(
      ...generateCategoryMarkdown(
        category,
        lexicons,
        emittedIds,
        isFirstCategory,
      ),
    );
    isFirstCategory = false;
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
