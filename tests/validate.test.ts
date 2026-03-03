import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons.js";

describe("validate", () => {
  describe("basic validation functionality", () => {
    it("should accept valid record with correct fields", () => {
      const validRights = {
        rightsName: "CC-BY-4.0",
        rightsType: "license",
        rightsDescription: "Creative Commons Attribution 4.0 International",
        createdAt: "2024-01-01T00:00:00Z",
      };

      const result = validate(
        validRights,
        ids.OrgHypercertsClaimRights,
        "main",
        false,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.rightsName).toBe("CC-BY-4.0");
      }
    });

    it("should reject record missing required fields", () => {
      const invalidRights = {
        rightsName: "CC-BY-4.0",
        // missing rightsType, rightsDescription, createdAt
      };

      const result = validate(
        invalidRights,
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
      const invalidRights = {
        rightsName: 123, // should be string
        rightsType: "license",
        rightsDescription: "Description",
        createdAt: "2024-01-01T00:00:00Z",
      };

      const result = validate(
        invalidRights,
        ids.OrgHypercertsClaimRights,
        "main",
        false,
      );
      expect(result.success).toBe(false);
    });

    it("should reject record with invalid datetime format", () => {
      const invalidRights = {
        rightsName: "CC-BY-4.0",
        rightsType: "license",
        rightsDescription: "Description",
        createdAt: "not-a-datetime",
      };

      const result = validate(
        invalidRights,
        ids.OrgHypercertsClaimRights,
        "main",
        false,
      );
      expect(result.success).toBe(false);
    });
  });

  describe("requiredType flag behavior", () => {
    it("should require $type when requiredType is true", () => {
      const recordWithoutType = {
        rightsName: "CC-BY-4.0",
        rightsType: "license",
        rightsDescription: "Description",
        createdAt: "2024-01-01T00:00:00Z",
      };

      const result = validate(
        recordWithoutType,
        ids.OrgHypercertsClaimRights,
        "main",
        true,
      );
      expect(result.success).toBe(false);
    });

    it("should not require $type when requiredType is false", () => {
      const recordWithoutType = {
        rightsName: "CC-BY-4.0",
        rightsType: "license",
        rightsDescription: "Description",
        createdAt: "2024-01-01T00:00:00Z",
      };

      const result = validate(
        recordWithoutType,
        ids.OrgHypercertsClaimRights,
        "main",
        false,
      );
      expect(result.success).toBe(true);
    });

    it("should accept record with $type when requiredType is true", () => {
      const recordWithType = {
        $type: "org.hypercerts.claim.rights",
        rightsName: "CC-BY-4.0",
        rightsType: "license",
        rightsDescription: "Description",
        createdAt: "2024-01-01T00:00:00Z",
      };

      const result = validate(
        recordWithType,
        ids.OrgHypercertsClaimRights,
        "main",
        true,
      );
      expect(result.success).toBe(true);
    });
  });
});
