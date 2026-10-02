import { describe, it, expect } from "vitest";
import { Lexicons, type LexiconDoc } from "@atproto/lexicon";
import { ids, schemas, validate } from "../generated/lexicons.js";
import * as Definition from "../generated/types/app/certified/badge/definition.js";
import * as Award from "../generated/types/app/certified/badge/award.js";

const INLINE_TYPE = "org.example.goodmarket.defs#approvalMetadata";
const RECORD_TYPE = "org.example.goodmarket.approvalMetadata";
const VALID_CID = "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";
const definition = {
  $type: ids.AppCertifiedBadgeDefinition,
  badgeType: "certification",
  title: "Good Market Approved",
  allowedIssuers: [{ did: "did:plc:ewvi7nxzyoun6zhxrhs64oiz" }],
  createdAt: "2026-10-02T12:00:00Z",
};
const award = {
  $type: ids.AppCertifiedBadgeAward,
  badge: {
    uri: "at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/app.certified.badge.definition/3k2abc",
    cid: VALID_CID,
  },
  subject: {
    $type: "app.certified.defs#did" as const,
    did: "did:plc:klldzjf4rzhskytomj64nvil",
  },
  createdAt: "2026-10-02T12:05:00Z",
};
const inlineExtension = {
  $type: INLINE_TYPE,
  sectors: ["Agriculture", "Food"],
  focus: ["Regenerative Agriculture", "Fair Trade"],
};
const referenceExtension = {
  $type: "com.atproto.repo.strongRef" as const,
  uri: `at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/${RECORD_TYPE}/3k2def`,
  cid: VALID_CID,
};

describe("app.certified.badge.definition extensionTypes", () => {
  it("accepts omitted or empty extensionTypes", () => {
    expect(Definition.validateMain(definition).success).toBe(true);
    expect(
      Definition.validateMain({ ...definition, extensionTypes: [] }).success,
    ).toBe(true);
  });

  it("accepts required and optional entries for inline identifiers and record NSIDs", () => {
    const extensionTypes = [
      { type: INLINE_TYPE, required: true },
      { type: RECORD_TYPE, required: false },
      { type: "org.example.other.metadata" },
    ];
    const result = Definition.validateMain({ ...definition, extensionTypes });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.extensionTypes).toEqual(extensionTypes);
      expect(result.value.badgeType).toBe("certification");
    }
  });

  it("enforces the 20-entry array limit", () => {
    for (const [count, success] of [
      [20, true],
      [21, false],
    ] as const) {
      expect(
        validate(
          {
            ...definition,
            extensionTypes: Array(count).fill({ type: INLINE_TYPE }),
          },
          ids.AppCertifiedBadgeDefinition,
          "main",
          false,
        ).success,
      ).toBe(success);
    }
  });

  it("bounds identifier strings at 512 bytes independently of type resolution", () => {
    for (const [length, success] of [
      [512, true],
      [513, false],
    ] as const) {
      expect(
        validate(
          { ...definition, extensionTypes: [{ type: "a".repeat(length) }] },
          ids.AppCertifiedBadgeDefinition,
          "main",
          false,
        ).success,
      ).toBe(success);
    }
  });

  it.each(
    [
      INLINE_TYPE,
      [INLINE_TYPE],
      [{ required: true }],
      [{ type: 42 }],
      [{ type: INLINE_TYPE, required: "yes" }],
    ].map((extensionTypes) => ({ extensionTypes })),
  )("rejects a malformed extensionTypes value: %j", ({ extensionTypes }) => {
    const result = validate(
      { ...definition, extensionTypes },
      ids.AppCertifiedBadgeDefinition,
      "main",
      false,
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("extensionTypes");
    }
  });
});

describe("app.certified.badge.award extensions", () => {
  it("accepts omitted or empty extensions", () => {
    expect(Award.validateMain(award).success).toBe(true);
    expect(Award.validateMain({ ...award, extensions: [] }).success).toBe(true);
  });

  it.each([
    ["inline", [inlineExtension]],
    ["referenced", [referenceExtension]],
    ["mixed", [inlineExtension, referenceExtension]],
  ])(
    "accepts %s extensions and preserves the original data",
    (_, extensions) => {
      const result = Award.validateMain({ ...award, extensions });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.extensions).toEqual(extensions);
      }
    },
  );

  it("admits a future third-party type without adding it to the shared schema", () => {
    const extensions = [
      { $type: "org.example.future.customData", customField: "preserved" },
    ];
    const result = Award.validateMain({ ...award, extensions });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.extensions).toEqual(extensions);
    }
  });

  it("enforces the 20-extension array limit", () => {
    for (const [count, success] of [
      [20, true],
      [21, false],
    ] as const) {
      expect(
        validate(
          { ...award, extensions: Array(count).fill(inlineExtension) },
          ids.AppCertifiedBadgeAward,
          "main",
          false,
        ).success,
      ).toBe(success);
    }
  });

  it.each(
    [
      [{ sectors: [], focus: [] }],
      [{ $type: "com.atproto.repo.strongRef", uri: referenceExtension.uri }],
    ].map((extensions) => ({ extensions })),
  )("rejects malformed extensions: %j", ({ extensions }) => {
    const result = validate(
      { ...award, extensions },
      ids.AppCertifiedBadgeAward,
      "main",
      false,
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("extensions");
    }
  });
});

describe("Good Market extension validation boundaries", () => {
  it("requires separate payload validation, even with a registered schema", () => {
    // Test-only third-party schema, not a new Certified lexicon.
    const inlineSchema: LexiconDoc = {
      lexicon: 1,
      id: "org.example.goodmarket.defs",
      defs: {
        approvalMetadata: {
          type: "object",
          required: ["sectors", "focus"],
          properties: {
            sectors: { type: "array", items: { type: "string" } },
            focus: { type: "array", items: { type: "string" } },
          },
        },
      },
    };
    const registry = new Lexicons([...schemas, inlineSchema]);
    const invalidPayload = { ...inlineExtension, sectors: [42] };
    expect(registry.validate(INLINE_TYPE, inlineExtension).success).toBe(true);
    expect(
      registry.validate(ids.AppCertifiedBadgeAward, {
        ...award,
        extensions: [invalidPayload],
      }).success,
    ).toBe(true);
    expect(registry.validate(INLINE_TYPE, invalidPayload).success).toBe(false);
  });

  it("does not mistake carrier validation for enforcement of the definition's contract", () => {
    const declared = {
      ...definition,
      extensionTypes: [{ type: INLINE_TYPE, required: true }],
    };
    const otherPayload = { $type: "org.example.other.metadata" };
    expect(Definition.validateMain(declared).success).toBe(true);
    // Neither award carries the required extension, yet both pass carrier
    // validation. An application must perform the cross-record check.
    for (const extensions of [undefined, [otherPayload]]) {
      expect(Award.validateMain({ ...award, extensions }).success).toBe(true);
      const present = new Set((extensions ?? []).map((e) => e.$type));
      const missing = declared.extensionTypes.filter(
        (entry) => entry.required && !present.has(entry.type),
      );
      expect(missing).toHaveLength(1);
    }
  });
});
