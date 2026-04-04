/**
 * Auto-extracts TypeScript code snippets from the SKILL.md file and
 * validates that every named import actually exists in the generated
 * package exports, and that record-construction / validation snippets
 * produce the expected results at runtime.
 *
 * This test reads SKILL.md at runtime so it never goes stale — any
 * renamed or removed export will cause a failure here.
 */
import { describe, it, expect } from "vitest";

// Import the full package exports (simulates `@hypercerts-org/lexicon`)
import * as PackageExports from "../generated/exports.js";

// Import the lexicons-only entry point (simulates `@hypercerts-org/lexicon/lexicons`)
import * as LexiconsExports from "../generated/lexicons.js";

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const SKILL_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../.agents/skills/building-with-hypercerts-lexicons/SKILL.md",
);

/** Extract fenced TypeScript code blocks from markdown. */
function extractTypeScriptBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  const regex = /```typescript\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

/**
 * Extract named imports from an import statement.
 * Handles both `import { A, B } from "..."` and `import { A as B } from "..."`.
 * Returns the original names (not aliases).
 */
function extractNamedImports(
  importLine: string,
): { names: string[]; source: string } | null {
  // Match: import { Foo, Bar } from "@hypercerts-org/lexicon"
  const namedMatch = importLine.match(
    /import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/,
  );
  if (namedMatch) {
    const names = namedMatch[1]
      .split(",")
      .map((s) => {
        const parts = s.trim().split(/\s+as\s+/);
        return parts[0].trim();
      })
      .filter((n) => n.length > 0 && !n.startsWith("//"));
    return { names, source: namedMatch[2] };
  }
  return null;
}

/**
 * Extract namespace imports: `import * as Foo from "..."`
 */
function extractNamespaceImport(
  importLine: string,
): { alias: string; source: string } | null {
  const nsMatch = importLine.match(
    /import\s*\*\s*as\s+(\w+)\s+from\s*["']([^"']+)["']/,
  );
  if (nsMatch) {
    return { alias: nsMatch[1], source: nsMatch[2] };
  }
  return null;
}

describe("SKILL.md code snippets", () => {
  const markdown = readFileSync(SKILL_PATH, "utf-8");
  const blocks = extractTypeScriptBlocks(markdown);

  it("should find code blocks in SKILL.md", () => {
    expect(blocks.length).toBeGreaterThan(0);
  });

  describe("all named imports from @hypercerts-org/lexicon resolve", () => {
    const allNamedImports = new Set<string>();

    for (const block of blocks) {
      // Rejoin lines so multi-line imports are captured
      const joined = block.split("\n").join(" ");
      const importStatements = joined.match(
        /import\s*\{[^}]+\}\s*from\s*["'][^"']+["']/g,
      );
      if (!importStatements) continue;

      for (const stmt of importStatements) {
        const parsed = extractNamedImports(stmt);
        if (!parsed) continue;
        if (!parsed.source.startsWith("@hypercerts-org/lexicon")) continue;
        for (const name of parsed.names) {
          allNamedImports.add(name);
        }
      }
    }

    it("found at least one named import to check", () => {
      expect(allNamedImports.size).toBeGreaterThan(0);
    });

    for (const name of allNamedImports) {
      it(`export "${name}" exists in package`, () => {
        const exports = PackageExports as Record<string, unknown>;
        expect(exports[name]).toBeDefined();
      });
    }
  });

  describe("all namespace imports from @hypercerts-org/lexicon resolve", () => {
    const allNamespaceImports = new Set<string>();

    for (const block of blocks) {
      for (const line of block.split("\n")) {
        const ns = extractNamespaceImport(line);
        if (!ns) continue;
        if (!ns.source.startsWith("@hypercerts-org/lexicon")) continue;
        allNamespaceImports.add(ns.alias);
      }
    }

    it("checks namespace imports (if any)", () => {
      const exports = PackageExports as Record<string, unknown>;
      for (const alias of allNamespaceImports) {
        // Namespace imports like `import * as X from "@hypercerts-org/lexicon"`
        // import the whole module. If the alias matches an actual namespace
        // export name, verify it exists.
        if (alias in exports) {
          expect(exports[alias]).toBeDefined();
        }
      }
    });
  });

  describe("NSID constants have correct values", () => {
    const nsidTests: [string, string][] = [
      ["ACTIVITY_NSID", "org.hypercerts.claim.activity"],
      ["CONTRIBUTION_NSID", "org.hypercerts.claim.contribution"],
      [
        "CONTRIBUTOR_INFORMATION_NSID",
        "org.hypercerts.claim.contributorInformation",
      ],
      ["RIGHTS_NSID", "org.hypercerts.claim.rights"],
      ["HYPERCERTS_COLLECTION_NSID", "org.hypercerts.collection"],
      [
        "CONTEXT_ACKNOWLEDGEMENT_NSID",
        "org.hypercerts.context.acknowledgement",
      ],
      ["CONTEXT_ATTACHMENT_NSID", "org.hypercerts.context.attachment"],
      ["CONTEXT_EVALUATION_NSID", "org.hypercerts.context.evaluation"],
      ["CONTEXT_MEASUREMENT_NSID", "org.hypercerts.context.measurement"],
      ["FUNDING_RECEIPT_NSID", "org.hypercerts.funding.receipt"],
      ["LOCATION_NSID", "app.certified.location"],
      ["LINK_EVM_NSID", "app.certified.link.evm"],
      ["WORKSCOPE_CEL_NSID", "org.hypercerts.workscope.cel"],
      ["WORKSCOPE_TAG_NSID", "org.hypercerts.workscope.tag"],
    ];

    for (const [name, expected] of nsidTests) {
      it(`${name} === "${expected}"`, () => {
        const exports = PackageExports as Record<string, unknown>;
        expect(exports[name]).toBe(expected);
      });
    }
  });

  describe("semantic mapping objects exist and have expected keys", () => {
    it("HYPERCERTS_NSIDS.ACTIVITY", () => {
      expect(PackageExports.HYPERCERTS_NSIDS.ACTIVITY).toBe(
        "org.hypercerts.claim.activity",
      );
    });

    it("HYPERCERTS_NSIDS_BY_TYPE.OrgHypercertsClaimActivity", () => {
      expect(
        PackageExports.HYPERCERTS_NSIDS_BY_TYPE.OrgHypercertsClaimActivity,
      ).toBe("org.hypercerts.claim.activity");
    });

    it("HYPERCERTS_LEXICON_JSON.ACTIVITY", () => {
      expect(PackageExports.HYPERCERTS_LEXICON_JSON.ACTIVITY).toBeDefined();
      expect(PackageExports.HYPERCERTS_LEXICON_JSON.ACTIVITY.id).toBe(
        "org.hypercerts.claim.activity",
      );
    });

    it("HYPERCERTS_LEXICON_DOC.ACTIVITY", () => {
      expect(PackageExports.HYPERCERTS_LEXICON_DOC.ACTIVITY).toBeDefined();
    });
  });

  describe("individual LEXICON_JSON and LEXICON_DOC exports", () => {
    it("ACTIVITY_LEXICON_JSON", () => {
      expect(PackageExports.ACTIVITY_LEXICON_JSON).toBeDefined();
      expect(PackageExports.ACTIVITY_LEXICON_JSON.id).toBe(
        "org.hypercerts.claim.activity",
      );
    });

    it("ACTIVITY_LEXICON_DOC", () => {
      expect(PackageExports.ACTIVITY_LEXICON_DOC).toBeDefined();
    });
  });

  describe("HYPERCERTS_SCHEMAS", () => {
    it("is a non-empty array", () => {
      expect(Array.isArray(PackageExports.HYPERCERTS_SCHEMAS)).toBe(true);
      expect(PackageExports.HYPERCERTS_SCHEMAS.length).toBeGreaterThan(0);
    });

    it("each element has an id field", () => {
      for (const schema of PackageExports.HYPERCERTS_SCHEMAS) {
        expect(typeof schema.id).toBe("string");
      }
    });
  });

  describe("validate() works as documented", () => {
    it("succeeds for valid record", () => {
      const record = {
        $type: PackageExports.ACTIVITY_NSID,
        title: "Test Activity",
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

    it("fails for invalid record", () => {
      const result = PackageExports.validate(
        { title: 123 },
        PackageExports.ACTIVITY_NSID,
        "main",
        false,
      );
      expect(result.success).toBe(false);
    });
  });

  describe("validateMain() works as documented", () => {
    it("OrgHypercertsClaimActivity.validateMain succeeds", () => {
      const record = {
        $type: PackageExports.ACTIVITY_NSID,
        title: "Open-source climate modeling",
        shortDescription: "Built ML models for regional climate prediction",
        createdAt: new Date().toISOString(),
      };
      const result =
        PackageExports.OrgHypercertsClaimActivity.validateMain(record);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.title).toBe("Open-source climate modeling");
      }
    });
  });

  describe("record construction snippets produce valid records", () => {
    it("Activity record validates", () => {
      const activity = {
        $type: PackageExports.ACTIVITY_NSID,
        title: "Mangrove Restoration in Mombasa",
        shortDescription: "Restored 3 hectares of mangrove forest",
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-12-31T23:59:59Z",
        createdAt: new Date().toISOString(),
      };
      const result =
        PackageExports.OrgHypercertsClaimActivity.validateMain(activity);
      expect(result.success).toBe(true);
    });

    it("Collection record validates", () => {
      const collection = {
        $type: PackageExports.HYPERCERTS_COLLECTION_NSID,
        type: "project",
        title: "Carbon Offset Initiative",
        shortDescription: "Activities focused on carbon reduction",
        items: [
          {
            itemIdentifier: {
              uri: "at://did:plc:alice/org.hypercerts.claim.activity/3k2abc",
              cid: "bafyreig6oqglpmriqivo3m2gsiakifl2uf3mfhpfnmfczrerug64shtqoi",
            },
          },
        ],
        createdAt: new Date().toISOString(),
      };
      const result =
        PackageExports.OrgHypercertsCollection.validateMain(collection);
      expect(result.success).toBe(true);
    });

    it("Acknowledgement record validates", () => {
      const ack = {
        $type: PackageExports.CONTEXT_ACKNOWLEDGEMENT_NSID,
        subject: {
          uri: "at://did:plc:bob/org.hypercerts.claim.activity/3k2abc",
          cid: "bafyreig6oqglpmriqivo3m2gsiakifl2uf3mfhpfnmfczrerug64shtqoi",
        },
        // context is a union — needs $type discriminator
        context: {
          $type: "com.atproto.repo.strongRef",
          uri: "at://did:plc:alice/org.hypercerts.collection/7x9def",
          cid: "bafyreig6oqglpmriqivo3m2gsiakifl2uf3mfhpfnmfczrerug64shtqoi",
        },
        acknowledged: true,
        createdAt: new Date().toISOString(),
      };
      const result =
        PackageExports.OrgHypercertsContextAcknowledgement.validateMain(ack);
      expect(result.success).toBe(true);
    });

    it("Location record validates", () => {
      const location = {
        $type: PackageExports.LOCATION_NSID,
        lpVersion: "1.0",
        srs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
        locationType: "coordinate-decimal",
        location: {
          $type: "app.certified.location#string",
          string: "-3.4653, -62.2159",
        },
        name: "Amazon Research Station",
        createdAt: new Date().toISOString(),
      };
      const result = PackageExports.AppCertifiedLocation.validateMain(location);
      expect(result.success).toBe(true);
    });

    it("EVM Link record validates", () => {
      const evmLink = {
        $type: PackageExports.LINK_EVM_NSID,
        address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        proof: {
          $type: "app.certified.link.evm#eip712Proof",
          signature: "0x" + "ab".repeat(65),
          message: {
            $type: "app.certified.link.evm#eip712Message",
            did: "did:plc:alice",
            evmAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
            chainId: "1",
            timestamp: "1709500000",
            nonce: "0",
          },
        },
        createdAt: new Date().toISOString(),
      };
      const result = PackageExports.AppCertifiedLinkEvm.validateMain(evmLink);
      expect(result.success).toBe(true);
    });

    it("Attachment record validates", () => {
      const attachment = {
        $type: PackageExports.CONTEXT_ATTACHMENT_NSID,
        title: "Field Survey Report",
        contentType: "report",
        subjects: [
          {
            uri: "at://did:plc:alice/org.hypercerts.claim.activity/abc123",
            cid: "bafyreig6oqglpmriqivo3m2gsiakifl2uf3mfhpfnmfczrerug64shtqoi",
          },
        ],
        // content items are a union — need $type discriminator
        content: [
          {
            $type: "org.hypercerts.defs#uri",
            uri: "https://example.com/reports/survey-2024.pdf",
          },
        ],
        shortDescription: "Quarterly field survey documenting project progress",
        createdAt: new Date().toISOString(),
      };
      const result =
        PackageExports.OrgHypercertsContextAttachment.validateMain(attachment);
      expect(result.success).toBe(true);
    });

    it("Funding Receipt record validates", () => {
      const receipt = {
        $type: PackageExports.FUNDING_RECEIPT_NSID,
        subject: {
          uri: "at://did:plc:alice/org.hypercerts.claim.activity/abc123",
          cid: "bafyreig6oqglpmriqivo3m2gsiakifl2uf3mfhpfnmfczrerug64shtqoi",
        },
        to: "did:plc:recipient",
        amount: "1000.00",
        currency: "USD",
        paymentRail: "ethereum",
        transactionId: "0xabc123",
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      const result =
        PackageExports.OrgHypercertsFundingReceipt.validateMain(receipt);
      expect(result.success).toBe(true);
    });
  });

  describe("NSID references in SKILL.md code blocks all resolve", () => {
    const skillNsidRefs = new Set<string>();

    for (const block of blocks) {
      const nsidRefs = block.match(/\b[A-Z_]+_NSID\b/g);
      if (nsidRefs) {
        for (const ref of nsidRefs) {
          skillNsidRefs.add(ref);
        }
      }
    }

    it("found NSID references to check", () => {
      expect(skillNsidRefs.size).toBeGreaterThan(0);
    });

    for (const ref of skillNsidRefs) {
      it(`"${ref}" is exported from package`, () => {
        const exports = PackageExports as Record<string, unknown>;
        expect(exports[ref]).toBeDefined();
      });
    }
  });

  describe("/lexicons entry point", () => {
    it("validate function", () => {
      expect(typeof LexiconsExports.validate).toBe("function");
    });

    it("ids object", () => {
      expect(LexiconsExports.ids).toBeDefined();
      expect(LexiconsExports.ids.OrgHypercertsClaimActivity).toBe(
        "org.hypercerts.claim.activity",
      );
    });

    it("schemas array", () => {
      expect(Array.isArray(LexiconsExports.schemas)).toBe(true);
    });
  });
});
