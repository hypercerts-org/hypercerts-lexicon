import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons.js";
import * as Organization from "../generated/types/app/certified/actor/organization.js";

describe("app.certified.actor.organization", () => {
  it("should accept a minimal valid record (only required createdAt)", () => {
    const result = Organization.validateMain({
      $type: ids.AppCertifiedActorOrganization,
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("should accept record with visibility set to 'public'", () => {
    const result = Organization.validateMain({
      $type: ids.AppCertifiedActorOrganization,
      visibility: "public",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.visibility).toBe("public");
    }
  });

  it("should accept record with visibility set to 'unlisted'", () => {
    const result = Organization.validateMain({
      $type: ids.AppCertifiedActorOrganization,
      visibility: "unlisted",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.visibility).toBe("unlisted");
    }
  });

  it("should accept record with inline longDescription", () => {
    const result = Organization.validateMain({
      $type: ids.AppCertifiedActorOrganization,
      longDescription: {
        $type: "org.hypercerts.defs#descriptionString",
        value: "Our mission is to restore mangrove ecosystems worldwide.",
      },
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("should accept record with all optional fields populated", () => {
    const result = Organization.validateMain({
      $type: ids.AppCertifiedActorOrganization,
      organizationType: ["nonprofit", "ngo"],
      urls: [{ url: "https://example.org", label: "Website" }],
      foundedDate: "2010-01-01T00:00:00.000Z",
      longDescription: {
        $type: "org.hypercerts.defs#descriptionString",
        value: "Full org description in markdown.",
      },
      visibility: "public",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("should reject record missing required createdAt", () => {
    const result = validate(
      { organizationType: ["nonprofit"] },
      ids.AppCertifiedActorOrganization,
      "main",
      false,
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("should reject record with invalid createdAt format", () => {
    const result = validate(
      {
        createdAt: "not-a-datetime",
      },
      ids.AppCertifiedActorOrganization,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });
});
