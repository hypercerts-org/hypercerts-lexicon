import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons";
import * as Follow from "../generated/types/app/certified/graph/follow";

const VALID_DID = "did:plc:ewvi7nxzyoun6zhxrhs64oiz";
const VALID_CID = "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";

describe("app.certified.graph.follow", () => {
  it("should accept a valid follow record (subject + createdAt only)", () => {
    const result = Follow.validateMain({
      $type: ids.AppCertifiedGraphFollow,
      subject: VALID_DID,
      createdAt: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.subject).toBe(VALID_DID);
    }
  });

  it("should accept a follow record with optional via strongRef", () => {
    const result = Follow.validateMain({
      $type: ids.AppCertifiedGraphFollow,
      subject: VALID_DID,
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

  it("should reject a record missing required subject", () => {
    const result = validate(
      { createdAt: "2024-01-01T00:00:00Z" },
      ids.AppCertifiedGraphFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a record missing required createdAt", () => {
    const result = validate(
      { subject: VALID_DID },
      ids.AppCertifiedGraphFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a subject that is not a valid DID", () => {
    const result = validate(
      {
        subject: "not-a-did",
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.AppCertifiedGraphFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject an invalid datetime", () => {
    const result = validate(
      {
        subject: VALID_DID,
        createdAt: "not-a-datetime",
      },
      ids.AppCertifiedGraphFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a via that is not a valid strongRef", () => {
    const result = validate(
      {
        subject: VALID_DID,
        createdAt: "2024-01-01T00:00:00Z",
        via: { uri: "at://did:plc:alice/app.certified.graph.starterpack/x" }, // missing cid
      },
      ids.AppCertifiedGraphFollow,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should require $type when requiredType is true", () => {
    const result = validate(
      {
        subject: VALID_DID,
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.AppCertifiedGraphFollow,
      "main",
      true,
    );
    expect(result.success).toBe(false);
  });
});
