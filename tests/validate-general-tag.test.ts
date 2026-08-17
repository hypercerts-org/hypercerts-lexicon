import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons";
import * as Tag from "../generated/types/org/hypercerts/tag";
import * as Collection from "../generated/types/org/hypercerts/collection";

const VALID_TAG_URI =
  "at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/org.hypercerts.tag/zone-role.site";
const VALID_CID = "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";

describe("org.hypercerts.tag", () => {
  it("should accept a minimal valid tag record", () => {
    const result = Tag.validateMain({
      $type: ids.OrgHypercertsTag,
      key: "site",
      name: "Project site",
      category: "zone-role",
      status: "accepted",
      createdAt: "2026-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.category).toBe("zone-role");
    }
  });

  it("should accept a tag with lifecycle, hierarchy, and crosswalk fields", () => {
    const result = Tag.validateMain({
      $type: ids.OrgHypercertsTag,
      key: "mangrove",
      name: "Mangrove",
      category: "land-cover",
      status: "deprecated",
      description: "Mangrove forest cover.",
      broader: [{ uri: VALID_TAG_URI, cid: VALID_CID }],
      supersededBy: { uri: VALID_TAG_URI, cid: VALID_CID },
      aliases: ["mangal"],
      sameAs: ["http://purl.obolibrary.org/obo/ENVO_01000181"],
      createdAt: "2026-01-01T00:00:00Z",
      signatures: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.supersededBy?.uri).toBe(VALID_TAG_URI);
    }
  });

  it("should reject a tag missing required category", () => {
    const result = validate(
      {
        key: "site",
        name: "Project site",
        status: "accepted",
        createdAt: "2026-01-01T00:00:00Z",
      },
      ids.OrgHypercertsTag,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a tag missing required status", () => {
    const result = validate(
      {
        key: "site",
        name: "Project site",
        category: "zone-role",
        createdAt: "2026-01-01T00:00:00Z",
      },
      ids.OrgHypercertsTag,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });
});

describe("org.hypercerts.collection tags field", () => {
  it("should accept a collection with governed tags", () => {
    const result = Collection.validateMain({
      $type: ids.OrgHypercertsCollection,
      type: "project",
      title: "Coastal restoration project",
      tags: [{ uri: VALID_TAG_URI, cid: VALID_CID }],
      createdAt: "2026-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.tags?.[0]?.uri).toBe(VALID_TAG_URI);
    }
  });

  it("should accept a collection without tags (field is optional)", () => {
    const result = Collection.validateMain({
      $type: ids.OrgHypercertsCollection,
      title: "Untagged collection",
      createdAt: "2026-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("should reject a tags entry that is not a full strong reference", () => {
    const result = validate(
      {
        title: "Bad tags collection",
        tags: [{ uri: VALID_TAG_URI }],
        createdAt: "2026-01-01T00:00:00Z",
      },
      ids.OrgHypercertsCollection,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });
});
