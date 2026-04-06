import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons.js";
import * as Rights from "../generated/types/org/hypercerts/claim/rights.js";

describe("org.hypercerts.claim.rights", () => {
  it("should accept valid record with correct fields", () => {
    const result = Rights.validateMain({
      $type: ids.OrgHypercertsClaimRights,
      rightsName: "CC-BY-4.0",
      rightsType: "license",
      rightsDescription: "Creative Commons Attribution 4.0 International",
      createdAt: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.rightsName).toBe("CC-BY-4.0");
    }
  });

  it("should reject record missing required fields", () => {
    const result = validate(
      { rightsName: "CC-BY-4.0" },
      ids.OrgHypercertsClaimRights,
      "main",
      false,
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("should reject record with invalid field types", () => {
    const result = validate(
      {
        rightsName: 123, // should be string
        rightsType: "license",
        rightsDescription: "Description",
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.OrgHypercertsClaimRights,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject record with invalid datetime format", () => {
    const result = validate(
      {
        rightsName: "CC-BY-4.0",
        rightsType: "license",
        rightsDescription: "Description",
        createdAt: "not-a-datetime",
      },
      ids.OrgHypercertsClaimRights,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should require $type when requiredType is true", () => {
    const result = validate(
      {
        rightsName: "CC-BY-4.0",
        rightsType: "license",
        rightsDescription: "Description",
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.OrgHypercertsClaimRights,
      "main",
      true,
    );
    expect(result.success).toBe(false);
  });

  it("should not require $type when requiredType is false", () => {
    const result = validate(
      {
        rightsName: "CC-BY-4.0",
        rightsType: "license",
        rightsDescription: "Description",
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.OrgHypercertsClaimRights,
      "main",
      false,
    );
    expect(result.success).toBe(true);
  });

  it("should accept record with $type when requiredType is true", () => {
    const result = Rights.validateMain({
      $type: ids.OrgHypercertsClaimRights,
      rightsName: "CC-BY-4.0",
      rightsType: "license",
      rightsDescription: "Description",
      createdAt: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });
});
