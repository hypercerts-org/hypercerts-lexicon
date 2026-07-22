import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons";
import * as EntityFollow from "../generated/types/app/certified/graph/entityFollow";

const VALID_AT_URI =
  "at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/org.hypercerts.activity/3k2abc";
const VALID_DID = "did:plc:ewvi7nxzyoun6zhxrhs64oiz";
const VALID_CID = "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";

describe("app.certified.graph.entityFollow", () => {
  it("should accept a valid entity follow record (subject + createdAt only)", () => {
    const result = EntityFollow.validateMain({
      $type: ids.AppCertifiedGraphEntityFollow,
      subject: VALID_AT_URI,
      createdAt: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.subject).toBe(VALID_AT_URI);
    }
  });

  it("should accept an entity follow record with optional via strongRef", () => {
    const result = EntityFollow.validateMain({
      $type: ids.AppCertifiedGraphEntityFollow,
      subject: VALID_AT_URI,
      createdAt: "2024-01-01T00:00:00Z",
      via: {
        uri: "at://did:plc:alice/app.certified.graph.starterpack/3k2abc",
        cid: VALID_CID,
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.via?.uri).toBe(
        "at://did:plc:alice/app.certified.graph.starterpack/3k2abc",
      );
    }
  });

  // subject is an unconstrained at-uri, so a follow may target a record in
  // any collection -- including lexicons defined outside this repository.
  it("should accept a subject in a collection outside this repository", () => {
    const result = EntityFollow.validateMain({
      $type: ids.AppCertifiedGraphEntityFollow,
      subject: "at://did:plc:alice/app.bsky.feed.post/3k2abc",
      createdAt: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
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
      { subject: VALID_AT_URI },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a subject that is not a valid AT-URI", () => {
    const result = validate(
      {
        subject: "not-an-at-uri",
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  // The distinguishing constraint vs app.certified.graph.follow: a bare DID is
  // a valid subject there, but not here.
  it("should reject a bare DID as subject", () => {
    const result = validate(
      {
        subject: VALID_DID,
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
        subject: VALID_AT_URI,
        createdAt: "not-a-datetime",
      },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a via that is not a valid strongRef", () => {
    const result = validate(
      {
        subject: VALID_AT_URI,
        createdAt: "2024-01-01T00:00:00Z",
        via: { uri: "at://did:plc:alice/app.certified.graph.starterpack/x" }, // missing cid
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
        subject: VALID_AT_URI,
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.AppCertifiedGraphEntityFollow,
      "main",
      true,
    );
    expect(result.success).toBe(false);
  });
});
