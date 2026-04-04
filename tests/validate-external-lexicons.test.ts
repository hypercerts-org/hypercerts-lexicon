import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons.js";
import * as Activity from "../generated/types/org/hypercerts/claim/activity.js";
import * as Collection from "../generated/types/org/hypercerts/collection.js";
import * as Attachment from "../generated/types/org/hypercerts/context/attachment.js";
import * as Measurement from "../generated/types/org/hypercerts/context/measurement.js";

/**
 * Minimal valid Leaflet linearDocument (a single text block).
 */
const leafletDescription = {
  $type: "pub.leaflet.pages.linearDocument" as const,
  blocks: [
    {
      $type: "pub.leaflet.pages.linearDocument#block" as const,
      block: {
        $type: "pub.leaflet.blocks.text" as const,
        plaintext: "A rich-text description for testing.",
        facets: [],
      },
    },
  ],
};

/**
 * Minimal valid Bluesky richtext facet (a link annotation).
 */
const bskyFacets = [
  {
    index: { byteStart: 0, byteEnd: 4 },
    features: [
      {
        $type: "app.bsky.richtext.facet#link" as const,
        uri: "https://example.com",
      },
    ],
  },
];

describe("external lexicon validation: pub.leaflet + app.bsky.richtext", () => {
  describe("org.hypercerts.claim.activity", () => {
    it("validates with a Leaflet description", () => {
      const result = Activity.validateMain({
        $type: ids.OrgHypercertsClaimActivity,
        title: "Reforestation 2024",
        shortDescription: "Test activity",
        createdAt: new Date().toISOString(),
        description: leafletDescription,
      });
      expect(result.success).toBe(true);
    });

    it("validates with Bluesky richtext facets", () => {
      const result = Activity.validateMain({
        $type: ids.OrgHypercertsClaimActivity,
        title: "Reforestation 2024",
        shortDescription: "Link here and more",
        createdAt: new Date().toISOString(),
        shortDescriptionFacets: bskyFacets,
      });
      expect(result.success).toBe(true);
    });

    it("validates with both description and facets", () => {
      const result = Activity.validateMain({
        $type: ids.OrgHypercertsClaimActivity,
        title: "Reforestation 2024",
        shortDescription: "Link here and more",
        createdAt: new Date().toISOString(),
        description: leafletDescription,
        shortDescriptionFacets: bskyFacets,
      });
      expect(result.success).toBe(true);
    });

    it("rejects an invalid Leaflet description (missing blocks)", () => {
      const result = validate(
        {
          $type: ids.OrgHypercertsClaimActivity,
          title: "Test",
          shortDescription: "Test",
          createdAt: new Date().toISOString(),
          description: {
            $type: "pub.leaflet.pages.linearDocument",
            // blocks is required but missing
          },
        },
        ids.OrgHypercertsClaimActivity,
        "main",
        true,
      );
      expect(result.success).toBe(false);
    });
  });

  describe("org.hypercerts.collection", () => {
    it("validates with a Leaflet description", () => {
      const result = Collection.validateMain({
        $type: ids.OrgHypercertsCollection,
        title: "Test Collection",
        createdAt: new Date().toISOString(),
        description: leafletDescription,
      });
      expect(result.success).toBe(true);
    });

    it("validates with Bluesky richtext facets", () => {
      const result = Collection.validateMain({
        $type: ids.OrgHypercertsCollection,
        title: "Test Collection",
        shortDescription: "Link here",
        createdAt: new Date().toISOString(),
        shortDescriptionFacets: bskyFacets,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("org.hypercerts.context.attachment", () => {
    it("validates with a Leaflet description", () => {
      const result = Attachment.validateMain({
        $type: ids.OrgHypercertsContextAttachment,
        title: "Evidence document",
        createdAt: new Date().toISOString(),
        description: leafletDescription,
      });
      expect(result.success).toBe(true);
    });

    it("validates with Bluesky richtext facets", () => {
      const result = Attachment.validateMain({
        $type: ids.OrgHypercertsContextAttachment,
        title: "Evidence document",
        shortDescription: "Link here",
        createdAt: new Date().toISOString(),
        shortDescriptionFacets: bskyFacets,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("org.hypercerts.context.measurement", () => {
    it("validates with Bluesky richtext comment facets", () => {
      const result = Measurement.validateMain({
        $type: ids.OrgHypercertsContextMeasurement,
        metric: "carbon_sequestered",
        unit: "tonnes_co2e",
        value: "150.5",
        createdAt: new Date().toISOString(),
        comment: "Link here for details",
        commentFacets: bskyFacets,
      });
      expect(result.success).toBe(true);
    });
  });
});
