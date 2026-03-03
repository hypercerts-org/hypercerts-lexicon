#!/usr/bin/env node

/**
 * Lexicon Style Guide Checker
 *
 * This script checks all lexicon JSON files against the ATProto Lexicon Style Guide.
 * It validates naming conventions, descriptions, constraints, and other best practices.
 *
 * Usage: node scripts/check-lexicon-style.js [--fix] [--verbose]
 *
 * Options:
 *   --fix: Automatically fix some issues (not yet implemented)
 *   --verbose: Show detailed output for passing checks
 *   --json: Output results as JSON
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  fix: args.includes("--fix"),
  verbose: args.includes("--verbose"),
  json: args.includes("--json"),
};

// Style guide rules and their severity levels
const SEVERITY = {
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

const SEVERITY_ICONS = {
  [SEVERITY.ERROR]: "❌",
  [SEVERITY.WARNING]: "⚠️",
  [SEVERITY.INFO]: "ℹ️",
};

const SEPARATOR = "═══════════════════════════════════════════════════════\n";

class StyleChecker {
  constructor(options = {}) {
    this.options = options;
    this.results = {
      files: [],
      totalIssues: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
    };
    this.lexiconIndex = new Map(); // Map of lexicon ID to parsed lexicon
  }

  /**
   * Load all lexicons into an index for ref resolution
   */
  buildLexiconIndex(dir) {
    const files = this.findLexiconFiles(dir);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, "utf-8");
        const lexicon = JSON.parse(content);
        if (lexicon.id) {
          this.lexiconIndex.set(lexicon.id, lexicon);
        }
      } catch (_error) {
        // Skip files that can't be parsed - they'll be caught in checkFile
      }
    }
  }

  /**
   * Check all lexicon files in a directory
   */
  async checkDirectory(dir) {
    // First, build an index of all lexicons
    this.buildLexiconIndex(dir);

    const files = this.findLexiconFiles(dir);

    for (const file of files) {
      await this.checkFile(file);
    }

    return this.results;
  }

  /**
   * Find all lexicon JSON files recursively
   */
  findLexiconFiles(dir) {
    const files = [];

    const scan = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".json")) {
          files.push(fullPath);
        }
      }
    };

    scan(dir);
    return files;
  }

  /**
   * Check a single lexicon file
   */
  async checkFile(filePath) {
    const fileResult = {
      path: filePath,
      issues: [],
    };

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const lexicon = JSON.parse(content);

      // Skip style checks for third-party and standard ATProto lexicons
      if (
        lexicon.id &&
        (lexicon.id.startsWith("pub.leaflet.") ||
          lexicon.id.startsWith("app.bsky.") ||
          lexicon.id.startsWith("com.atproto."))
      ) {
        return;
      }

      // Run all checks
      this.checkLexiconId(lexicon, fileResult);
      this.checkLexiconDescription(lexicon, fileResult);
      this.checkDefinitions(lexicon, fileResult);

      // Update counts
      for (const issue of fileResult.issues) {
        this.results.totalIssues++;
        if (issue.severity === SEVERITY.ERROR) this.results.errorCount++;
        if (issue.severity === SEVERITY.WARNING) this.results.warningCount++;
        if (issue.severity === SEVERITY.INFO) this.results.infoCount++;
      }

      this.results.files.push(fileResult);
    } catch (error) {
      fileResult.issues.push({
        severity: SEVERITY.ERROR,
        rule: "parse-error",
        message: `Failed to parse lexicon file: ${error.message}`,
        location: "file",
      });
      this.results.files.push(fileResult);
      this.results.totalIssues++;
      this.results.errorCount++;
    }
  }

  /**
   * Check lexicon ID (NSID) follows conventions
   */
  checkLexiconId(lexicon, fileResult) {
    if (!lexicon.id) {
      fileResult.issues.push({
        severity: SEVERITY.ERROR,
        rule: "lexicon-id-required",
        message: "Lexicon must have an 'id' field",
        location: "lexicon.id",
      });
      return;
    }

    const id = lexicon.id;

    // Check format (reverse DNS with camelCase allowed in segments)
    if (!/^[a-z][a-z0-9]*(\.[a-z][a-zA-Z0-9]*)+$/.test(id)) {
      fileResult.issues.push({
        severity: SEVERITY.ERROR,
        rule: "lexicon-id-format",
        message: `Lexicon ID must be in reverse-DNS format (segments start with lowercase): ${id}`,
        location: "lexicon.id",
      });
    }

    // Check that each segment starts with lowercase and check for generic names
    const segments = id.split(".");
    for (const segment of segments) {
      if (segment.length > 0 && !/^[a-z]/.test(segment)) {
        fileResult.issues.push({
          severity: SEVERITY.ERROR,
          rule: "lexicon-id-segment-start",
          message: `Each segment in lexicon ID must start with lowercase letter: "${segment}" in ${id}`,
          location: "lexicon.id",
        });
      }
    }

    // Check for generic names
    const genericTerms = ["item", "thing", "object", "data", "info"];
    for (const term of genericTerms) {
      if (segments.includes(term)) {
        fileResult.issues.push({
          severity: SEVERITY.WARNING,
          rule: "lexicon-id-generic",
          message: `Avoid generic terms in lexicon ID: "${term}" in ${id}`,
          location: "lexicon.id",
        });
      }
    }
  }

  /**
   * Check lexicon has a description
   */
  checkLexiconDescription(lexicon, fileResult) {
    if (!lexicon.description && !lexicon.defs?.main?.description) {
      fileResult.issues.push({
        severity: SEVERITY.WARNING,
        rule: "lexicon-description",
        message: "Lexicon should have a description (on lexicon or main def)",
        location: "lexicon.description or defs.main.description",
      });
    }
  }

  /**
   * Check all definitions in the lexicon
   */
  checkDefinitions(lexicon, fileResult) {
    if (!lexicon.defs) {
      return;
    }

    for (const [defName, def] of Object.entries(lexicon.defs)) {
      this.checkDefinition(def, `defs.${defName}`, fileResult, lexicon);
    }
  }

  /**
   * Check a single definition
   */
  checkDefinition(def, path, fileResult, lexicon) {
    // Check for description
    if (!def.description) {
      fileResult.issues.push({
        severity: SEVERITY.WARNING,
        rule: "definition-description",
        message: `Definition should have a description`,
        location: `${path}.description`,
      });
    }

    // Check based on type
    if (def.type === "record") {
      this.checkRecordDefinition(def, path, fileResult, lexicon);
    } else if (def.type === "object") {
      this.checkObjectDefinition(def, path, fileResult, lexicon);
    } else if (def.type === "array") {
      this.checkArrayDefinition(def, path, fileResult, lexicon);
    } else if (def.type === "string") {
      this.checkStringDefinition(def, path, fileResult);
    } else if (def.type === "blob") {
      this.checkBlobDefinition(def, path, fileResult);
    }
  }

  /**
   * Check record definition
   */
  checkRecordDefinition(def, path, fileResult, lexicon) {
    // Check key type
    if (!def.key) {
      fileResult.issues.push({
        severity: SEVERITY.ERROR,
        rule: "record-key-required",
        message: "Record must have a 'key' field",
        location: `${path}.key`,
      });
    } else if (def.key !== "any" && def.key !== "tid") {
      fileResult.issues.push({
        severity: SEVERITY.INFO,
        rule: "record-key-type",
        message: `Consider using 'any' for record key (current: ${def.key})`,
        location: `${path}.key`,
      });
    }

    // Check record schema
    if (def.record) {
      this.checkObjectDefinition(
        def.record,
        `${path}.record`,
        fileResult,
        lexicon,
      );
    }
  }

  /**
   * Check object definition
   */
  checkObjectDefinition(obj, path, fileResult, lexicon) {
    if (!obj.properties) {
      return;
    }

    // Check all properties
    for (const [propName, prop] of Object.entries(obj.properties)) {
      // Check property name format (camelCase)
      if (!/^[a-z][a-zA-Z0-9]*$/.test(propName) && propName !== "$type") {
        fileResult.issues.push({
          severity: SEVERITY.ERROR,
          rule: "property-name-camelcase",
          message: `Property name should be camelCase: ${propName}`,
          location: `${path}.properties.${propName}`,
        });
      }

      // Check property description
      if (!prop.description) {
        fileResult.issues.push({
          severity: SEVERITY.WARNING,
          rule: "property-description",
          message: `Property should have a description: ${propName}`,
          location: `${path}.properties.${propName}.description`,
        });
      }

      // Check property type-specific rules
      this.checkProperty(
        prop,
        `${path}.properties.${propName}`,
        fileResult,
        lexicon,
      );
    }

    // Check for createdAt in main records
    if (
      path.includes("defs.main.record") &&
      !obj.properties.createdAt &&
      !obj.properties.updatedAt
    ) {
      fileResult.issues.push({
        severity: SEVERITY.INFO,
        rule: "timestamp-fields",
        message:
          "Consider adding 'createdAt' or 'updatedAt' timestamp field to record",
        location: path,
      });
    }
  }

  /**
   * Check property-specific rules
   */
  checkProperty(prop, path, fileResult, lexicon) {
    if (prop.type === "string") {
      this.checkStringProperty(prop, path, fileResult);
    } else if (prop.type === "blob") {
      this.checkBlobProperty(prop, path, fileResult);
    } else if (prop.type === "array") {
      this.checkArrayProperty(prop, path, fileResult, lexicon);
    } else if (prop.type === "ref") {
      this.checkRefProperty(prop, path, fileResult);
    } else if (prop.type === "union") {
      this.checkUnionProperty(prop, path, fileResult, lexicon);
    }
  }

  /**
   * Check string property
   */
  checkStringProperty(prop, path, fileResult) {
    // Check for maxLength
    if (
      !prop.maxLength &&
      !prop.maxGraphemes &&
      !prop.format &&
      !prop.enum &&
      !prop.knownValues
    ) {
      fileResult.issues.push({
        severity: SEVERITY.WARNING,
        rule: "string-max-length",
        message: "String property should have maxLength or maxGraphemes",
        location: `${path}.maxLength`,
      });
    }

    // Check datetime format
    if (prop.format === "datetime") {
      if (
        !path.includes("createdAt") &&
        !path.includes("updatedAt") &&
        !path.includes("occurredAt") &&
        !path.includes("Date") &&
        !path.includes("Time")
      ) {
        fileResult.issues.push({
          severity: SEVERITY.INFO,
          rule: "datetime-naming",
          message:
            "Datetime fields should have descriptive names (e.g., createdAt, startDate)",
          location: path,
        });
      }
    }

    // Check for format when type is string
    const uriLikeNames = ["uri", "url", "link", "href"];
    const pathSegments = path.split(".");
    const propName =
      pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "";
    if (
      propName &&
      uriLikeNames.includes(propName.toLowerCase()) &&
      prop.format !== "uri"
    ) {
      fileResult.issues.push({
        severity: SEVERITY.WARNING,
        rule: "string-format-uri",
        message: `Property named '${propName}' should probably use format: "uri"`,
        location: `${path}.format`,
      });
    }
  }

  /**
   * Check blob property
   */
  checkBlobProperty(prop, path, fileResult) {
    if (!prop.maxSize) {
      fileResult.issues.push({
        severity: SEVERITY.ERROR,
        rule: "blob-max-size",
        message: "Blob property must have maxSize",
        location: `${path}.maxSize`,
      });
    }

    if (!prop.accept || prop.accept.length === 0) {
      fileResult.issues.push({
        severity: SEVERITY.WARNING,
        rule: "blob-accept",
        message: "Blob property should specify accepted MIME types",
        location: `${path}.accept`,
      });
    }
  }

  /**
   * Check array property
   */
  checkArrayProperty(prop, path, fileResult, lexicon) {
    if (!prop.items) {
      fileResult.issues.push({
        severity: SEVERITY.ERROR,
        rule: "array-items",
        message: "Array property must have items definition",
        location: `${path}.items`,
      });
      return;
    }

    // Consider maxLength for arrays
    if (!prop.maxLength) {
      fileResult.issues.push({
        severity: SEVERITY.INFO,
        rule: "array-max-length",
        message: "Consider adding maxLength to array to prevent abuse",
        location: `${path}.maxLength`,
      });
    }

    // Check items
    if (prop.items.type) {
      this.checkProperty(prop.items, `${path}.items`, fileResult, lexicon);
    }
  }

  /**
   * Check ref property
   */
  checkRefProperty(prop, path, fileResult) {
    if (!prop.ref) {
      fileResult.issues.push({
        severity: SEVERITY.ERROR,
        rule: "ref-required",
        message: "Ref property must have ref field",
        location: `${path}.ref`,
      });
      return;
    }

    // Check if strongRef is documented
    if (prop.ref === "com.atproto.repo.strongRef" && prop.description) {
      if (
        !prop.description.includes("lexicon") &&
        !prop.description.includes("conform")
      ) {
        fileResult.issues.push({
          severity: SEVERITY.WARNING,
          rule: "strongref-documentation",
          message:
            "StrongRef should document the expected lexicon type in description",
          location: `${path}.description`,
        });
      }
    }
  }

  /**
   * Resolve a local ref (starting with #) to its definition
   */
  resolveLocalRef(ref, lexicon) {
    if (typeof ref !== "string" || !ref.startsWith("#")) {
      return null;
    }

    const defName = ref.substring(1); // Remove the '#'
    if (lexicon.defs && lexicon.defs[defName]) {
      return lexicon.defs[defName];
    }

    return null;
  }

  /**
   * Resolve an external ref (e.g., "org.hypercerts.defs#uri") to its definition
   */
  resolveExternalRef(ref) {
    if (typeof ref !== "string" || ref.startsWith("#")) {
      return null;
    }

    // Parse the ref: "lexicon.id#defName" or just "lexicon.id"
    const parts = ref.split("#");
    const lexiconId = parts[0];
    const defName = parts[1] || "main";

    const targetLexicon = this.lexiconIndex.get(lexiconId);
    if (!targetLexicon || !targetLexicon.defs) {
      return null;
    }

    return targetLexicon.defs[defName] || null;
  }

  /**
   * Check if a union ref points to a valid type (must be object or record)
   */
  checkUnionRefForPrimitiveType(ref, index, path, fileResult, lexicon) {
    const validUnionTypes = ["object", "record"];

    // Check if this is an inline type definition
    if (typeof ref === "object" && ref.type) {
      if (!validUnionTypes.includes(ref.type)) {
        fileResult.issues.push({
          severity: SEVERITY.ERROR,
          rule: "union-invalid-type",
          message: `Union variants must be object or record types. Inline type "${ref.type}" is not allowed in unions by ATProto spec`,
          location: `${path}.refs[${index}]`,
        });
      }
      return;
    }

    // Check if this is a local ref that we can resolve
    if (typeof ref === "string" && ref.startsWith("#")) {
      const resolvedDef = this.resolveLocalRef(ref, lexicon);
      if (resolvedDef) {
        if (!resolvedDef.type) {
          fileResult.issues.push({
            severity: SEVERITY.WARNING,
            rule: "union-invalid-type",
            message: `Union variant local ref "${ref}" resolves to a definition without a type field`,
            location: `${path}.refs[${index}]`,
          });
        } else if (!validUnionTypes.includes(resolvedDef.type)) {
          fileResult.issues.push({
            severity: SEVERITY.ERROR,
            rule: "union-invalid-type",
            message: `Union variants must be object or record types. Local ref "${ref}" resolves to type "${resolvedDef.type}" which is not allowed in unions by ATProto spec`,
            location: `${path}.refs[${index}]`,
          });
        }
      } else {
        fileResult.issues.push({
          severity: SEVERITY.WARNING,
          rule: "union-unresolved-local-ref",
          message: `Union variant local ref "${ref}" does not resolve to any definition in this lexicon (possible typo or missing definition)`,
          location: `${path}.refs[${index}]`,
        });
      }
      return;
    }

    // Check if this is an external ref (e.g., "com.atproto.repo.strongRef" or "org.hypercerts.defs#uri")
    if (typeof ref === "string" && !ref.startsWith("#")) {
      const resolvedDef = this.resolveExternalRef(ref);
      if (resolvedDef) {
        if (!resolvedDef.type) {
          fileResult.issues.push({
            severity: SEVERITY.WARNING,
            rule: "union-invalid-type",
            message: `Union variant external ref "${ref}" resolves to a definition without a type field`,
            location: `${path}.refs[${index}]`,
          });
        } else if (!validUnionTypes.includes(resolvedDef.type)) {
          fileResult.issues.push({
            severity: SEVERITY.ERROR,
            rule: "union-invalid-type",
            message: `Union variants must be object or record types. External ref "${ref}" resolves to type "${resolvedDef.type}" which is not allowed in unions by ATProto spec`,
            location: `${path}.refs[${index}]`,
          });
        }
      } else {
        // Could not resolve the external ref - might be a typo or the lexicon might not be loaded
        fileResult.issues.push({
          severity: SEVERITY.ERROR,
          rule: "union-unresolved-ref",
          message: `Union variant external ref "${ref}" cannot be resolved (possible typo or missing lexicon)`,
          location: `${path}.refs[${index}]`,
        });
      }
      return;
    }
  }

  /**
   * Check union property
   */
  checkUnionProperty(prop, path, fileResult, lexicon) {
    if (!prop.refs || prop.refs.length === 0) {
      fileResult.issues.push({
        severity: SEVERITY.ERROR,
        rule: "union-refs",
        message: "Union property must have refs array",
        location: `${path}.refs`,
      });
      return;
    }

    if (prop.refs.length < 2) {
      fileResult.issues.push({
        severity: SEVERITY.INFO,
        rule: "union-multiple-types",
        message: "Union should have at least 2 types (otherwise use ref)",
        location: `${path}.refs`,
      });
    }

    // Check that all refs point to object or record types
    // Primitive types (string, integer, boolean) are not allowed in unions
    prop.refs.forEach((ref, index) => {
      this.checkUnionRefForPrimitiveType(ref, index, path, fileResult, lexicon);
    });
  }

  /**
   * Check string definition
   */
  checkStringDefinition(def, path, fileResult) {
    this.checkStringProperty(def, path, fileResult);
  }

  /**
   * Check blob definition
   */
  checkBlobDefinition(def, path, fileResult) {
    this.checkBlobProperty(def, path, fileResult);
  }

  /**
   * Check array definition
   */
  checkArrayDefinition(def, path, fileResult, lexicon) {
    this.checkArrayProperty(def, path, fileResult, lexicon);
  }

  /**
   * Format results for output
   */
  formatResults() {
    if (this.options.json) {
      return JSON.stringify(this.results, null, 2);
    }

    return [
      this.formatHeader(),
      this.formatSummary(),
      this.formatFileDetails(),
      this.formatRuleBreakdown(),
      this.formatFooter(),
    ].join("");
  }

  formatHeader() {
    return `\n${SEPARATOR}  Lexicon Style Guide Checker\n${SEPARATOR}\n`;
  }

  formatSummary() {
    const filesWithIssues = this.results.files.filter(
      (f) => f.issues.length > 0,
    );
    return (
      `Checked ${this.results.files.length} lexicon files\n` +
      `Found ${this.results.totalIssues} issues in ${filesWithIssues.length} files\n` +
      `  Errors: ${this.results.errorCount}\n` +
      `  Warnings: ${this.results.warningCount}\n` +
      `  Info: ${this.results.infoCount}\n\n`
    );
  }

  formatFileDetails() {
    let output = "";

    for (const file of this.results.files) {
      if (file.issues.length === 0 && !this.options.verbose) {
        continue;
      }

      const relativePath = path.relative(process.cwd(), file.path);

      if (file.issues.length === 0) {
        output += `✅ ${relativePath}\n`;
        continue;
      }

      const icon = file.issues.some((i) => i.severity === SEVERITY.ERROR)
        ? "❌"
        : "⚠️";
      output += `${icon} ${relativePath} (${file.issues.length} issues)\n`;

      for (const issue of file.issues) {
        output += `  ${SEVERITY_ICONS[issue.severity]} [${issue.rule}] ${issue.message}\n`;
        output += `     Location: ${issue.location}\n`;
      }

      output += "\n";
    }

    return output;
  }

  /**
   * Aggregate issue counts by rule, sorted by severity then count
   */
  formatRuleBreakdown() {
    if (this.results.totalIssues === 0) {
      return "";
    }

    const ruleCounts = new Map();
    for (const file of this.results.files) {
      for (const issue of file.issues) {
        const key = `${issue.severity}:${issue.rule}`;
        ruleCounts.set(key, (ruleCounts.get(key) || 0) + 1);
      }
    }

    const severityOrder = {
      [SEVERITY.ERROR]: 0,
      [SEVERITY.WARNING]: 1,
      [SEVERITY.INFO]: 2,
    };
    const sorted = [...ruleCounts.entries()].sort((a, b) => {
      const [sevA] = a[0].split(":");
      const [sevB] = b[0].split(":");
      const orderDiff = severityOrder[sevA] - severityOrder[sevB];
      if (orderDiff !== 0) return orderDiff;
      return b[1] - a[1];
    });

    let output = "Issues by rule:\n";
    for (const [key, count] of sorted) {
      const [severity, rule] = key.split(":");
      output += `  ${SEVERITY_ICONS[severity]} ${rule}: ${count}\n`;
    }
    return output + "\n";
  }

  formatFooter() {
    if (this.results.errorCount > 0) {
      return `${SEPARATOR}❌ Style check FAILED with ${this.results.errorCount} errors\n${SEPARATOR}`;
    } else if (this.results.warningCount > 0) {
      return `${SEPARATOR}⚠️  Style check passed with ${this.results.warningCount} warnings\n${SEPARATOR}`;
    }
    return `${SEPARATOR}✅ All lexicons pass style checks!\n${SEPARATOR}`;
  }
}

// Main execution
async function main() {
  const lexiconsDir = path.join(__dirname, "..", "lexicons");

  if (!fs.existsSync(lexiconsDir)) {
    console.error(`Error: Lexicons directory not found: ${lexiconsDir}`);
    process.exit(1);
  }

  const checker = new StyleChecker(options);
  await checker.checkDirectory(lexiconsDir);

  const output = checker.formatResults();
  console.log(output);

  // Exit with error code if there are errors
  if (checker.results.errorCount > 0) {
    process.exit(1);
  }
}

// Run if executed directly
const scriptPath = fileURLToPath(import.meta.url);
if (scriptPath === process.argv[1]) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { StyleChecker, SEVERITY };
