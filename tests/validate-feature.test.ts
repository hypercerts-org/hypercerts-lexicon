import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons";
import * as Feature from "../generated/types/org/hypercerts/feature";

const VALID_LOCATION_URI =
  "at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/app.certified.location/3k2abc";
const VALID_TAG_URI =
  "at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/org.hypercerts.tag/zone-role.site";
const VALID_CID = "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";

describe("org.hypercerts.feature", () => {
  it("should accept a minimal valid feature (title + createdAt only)", () => {
    const result = Feature.validateMain({
      $type: ids.OrgHypercertsFeature,
      title: "North restoration area",
      createdAt: "2026-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("should accept a spatial feature with type, locations, tags, and sameAs", () => {
    const result = Feature.validateMain({
      $type: ids.OrgHypercertsFeature,
      type: "zone",
      title: "North restoration area",
      locations: [{ uri: VALID_LOCATION_URI, cid: VALID_CID }],
      tags: [{ uri: VALID_TAG_URI, cid: VALID_CID }],
      sameAs: ["https://cadastre.example.org/parcel/12345"],
      createdAt: "2026-01-01T00:00:00Z",
      signatures: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.locations?.[0]?.uri).toBe(VALID_LOCATION_URI);
      expect(result.value.type).toBe("zone");
    }
  });

  it("should accept a non-spatial feature (no locations)", () => {
    const result = Feature.validateMain({
      $type: ids.OrgHypercertsFeature,
      type: "stratum",
      title: "Riparian stratum v2",
      tags: [{ uri: VALID_TAG_URI, cid: VALID_CID }],
      createdAt: "2026-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("should reject a feature missing required title", () => {
    const result = validate(
      {
        type: "zone",
        createdAt: "2026-01-01T00:00:00Z",
      },
      ids.OrgHypercertsFeature,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a locations entry that is not a full strong reference", () => {
    const result = validate(
      {
        title: "Bad locations feature",
        locations: [{ uri: VALID_LOCATION_URI }],
        createdAt: "2026-01-01T00:00:00Z",
      },
      ids.OrgHypercertsFeature,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a sameAs entry that is not a URI", () => {
    const result = validate(
      {
        title: "Bad sameAs feature",
        sameAs: ["not a uri"],
        createdAt: "2026-01-01T00:00:00Z",
      },
      ids.OrgHypercertsFeature,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });
});
