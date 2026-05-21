/**
 * End-to-end execution of the cryptographic-signature example in
 * README.md and the building-with-hypercerts-lexicons skill.
 *
 * The docs ARE the test source. Each markdown file's "Cryptographic
 * Signatures" section contains a sequence of TypeScript code blocks
 * that together build an inline signature, a remote-attestation
 * strongRef, and the final signed record. This test extracts those
 * blocks, concatenates them into a single ESM module, dynamically
 * imports it, and verifies:
 *
 *   1. The example runs end-to-end without throwing
 *   2. The produced inlineSignature has the correct shape and bytes
 *   3. The produced signedActivity is lexicon-valid
 *   4. The produced signature actually verifies via @atproto/crypto
 *
 * If the docs example drifts (renamed API, broken procedure, removed
 * lexicon ref, etc.), this test fails. If the test logic needs to
 * change, the docs are what to edit — not the test fixture.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { verifySignature } from "@atproto/crypto";
import * as Activity from "../generated/types/org/hypercerts/claim/activity.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXTRACT_DIR = resolve(ROOT, "tests/extracted");

interface ExtractedExample {
  signedActivity: { signatures: unknown[] };
  inlineSignature: {
    $type: string;
    signature: Uint8Array;
    key: string;
  };
  remoteAttestation: {
    $type: string;
    uri: string;
    cid: string;
  };
  cidBytes: Uint8Array;
  signatureBytes: Uint8Array;
  keypair: { did(): string };
}

/**
 * Extract all TypeScript code blocks under a heading whose text
 * matches `sectionPattern` (and any nested subheadings until the next
 * heading at the same or shallower level).
 */
