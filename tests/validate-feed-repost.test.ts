import { describe, expect, it } from "vitest";
import { ids, validate } from "../generated/lexicons";
import * as Repost from "../generated/types/app/certified/feed/repost";

const VALID_CID = "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";
const SUBJECT = {
  uri: "at://did:plc:alice/org.hypercerts.claim.activity/3k2abc",
  cid: VALID_CID,
};
const VIA = {
  uri: "at://did:plc:bob/app.certified.feed.repost/3k2def",
  cid: VALID_CID,
};

describe("app.certified.feed.repost", () => {
  it("should accept a valid repost record (subject + createdAt only)", () => {
    const result = Repost.validateMain({
      $type: ids.AppCertifiedFeedRepost,
      subject: SUBJECT,
      createdAt: "2024-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.subject.uri).toBe(SUBJECT.uri);
      expect(result.value.subject.cid).toBe(VALID_CID);
    }
  });

  it("should accept a repost record with optional via strongRef", () => {
    const result = Repost.validateMain({
      $type: ids.AppCertifiedFeedRepost,
      subject: SUBJECT,
      createdAt: "2024-01-01T00:00:00Z",
      via: VIA,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.via?.uri).toBe(VIA.uri);
    }
  });

  it("should reject a record missing required subject", () => {
    const result = validate(
      { createdAt: "2024-01-01T00:00:00Z" },
      ids.AppCertifiedFeedRepost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a record missing required createdAt", () => {
    const result = validate({ subject: SUBJECT }, ids.AppCertifiedFeedRepost, "main", false);
    expect(result.success).toBe(false);
  });

  it("should reject a subject without a cid (strongRef required)", () => {
    const result = validate(
      {
        subject: { uri: SUBJECT.uri },
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.AppCertifiedFeedRepost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a bare AT-URI string as subject", () => {
    const result = validate(
      {
        subject: SUBJECT.uri,
        createdAt: "2024-01-01T00:00:00Z",
      },
      ids.AppCertifiedFeedRepost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject an invalid datetime", () => {
    const result = validate(
      { subject: SUBJECT, createdAt: "not-a-datetime" },
      ids.AppCertifiedFeedRepost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should reject a via that is not a valid strongRef", () => {
    const result = validate(
      {
        subject: SUBJECT,
        createdAt: "2024-01-01T00:00:00Z",
        via: { uri: VIA.uri }, // missing cid
      },
      ids.AppCertifiedFeedRepost,
      "main",
      false,
    );
    expect(result.success).toBe(false);
  });

  it("should require $type when requiredType is true", () => {
    const result = validate(
      { subject: SUBJECT, createdAt: "2024-01-01T00:00:00Z" },
      ids.AppCertifiedFeedRepost,
      "main",
      true,
    );
    expect(result.success).toBe(false);
  });
});
