import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons.js";
import * as BadgeAward from "../generated/types/app/certified/badge/award.js";

const VALID_DID = "did:plc:ewvi7nxzyoun6zhxrhs64oiz";
const VALID_CID = "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";

const baseAward = {
  badge: {
    uri: "at://did:plc:issuer/app.certified.badge.definition/3kabc1",
    cid: VALID_CID,
  },
  subject: { $type: "app.certified.defs#did", did: VALID_DID },
  createdAt: "2026-09-29T00:00:00.000Z",
};

describe("app.certified.badge.award", () => {
  it("should accept an award without a validity window", () => {
    const result = BadgeAward.validateMain({
      $type: ids.AppCertifiedBadgeAward,
      ...baseAward,
    });
    expect(result.success).toBe(true);
  });

  it("should accept an award with validFrom and validUntil", () => {
    const result = BadgeAward.validateMain({
      $type: ids.AppCertifiedBadgeAward,
      ...baseAward,
      validFrom: "2019-06-01T00:00:00.000Z",
      validUntil: "2027-06-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.validFrom).toBe("2019-06-01T00:00:00.000Z");
      expect(result.value.validUntil).toBe("2027-06-01T00:00:00.000Z");
    }
  });

  it("should reject a validUntil that is not a datetime", () => {
    const result = validate(
      { ...baseAward, validUntil: "next year" },
      ids.AppCertifiedBadgeAward,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });
});
