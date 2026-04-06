/**
 * Auto-extracts TypeScript code snippets from documentation files
 * (SKILL.md and README.md) and validates that:
 *
 * 1. Every named import resolves to a real package export
 * 2. Every UPPER_SNAKE_CASE identifier used in code resolves
 * 3. Every *_NSID constant reference resolves
 * 4. Every `$type` string literal matches a known lexicon NSID or def
 * 5. Every dotted property access on mapping objects (e.g.
 *    HYPERCERTS_NSIDS.ACTIVITY) resolves to a real key
 *
 * These tests read documentation at runtime so they never go stale —
 * any renamed or removed export will cause a failure here.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Import the full package exports (simulates `@hypercerts-org/lexicon`)
import * as PackageExports from "../generated/exports.js";

// Import the lexicons-only entry point (simulates `@hypercerts-org/lexicon/lexicons`)
import * as LexiconsExports from "../generated/lexicons.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkgExports = PackageExports as Record<string, unknown>;
const lexExports = LexiconsExports as unknown as Record<string, unknown>;

// Build set of all known NSID strings and def hashes from the schema dict
const ALL_KNOWN_TYPE_STRINGS = new Set<string>();
for (const [, schema] of Object.entries(LexiconsExports.schemaDict)) {
  const s = schema as { id: string; defs: Record<string, unknown> };
  ALL_KNOWN_TYPE_STRINGS.add(s.id);
  for (const defName of Object.keys(s.defs)) {
    // "main" $type is just the NSID (already added above); only add
    // named defs as "nsid#defName" fragments.
    if (defName !== "main") {
      ALL_KNOWN_TYPE_STRINGS.add(`${s.id}#${defName}`);
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────

/** Extract fenced TypeScript code blocks from markdown. */
function extractTypeScriptBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  // Accept ```ts, ```tsx, ```typescript (case-insensitive), optional info
  // strings, and either LF or CRLF line endings so no fences are silently
  // skipped.
  const regex = /```(?:ts|tsx|typescript)\b[^\n]*\r?\n([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

interface NamedImport {
  name: string;
  source: string;
}

/** Collect all named imports from `@hypercerts-org/lexicon` entry points. */
function collectNamedImports(blocks: string[]): NamedImport[] {
  const imports: NamedImport[] = [];
  const seen = new Set<string>();
  for (const block of blocks) {
    const joined = block.split("\n").join(" ");
    const stmts = joined.match(/import\s*\{[^}]+\}\s*from\s*["'][^"']+["']/g);
    if (!stmts) continue;
    for (const stmt of stmts) {
      const m = stmt.match(/import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/);
      if (!m) continue;
      const source = m[2];
      if (!source.startsWith("@hypercerts-org/lexicon")) continue;
      for (const part of m[1].split(",")) {
        const name = part
          .trim()
          .split(/\s+as\s+/)[0]
          .trim();
        const key = `${source}::${name}`;
        if (name.length > 0 && !name.startsWith("//") && !seen.has(key)) {
          seen.add(key);
          imports.push({ name, source });
        }
      }
    }
  }
  return imports;
}

/** Get the export object for a given import source. */
function exportsForSource(source: string): Record<string, unknown> {
  if (source === "@hypercerts-org/lexicon/lexicons") {
    return lexExports;
  }
  return pkgExports;
}

/** Collect all UPPER_SNAKE_CASE identifiers from code (likely constants). */
function collectUpperSnakeIdentifiers(blocks: string[]): Set<string> {
  const ids = new Set<string>();
  for (const block of blocks) {
    // Strip import lines so we don't double-count imports
    const body = block
      .split("\n")
      .filter((l) => !l.trimStart().startsWith("import "))
      .join("\n");
    // Match UPPER_SNAKE identifiers (at least 2 parts separated by _)
    const matches = body.match(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g);
    if (matches) {
      for (const m of matches) ids.add(m);
    }
  }
  return ids;
}

/** Collect all `$type` string literal values from code blocks. */
function collectDollarTypeValues(blocks: string[]): Set<string> {
  const types = new Set<string>();
  for (const block of blocks) {
    // Match: $type: "some.nsid" or $type: "some.nsid#defName"
    const matches = block.match(/\$type:\s*["']([^"']+)["']/g);
    if (matches) {
      for (const m of matches) {
        const val = m.match(/\$type:\s*["']([^"']+)["']/);
        if (val) types.add(val[1]);
      }
    }
  }
  return types;
}

interface DottedAccess {
  object: string;
  property: string;
}

/** Collect dotted property accesses on known mapping objects. */
function collectMappingAccesses(blocks: string[]): DottedAccess[] {
  const accesses: DottedAccess[] = [];
  const seen = new Set<string>();
  const mappingObjects = [
    "HYPERCERTS_NSIDS",
    "HYPERCERTS_NSIDS_BY_TYPE",
    "HYPERCERTS_LEXICON_JSON",
    "HYPERCERTS_LEXICON_DOC",
  ];
  const pattern = new RegExp(
    `\\b(${mappingObjects.join("|")})\\.([A-Za-z_][A-Za-z0-9_]*)`,
    "g",
  );
  for (const block of blocks) {
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(block)) !== null) {
      const key = `${m[1]}.${m[2]}`;
      if (!seen.has(key)) {
        seen.add(key);
        accesses.push({ object: m[1], property: m[2] });
      }
    }
  }
  return accesses;
}

/**
 * Collect namespace property accesses that appear in runtime positions,
 * like `OrgHypercertsClaimActivity.validateMain(record)`.
 *
 * Excludes type-annotation-only usage like
 * `const x: OrgHypercertsClaimActivity.Main = ...` because interfaces
 * (Main, Contributor, etc.) are compile-time only and don't exist at runtime.
 */
function collectRuntimeNamespaceAccesses(blocks: string[]): DottedAccess[] {
  const accesses: DottedAccess[] = [];
  const seen = new Set<string>();
  // Match PascalCase identifiers (Org*, App*, Com*) followed by .property
  const pattern = /\b((?:Org|App|Com)[A-Za-z]+)\.([A-Za-z_][A-Za-z0-9_]*)\b/g;
  // Type annotation context: preceded by `: ` or `as ` or `<` (generics)
  const typeContextPattern =
    /(?::\s*|as\s+|<\s*)((?:Org|App|Com)[A-Za-z]+)\.([A-Za-z_][A-Za-z0-9_]*)\b/g;

  // First collect all type-position accesses so we can exclude them
  const typePositions = new Set<string>();
  for (const block of blocks) {
    typeContextPattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = typeContextPattern.exec(block)) !== null) {
      typePositions.add(`${m[1]}.${m[2]}`);
    }
  }

  for (const block of blocks) {
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(block)) !== null) {
      const key = `${m[1]}.${m[2]}`;
      if (seen.has(key)) continue;

      // Check if this specific occurrence is in a runtime position
      // by looking at what precedes it in the source
      const prefix = block.substring(Math.max(0, m.index - 10), m.index);
      const isTypePosition =
        /:\s*$/.test(prefix) || /\bas\s+$/.test(prefix) || /<\s*$/.test(prefix);

      if (isTypePosition) {
        // This occurrence is in a type-annotation context (`: Foo.Bar`,
        // `as Foo.Bar`, or `<Foo.Bar>`).  We never report type-only accesses
        // because interfaces/types don't exist at runtime.
        //
        // Two sub-cases:
        //
        // 1. `typePositions.has(key)` — the first pass confirmed this key
        //    appears in a type context.  Don't mark `seen`, so that a
        //    runtime-position occurrence of the same key later in the loop can
        //    still be found and reported.
        //
        // 2. `!typePositions.has(key)` — the local prefix heuristic fired, but
        //    the first-pass regex (which uses a slightly different pattern)
        //    didn't match this key as a type position.  This is an edge case;
        //    mark it `seen` to avoid re-examining it on every iteration, then
        //    skip.
        if (!typePositions.has(key)) {
          seen.add(key);
        }
        continue;
      }

      seen.add(key);
      accesses.push({ object: m[1], property: m[2] });
    }
  }
  return accesses;
}

interface ValidateCall {
  /** The raw first-argument text */
  firstArg: string;
  /** Line number context for error messages */
  context: string;
}

/**
 * Detect `validate(` calls where the first argument looks like an NSID
 * constant (UPPER_SNAKE ending in _NSID), which would indicate a
 * swapped argument order.  The correct signature is
 * `validate(value, nsid, hash)`.
 */
function collectSuspiciousValidateCalls(blocks: string[]): ValidateCall[] {
  const suspicious: ValidateCall[] = [];
  for (const block of blocks) {
    // Match: validate(SOMETHING, ...
    // but NOT: .validateMain( which is a different function
    const pattern = /\bvalidate\(\s*([A-Z_]+_NSID)\b/g;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(block)) !== null) {
      suspicious.push({
        firstArg: m[1],
        context: block.substring(
          Math.max(0, m.index - 20),
          Math.min(block.length, m.index + m[0].length + 30),
        ),
      });
    }
  }
  return suspicious;
}

// ─── Per-file auto-extracted checks ──────────────────────────────

function describeDocSnippets(label: string, relPath: string) {
  describe(`${label} code snippets`, () => {
    const markdown = readFileSync(resolve(ROOT, relPath), "utf-8");
    const blocks = extractTypeScriptBlocks(markdown);

    it("should find TypeScript code blocks", () => {
      expect(blocks.length).toBeGreaterThan(0);
    });

    // 1. Named imports
    describe("named imports resolve", () => {
      const imports = collectNamedImports(blocks);

      it("found at least one named import to check", () => {
        expect(imports.length).toBeGreaterThan(0);
      });

      for (const { name, source } of imports) {
        const suffix = source.endsWith("/lexicons") ? " from /lexicons" : "";
        it(`"${name}"${suffix} is exported`, () => {
          expect(exportsForSource(source)[name]).toBeDefined();
        });
      }
    });

    // 2. UPPER_SNAKE_CASE identifiers used in code bodies
    describe("UPPER_SNAKE_CASE identifiers resolve", () => {
      const ids = collectUpperSnakeIdentifiers(blocks);
      // Only check identifiers that look like they come from this package
      // (contain NSID, LEXICON, HYPERCERTS, SCHEMAS, etc.)
      const packagePrefixes = ["_NSID", "_LEXICON_", "HYPERCERTS_", "_SCHEMAS"];
      const relevant = [...ids].filter((id) =>
        packagePrefixes.some((p) => id.includes(p)),
      );

      for (const id of relevant) {
        it(`"${id}" is exported`, () => {
          expect(pkgExports[id]).toBeDefined();
        });
      }
    });

    // 3. $type string literals match known NSIDs/defs
    describe("$type string literals are valid", () => {
      const types = collectDollarTypeValues(blocks);

      for (const t of types) {
        it(`$type "${t}" is a known lexicon type`, () => {
          expect(ALL_KNOWN_TYPE_STRINGS.has(t)).toBe(true);
        });
      }
    });

    // 4. Dotted accesses on mapping objects have valid keys
    describe("mapping object property accesses resolve", () => {
      const accesses = collectMappingAccesses(blocks);

      for (const { object, property } of accesses) {
        it(`${object}.${property} exists`, () => {
          const obj = pkgExports[object];
          expect(obj).toBeDefined();
          expect((obj as Record<string, unknown>)[property]).toBeDefined();
        });
      }
    });

    // 5. Runtime namespace property accesses
    //    (e.g. OrgHypercertsClaimActivity.validateMain — NOT type annotations)
    describe("namespace property accesses resolve", () => {
      const accesses = collectRuntimeNamespaceAccesses(blocks);

      it("checks runtime namespace accesses (if any)", () => {
        for (const { object, property } of accesses) {
          const ns = pkgExports[object];
          expect(ns, `namespace "${object}" should be exported`).toBeDefined();
          expect(
            (ns as Record<string, unknown>)[property],
            `${object}.${property} should exist at runtime`,
          ).toBeDefined();
        }
      });
    });

    // 6. validate() not called with swapped arguments
    describe("validate() call signatures are correct", () => {
      const suspicious = collectSuspiciousValidateCalls(blocks);

      it("no validate() calls have an NSID as the first argument", () => {
        for (const { firstArg, context } of suspicious) {
          // Fails if someone writes validate(ACTIVITY_NSID, record, ...)
          // instead of validate(record, ACTIVITY_NSID, ...)
          expect(
            firstArg,
            `validate() called with NSID "${firstArg}" as first argument ` +
              `(should be second). Context: ...${context}...`,
          ).not.toMatch(/^[A-Z_]+_NSID$/);
        }
      });
    });
  });
}

// Run auto-extracted checks for both documentation files
describeDocSnippets(
  "SKILL.md",
  ".agents/skills/building-with-hypercerts-lexicons/SKILL.md",
);
describeDocSnippets("README.md", "README.md");

// ─── Package export smoke tests ──────────────────────────────────
// These verify fundamental API contracts that the auto-extraction
// can't cover (function signatures, return types, array shapes).

describe("package export smoke tests", () => {
  it("HYPERCERTS_SCHEMAS is a non-empty array of LexiconDoc", () => {
    expect(Array.isArray(PackageExports.HYPERCERTS_SCHEMAS)).toBe(true);
    expect(PackageExports.HYPERCERTS_SCHEMAS.length).toBeGreaterThan(0);
    for (const schema of PackageExports.HYPERCERTS_SCHEMAS) {
      expect(typeof schema.id).toBe("string");
    }
  });

  it("validate() succeeds for a valid record", () => {
    const record = {
      $type: PackageExports.ACTIVITY_NSID,
      title: "Test",
      shortDescription: "A test",
      createdAt: new Date().toISOString(),
    };
    const result = PackageExports.validate(
      record,
      PackageExports.ACTIVITY_NSID,
      "main",
    );
    expect(result.success).toBe(true);
  });

  it("validate() fails for an invalid record", () => {
    const result = PackageExports.validate(
      { title: 123 },
      PackageExports.ACTIVITY_NSID,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("validateMain() returns typed result", () => {
    const record = {
      $type: PackageExports.ACTIVITY_NSID,
      title: "Typed test",
      shortDescription: "test",
      createdAt: new Date().toISOString(),
    };
    const result =
      PackageExports.OrgHypercertsClaimActivity.validateMain(record);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.title).toBe("Typed test");
    }
  });

  it("/lexicons entry point exports validate, ids, schemas", () => {
    expect(typeof LexiconsExports.validate).toBe("function");
    expect(LexiconsExports.ids.OrgHypercertsClaimActivity).toBe(
      "org.hypercerts.claim.activity",
    );
    expect(Array.isArray(LexiconsExports.schemas)).toBe(true);
  });
});