function extractSectionBlocks(
  markdown: string,
  sectionPattern: RegExp,
): string[] {
  const lines = markdown.split("\n");
  const blocks: string[] = [];
  let inSection = false;
  let sectionLevel = 0;
  let inFence = false;
  let fenceLang = "";
  let current: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#+)\s+(.*)$/);
    if (headingMatch && !inFence) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      if (!inSection) {
        if (sectionPattern.test(text)) {
          inSection = true;
          sectionLevel = level;
        }
      } else if (level <= sectionLevel) {
        inSection = false;
      }
      continue;
    }
    if (!inSection) continue;

    const fenceMatch = line.match(/^```(\w*)/);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceLang = fenceMatch[1].toLowerCase();
        current = [];
      } else {
        if (/^(ts|tsx|typescript)$/.test(fenceLang)) {
          blocks.push(current.join("\n"));
        }
        inFence = false;
        fenceLang = "";
      }
      continue;
    }
    if (inFence) current.push(line);
  }
  return blocks;
}

/**
 * Concatenate the extracted blocks into one ESM module, hoisting and
 * deduping `import` statements, then appending an `export` clause
 * exposing the identifiers we want the test to inspect.
 */
function buildModuleSource(blocks: string[]): string {
  const importLines = new Set<string>();
  const bodyChunks: string[] = [];

  for (const block of blocks) {
    const blockLines = block.split("\n");
    const body: string[] = [];
    let i = 0;
    // Imports may span multiple lines if a `{ ... }` import is broken
    // across them, so accumulate until a line ends with a quote+semi.
    while (i < blockLines.length) {
      const line = blockLines[i];
      if (/^\s*import\b/.test(line)) {
        let stmt = line;
        while (!/["'];?\s*$/.test(stmt) && i + 1 < blockLines.length) {
          i += 1;
          stmt += "\n" + blockLines[i];
        }
        importLines.add(stmt.trim());
        i += 1;
        continue;
      }
      body.push(line);
      i += 1;
    }
    bodyChunks.push(body.join("\n"));
  }

  return [
    "// AUTO-GENERATED from documentation code blocks.",
    "// Do not edit; edit the source markdown instead.",
    "/* eslint-disable */",
    ...Array.from(importLines),
    "",
    bodyChunks.join("\n\n"),
    "",
    "export {",
    "  signedActivity,",
    "  inlineSignature,",
    "  remoteAttestation,",
    "  cidBytes,",
    "  signatureBytes,",
    "  keypair,",
    "};",
    "",
  ].join("\n");
}

async function loadExampleFrom(
  relPath: string,
  outputBasename: string,
): Promise<ExtractedExample> {
  const markdown = readFileSync(resolve(ROOT, relPath), "utf-8");
  const blocks = extractSectionBlocks(markdown, /Cryptographic Signatures/i);
  if (blocks.length < 3) {
    throw new Error(
      `Expected at least 3 TypeScript blocks under "Cryptographic Signatures" in ${relPath}, found ${blocks.length}`,
    );
  }
  const source = buildModuleSource(blocks);
  mkdirSync(EXTRACT_DIR, { recursive: true });
  const outPath = resolve(EXTRACT_DIR, `${outputBasename}.ts`);
  writeFileSync(outPath, source, "utf-8");
  return (await import(pathToFileURL(outPath).href)) as ExtractedExample;
}

const SOURCES: Array<[label: string, relPath: string, basename: string]> = [
  [
    "SKILL.md",
    ".agents/skills/building-with-hypercerts-lexicons/SKILL.md",
    "signing-example-skill",
  ],
  ["README.md", "README.md", "signing-example-readme"],
];

for (const [label, relPath, basename] of SOURCES) {
  describe(`signing example extracted from ${label}`, () => {
    let example: ExtractedExample;

    it("extracts and runs the documented signing procedure without throwing", async () => {
      example = await loadExampleFrom(relPath, basename);
      expect(example).toBeDefined();
    });

    it("produces a 36-byte CIDv1 with the dag-cbor/SHA-256 prefix", () => {
      expect(example.cidBytes).toBeInstanceOf(Uint8Array);
      expect(example.cidBytes.length).toBe(36);
      // CIDv1 + dag-cbor codec + SHA-256 multihash + 32-byte digest length
      expect(Array.from(example.cidBytes.slice(0, 4))).toEqual([
        0x01, 0x71, 0x12, 0x20,
      ]);
    });

    it("produces 64 raw r,s bytes from Secp256k1Keypair.sign()", () => {
      expect(example.signatureBytes).toBeInstanceOf(Uint8Array);
      expect(example.signatureBytes.length).toBe(64);
    });

    it("builds an inline signature with the correct $type and shape", () => {
      expect(example.inlineSignature.$type).toBe(
        "app.certified.signature.defs#inline",
      );
      expect(example.inlineSignature.signature).toBe(example.signatureBytes);
      expect(example.inlineSignature.key).toMatch(/^did:[^:]+:.+#.+$/);
    });

    it("builds a remote-attestation strongRef", () => {
      expect(example.remoteAttestation.$type).toBe(
        "com.atproto.repo.strongRef",
      );
      expect(example.remoteAttestation.uri).toMatch(/^at:\/\//);
    });

    it("attaches both signatures to the final record", () => {
      expect(example.signedActivity.signatures).toHaveLength(2);
      expect(example.signedActivity.signatures[0]).toBe(
        example.inlineSignature,
      );
      expect(example.signedActivity.signatures[1]).toBe(
        example.remoteAttestation,
      );
    });

    it("produces a record that passes lexicon validation", () => {
      // Replace the placeholder remote-attestation strongRef CID with a
      // syntactically-valid CID so the record can be validated; the
      // example uses "bafy..." which the lexicon validator rejects.
      const VALID_PROOF_CID =
        "bafyreie5737gdxlw5i64vngml6xvqeatqy3a4erphoqtso54z2eooh4zae";
      const validatable = {
        ...example.signedActivity,
        signatures: [
          example.inlineSignature,
          { ...example.remoteAttestation, cid: VALID_PROOF_CID },
        ],
      };
      const result = Activity.validateMain(validatable);
      expect(result.success).toBe(true);
    });

    it("produced signature verifies against the signing public key", async () => {
      const ok = await verifySignature(
        example.keypair.did(),
        example.cidBytes,
        example.signatureBytes,
      );
      expect(ok).toBe(true);
    });
  });
}
