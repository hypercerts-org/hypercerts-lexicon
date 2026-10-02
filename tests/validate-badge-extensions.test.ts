import { describe, it, expect } from "vitest";
import { Lexicons, type LexiconDoc } from "@atproto/lexicon";
import { readFileSync } from "node:fs";
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
  it("accepts an existing definition without an extension declaration", () => {
    expect(Definition.validateMain(definition).success).toBe(true);
  });

  it("accepts full inline identifiers and record NSIDs", () => {
    const result = Definition.validateMain({
      ...definition,
      extensionTypes: [INLINE_TYPE, RECORD_TYPE],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.extensionTypes).toEqual([INLINE_TYPE, RECORD_TYPE]);
      expect(result.value.badgeType).toBe("certification");
    }
  });

  it("accepts an empty allowlist without requiring payloads", () => {
    expect(
      Definition.validateMain({ ...definition, extensionTypes: [] }).success,
    ).toBe(true);
  });

  it("accepts the maximum 20 types", () => {
    expect(
      Definition.validateMain({
        ...definition,
        extensionTypes: Array.from(
          { length: 20 },
          (_, i) => `org.example.goodmarket.extension${i}`,
        ),
      }).success,
    ).toBe(true);
  });

  it("rejects more than 20 types", () => {
    expect(
      validate(
        { ...definition, extensionTypes: Array(21).fill(INLINE_TYPE) },
        ids.AppCertifiedBadgeDefinition,
        "main",
        false,
      ).success,
    ).toBe(false);
  });

  it("bounds identifier strings at 512 bytes independently of type resolution", () => {
    for (const [length, success] of [
      [512, true],
      [513, false],
    ] as const) {
      expect(
        validate(
          { ...definition, extensionTypes: ["a".repeat(length)] },
          ids.AppCertifiedBadgeDefinition,
          "main",
          false,
        ).success,
      ).toBe(success);
    }
  });

  it.each(
    [null, INLINE_TYPE, {}, [42], [null], [{}]].map((extensionTypes) => ({
      extensionTypes,
    })),
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
  it("accepts an existing award without extensions", () => {
    expect(Award.validateMain(award).success).toBe(true);
  });

  it.each([
    ["empty", []],
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

  it("accepts the maximum 20 extensions", () => {
    expect(
      Award.validateMain({
        ...award,
        extensions: Array(20).fill(inlineExtension),
      }).success,
    ).toBe(true);
  });

  it("rejects more than 20 extensions", () => {
    expect(
      validate(
        { ...award, extensions: Array(21).fill(inlineExtension) },
        ids.AppCertifiedBadgeAward,
        "main",
        false,
      ).success,
    ).toBe(false);
  });

  it.each(
    [
      null,
      {},
      "data",
      ["data"],
      [null],
      [42],
      [{}],
      [{ sectors: [], focus: [] }],
      [{ $type: 42 }],
      [{ uri: referenceExtension.uri, cid: VALID_CID }],
      [{ $type: "com.atproto.repo.strongRef", uri: referenceExtension.uri }],
      [{ $type: "com.atproto.repo.strongRef", cid: VALID_CID }],
      [{ ...referenceExtension, cid: "not-a-cid" }],
      [{ ...referenceExtension, uri: "https://example.org/extension" }],
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

// Test-only third-party schemas. These are not new Certified lexicons.
const metadataProperties = {
  sectors: {
    type: "array",
    maxLength: 100,
    items: { type: "string", maxLength: 256 },
  },
  focus: {
    type: "array",
    maxLength: 100,
    items: { type: "string", maxLength: 256 },
  },
} as const;
const inlineSchema: LexiconDoc = {
  lexicon: 1,
  id: "org.example.goodmarket.defs",
  defs: {
    approvalMetadata: {
      type: "object",
      required: ["sectors", "focus"],
      properties: metadataProperties,
    },
  },
};
const recordSchema: LexiconDoc = {
  lexicon: 1,
  id: RECORD_TYPE,
  defs: {
    main: {
      type: "record",
      key: "tid",
      record: {
        type: "object",
        required: ["sectors", "focus"],
        properties: metadataProperties,
      },
    },
  },
};
const registry = new Lexicons([...schemas, inlineSchema, recordSchema]);

describe("Good Market extension validation boundaries", () => {
  it("keeps the guide's JSON schemas and examples valid", () => {
    const guide = readFileSync(
      new URL("../docs/design/badge-extensions.md", import.meta.url),
      "utf8",
    );
    const examples = Array.from(
      guide.matchAll(/```json\n([\s\S]*?)\n```/g),
      (match) => JSON.parse(match[1]),
    );
    expect(examples).toHaveLength(5);
    const [schema, exampleDefinition, exampleAward, references, payload] =
      examples;
    const exampleRegistry = new Lexicons([...schemas, schema, recordSchema]);
    expect(
      exampleRegistry.validate(
        ids.AppCertifiedBadgeDefinition,
        exampleDefinition,
      ).success,
    ).toBe(true);
    expect(
      exampleRegistry.validate(ids.AppCertifiedBadgeAward, exampleAward)
        .success,
    ).toBe(true);
    expect(
      exampleRegistry.validate(INLINE_TYPE, exampleAward.extensions[0]).success,
    ).toBe(true);
    expect(
      exampleRegistry.validate(ids.AppCertifiedBadgeAward, {
        ...exampleAward,
        extensions: references,
      }).success,
    ).toBe(true);
    expect(exampleRegistry.validate(RECORD_TYPE, payload).success).toBe(true);
    expect(exampleDefinition.extensionTypes).toEqual([
      INLINE_TYPE,
      RECORD_TYPE,
    ]);
    expect(Object.keys(schema.defs.approvalMetadata.properties)).toEqual([
      "sectors",
      "focus",
    ]);
  });

  it("validates the inline schema's two string-array fields explicitly", () => {
    expect(registry.validate(INLINE_TYPE, inlineExtension).success).toBe(true);
    expect(Object.keys(metadataProperties)).toEqual(["sectors", "focus"]);
  });

  it("validates a standalone extension payload explicitly", () => {
    expect(
      registry.validate(RECORD_TYPE, {
        ...inlineExtension,
        $type: RECORD_TYPE,
      }).success,
    ).toBe(true);
  });

  it.each([
    { $type: INLINE_TYPE, sectors: [42], focus: [] },
    { $type: INLINE_TYPE, sectors: [], focus: "Fair Trade" },
    { $type: INLINE_TYPE, sectors: [] },
    { $type: INLINE_TYPE, focus: [] },
  ])(
    "requires separate payload validation, even with a registered schema: %j",
    (payload) => {
      // The carrier's open union accepts third-party types without validating
      // their fields, even when the schema is in this same registry.
      expect(
        registry.validate(ids.AppCertifiedBadgeAward, {
          ...award,
          extensions: [payload],
        }).success,
      ).toBe(true);
      expect(registry.validate(INLINE_TYPE, payload).success).toBe(false);
    },
  );

  it("does not mistake carrier validation for definition allowlist enforcement", () => {
    const restricted = { ...definition, extensionTypes: [INLINE_TYPE] };
    const otherPayload = { $type: "org.example.other.metadata" };
    expect(Definition.validateMain(restricted).success).toBe(true);
    expect(
      Award.validateMain({ ...award, extensions: [otherPayload] }).success,
    ).toBe(true);
    // An application must perform this cross-record check separately.
    expect(restricted.extensionTypes.includes(otherPayload.$type)).toBe(false);
  });

  it("matches a referenced payload's type, not the strongRef wrapper", () => {
    const restricted = { ...definition, extensionTypes: [RECORD_TYPE] };
    const referencedPayload = { ...inlineExtension, $type: RECORD_TYPE };
    expect(restricted.extensionTypes.includes(referenceExtension.$type)).toBe(
      false,
    );
    expect(restricted.extensionTypes.includes(referencedPayload.$type)).toBe(
      true,
    );
    expect(registry.validate(RECORD_TYPE, referencedPayload).success).toBe(
      true,
    );
  });
});
