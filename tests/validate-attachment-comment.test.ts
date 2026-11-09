import { describe, expect, it } from "vitest";
import { ids, schemaDict } from "../generated/lexicons";
import * as Attachment from "../generated/types/org/hypercerts/context/attachment";

// A comment is an attachment whose subjects point at the record it comments
// on (TECH-856). These tests pin that `comment` is a known contentType and that
// a comment on another attachment validates.

const VALID_CID = "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";

describe("org.hypercerts.context.attachment as a comment", () => {
  it("publishes comment as a known contentType", () => {
    const contentType =
      schemaDict.OrgHypercertsContextAttachment.defs.main.record.properties.contentType;

    expect(contentType.knownValues).toContain("comment");
  });

  it("accepts a comment on another attachment", () => {
    const update = {
      uri: "at://did:plc:alice/org.hypercerts.context.attachment/3k2abc",
      cid: VALID_CID,
    };
    const result = Attachment.validateMain({
      $type: ids.OrgHypercertsContextAttachment,
      title: "Comment",
      contentType: "comment",
      subjects: [update],
      shortDescription: "¡Qué buena noticia!",
      createdAt: "2026-11-09T00:00:00Z",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.contentType).toBe("comment");
      expect(result.value.subjects).toEqual([update]);
    }
  });
});
