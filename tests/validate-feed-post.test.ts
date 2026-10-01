import { describe, it, expect } from "vitest";
import { BlobRef } from "@atproto/lexicon";
import { CID } from "multiformats/cid";
import { validate, ids } from "../generated/lexicons";
import * as Post from "../generated/types/app/certified/feed/post";

const VALID_CID = "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";
const BLOB_CID = "bafkreibme22gw2h7y2h7tg2fhqotaqjucnbc24deqo72b6mkl2egezxhvy";
const CREATED_AT = "2024-01-01T00:00:00Z";

const ROOT = {
  uri: "at://did:plc:alice/app.certified.feed.post/3k2abc",
  cid: VALID_CID,
};
const PARENT = {
  uri: "at://did:plc:bob/app.certified.feed.post/3k2def",
  cid: VALID_CID,
};
const ACTIVITY = {
  uri: "at://did:plc:alice/org.hypercerts.claim.activity/3k2ghi",
  cid: VALID_CID,
};

const image = () => new BlobRef(CID.parse(BLOB_CID), "image/jpeg", 123456);

const imagesEmbed = () => ({
  $type: "app.bsky.embed.images",
  images: [
    {
      image: image(),
      alt: "Saplings planted along the river bank",
      aspectRatio: { width: 4, height: 3 },
    },
  ],
});

describe("app.certified.feed.post", () => {
  it("should accept a standalone text post", () => {
    const result = Post.validateMain({
      $type: ids.AppCertifiedFeedPost,
      text: "Planted 1,200 trees this week.",
      createdAt: CREATED_AT,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.text).toBe("Planted 1,200 trees this week.");
      expect(result.value.reply).toBeUndefined();
    }
  });

  it("should accept a post without text (text is optional)", () => {
    const result = Post.validateMain({
      $type: ids.AppCertifiedFeedPost,
      embed: imagesEmbed(),
      createdAt: CREATED_AT,
    });
    expect(result.success).toBe(true);
  });

  it("should accept facets, langs, self-labels, and tags", () => {
    const result = Post.validateMain({
      $type: ids.AppCertifiedFeedPost,
      text: "Update from #reforestation",
      facets: [
        {
          index: { byteStart: 12, byteEnd: 26 },
          features: [
            { $type: "app.bsky.richtext.facet#tag", tag: "reforestation" },
          ],
        },
      ],
      langs: ["en", "pt-BR"],
      labels: {
        $type: "com.atproto.label.defs#selfLabels",
        values: [{ val: "graphic-media" }],
      },
      tags: ["mangroves", "q3-report"],
      createdAt: CREATED_AT,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.langs).toEqual(["en", "pt-BR"]);
      expect(result.value.tags).toHaveLength(2);
    }
  });

  it("should accept a reply with root and parent strongRefs", () => {
    const result = Post.validateMain({
      $type: ids.AppCertifiedFeedPost,
      text: "Great progress!",
      reply: { root: ROOT, parent: PARENT },
      createdAt: CREATED_AT,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.reply?.root.uri).toBe(ROOT.uri);
      expect(result.value.reply?.parent.uri).toBe(PARENT.uri);
    }
  });

  it("should reject a reply missing parent", () => {
    const result = validate(
      { text: "Hi", reply: { root: ROOT }, createdAt: CREATED_AT },
      ids.AppCertifiedFeedPost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a reply whose parent has no cid (strongRef required)", () => {
    const result = validate(
      {
        text: "Hi",
        reply: { root: ROOT, parent: { uri: PARENT.uri } },
        createdAt: CREATED_AT,
      },
      ids.AppCertifiedFeedPost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should accept an images embed", () => {
    const result = Post.validateMain({
      $type: ids.AppCertifiedFeedPost,
      text: "Before and after.",
      embed: imagesEmbed(),
      createdAt: CREATED_AT,
    });
    expect(result.success).toBe(true);
  });

  it("should accept an external link card embed", () => {
    const result = Post.validateMain({
      $type: ids.AppCertifiedFeedPost,
      text: "Our annual report is out.",
      embed: {
        $type: "app.bsky.embed.external",
        external: {
          uri: "https://example.org/report-2024",
          title: "Annual report 2024",
          description: "What we did and what it changed.",
        },
      },
      createdAt: CREATED_AT,
    });
    expect(result.success).toBe(true);
  });

  it("should accept a quoted record embed pointing at any lexicon", () => {
    const result = Post.validateMain({
      $type: ids.AppCertifiedFeedPost,
      text: "New hypercert published.",
      embed: { $type: "app.bsky.embed.record", record: ACTIVITY },
      createdAt: CREATED_AT,
    });
    expect(result.success).toBe(true);
  });

  it("should accept a quoted record with media", () => {
    const result = Post.validateMain({
      $type: ids.AppCertifiedFeedPost,
      text: "Photos from the site visit.",
      embed: {
        $type: "app.bsky.embed.recordWithMedia",
        record: { $type: "app.bsky.embed.record", record: ACTIVITY },
        media: imagesEmbed(),
      },
      createdAt: CREATED_AT,
    });
    expect(result.success).toBe(true);
  });

  it("should reject an images embed whose image is missing alt", () => {
    const result = validate(
      {
        embed: {
          $type: "app.bsky.embed.images",
          images: [{ image: image() }],
        },
        createdAt: CREATED_AT,
      },
      ids.AppCertifiedFeedPost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a quoted record without a cid", () => {
    const result = validate(
      {
        embed: {
          $type: "app.bsky.embed.record",
          record: { uri: ACTIVITY.uri },
        },
        createdAt: CREATED_AT,
      },
      ids.AppCertifiedFeedPost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should accept URI and blob attachments", () => {
    const result = Post.validateMain({
      $type: ids.AppCertifiedFeedPost,
      text: "Full report attached.",
      attachments: [
        {
          $type: "org.hypercerts.defs#uri",
          uri: "https://example.org/report.pdf",
        },
        {
          $type: "org.hypercerts.defs#smallBlob",
          blob: new BlobRef(CID.parse(BLOB_CID), "application/pdf", 54321),
        },
      ],
      createdAt: CREATED_AT,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.attachments).toHaveLength(2);
    }
  });

  it("should reject text over 5000 graphemes", () => {
    const result = validate(
      { text: "a".repeat(5001), createdAt: CREATED_AT },
      ids.AppCertifiedFeedPost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject more than 8 tags", () => {
    const result = validate(
      {
        text: "Tagged",
        tags: ["a", "b", "c", "d", "e", "f", "g", "h", "i"],
        createdAt: CREATED_AT,
      },
      ids.AppCertifiedFeedPost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject more than 3 langs", () => {
    const result = validate(
      { text: "Hi", langs: ["en", "de", "fr", "es"], createdAt: CREATED_AT },
      ids.AppCertifiedFeedPost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a record missing required createdAt", () => {
    const result = validate(
      { text: "No timestamp" },
      ids.AppCertifiedFeedPost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject an invalid datetime", () => {
    const result = validate(
      { text: "Hi", createdAt: "not-a-datetime" },
      ids.AppCertifiedFeedPost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should require $type when requiredType is true", () => {
    const result = validate(
      { text: "Hi", createdAt: CREATED_AT },
      ids.AppCertifiedFeedPost,
      "main",
      true,
    );
    expect(result.success).toBe(false);
  });
});
