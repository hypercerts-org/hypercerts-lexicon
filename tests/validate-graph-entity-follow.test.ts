import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons";
import * as EntityFollow from "../generated/types/app/certified/graph/entityFollow";

const VALID_URI =
  "at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/org.hypercerts.claim.activity/3k2abc";
const VALID_CID = "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";

describe("app.certified.graph.entityFollow", () => {
  it("should accept a valid entityFollow record (subject + createdAt only)", () => {
    const result = EntityFollow.validateMain({
      $type: ids.AppCertifiedGraphEntityFollow,
      subject: {
        $type: "app.certified.defs#recordSubject",
        uri: VALID_URI,
      },
      createdAt: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.subject.uri).toBe(VALID_URI);
    }
  });

  it("should accept an entityFollow record with optional via strongRef and signatures", () => {
    const result = EntityFollow.validateMain({
      $type: ids.AppCertifiedGraphEntityFollow,
      subject: {
        $type: "app.certified.defs#recordSubject",
        uri: VALID_URI,
      },
      createdAt: "2024-01-01T00:00:00Z",
      via: {
        uri: "at://did:plc:alice/app.certified.graph.starterpack/3k2abc",
        cid: VALID_CID,
      },
      signatures: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.via?.uri).toBe(
        "at://did:plc:alice/app.certified.graph.starterpack/3k2abc",
      );
    }
  });

  it("should reject a record missing required subject", () => {
    const result = validate(
      { createdAt: "2024-01-01T00:00:00Z" },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a record missing required createdAt", () => {
    const result = validate(
      {
        subject: {
          $type: "app.certified.defs#recordSubject",
          uri: VALID_URI,
        },
      },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a subject given as a bare string instead of a union object", () => {
    const result = validate(
      {
        subject: VALID_URI,
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a recordSubject missing its required uri", () => {
    const result = validate(
      {
        subject: { $type: "app.certified.defs#recordSubject" },
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a recordSubject uri that is not an AT-URI", () => {
    const result = validate(
      {
        subject: {
          $type: "app.certified.defs#recordSubject",
          uri: "https://example.com/record",
        },
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("documents actual open-union behavior: an unrecognized subject $type currently passes validation", () => {
    // The `subject` union only declares `#recordSubject` today, but it is an
    // *open* union (no `closed: true`), by design, so future non-DID entity
    // kinds can be added non-breakingly. Per @atproto/lexicon's union
    // validator, an object whose `$type` doesn't match any known ref is
    // passed through as-is rather than rejected. This test documents that
    // real, current behavior rather than asserting a stricter contract the
    // schema does not actually enforce.
    const result = validate(
      {
        subject: {
          $type: "app.certified.graph.entityFollow#someFutureSubject",
          anything: "goes",
        },
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      false,
    );
    expect(result.success).toBe(true);
  });

  it("should reject a subject with no $type at all", () => {
    const result = validate(
      {
        subject: { uri: VALID_URI },
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject an invalid datetime", () => {
    const result = validate(
      {
        subject: {
          $type: "app.certified.defs#recordSubject",
          uri: VALID_URI,
        },
        createdAt: "not-a-datetime",
      },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should require $type when requiredType is true", () => {
    const result = validate(
      {
        subject: {
          $type: "app.certified.defs#recordSubject",
          uri: VALID_URI,
        },
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      true,
    );
    expect(result.success).toBe(false);
  });
});
