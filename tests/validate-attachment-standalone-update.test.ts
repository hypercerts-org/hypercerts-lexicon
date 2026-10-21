import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons";
import * as Attachment from "../generated/types/org/hypercerts/context/attachment";

// A standalone update by its author takes the author's own profile as its
// subject (TECH-705). These tests pin that contract: a profile subject is
// valid, `update` is a known contentType, `subjects` stays optional, and the
// vocabulary stays open.

const VALID_CID = "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";
const createdAt = "2026-10-20T00:00:00Z";
const authorProfile = {
  uri: "at://did:plc:alice/app.certified.actor.profile/self",
  cid: VALID_CID,
};

const standaloneUpdate = {
  $type: ids.OrgHypercertsContextAttachment,
  title: "Primeras lluvias en el vivero",
  contentType: "update",
  subjects: [authorProfile],
  shortDescription: "Las plántulas de encino ya tienen hojas nuevas.",
  description: {
    $type: "org.hypercerts.defs#descriptionString",
    value: "Después de tres semanas de sequía, las primeras lluvias...",
  },
  content: [
    {
      $type: "org.hypercerts.defs#uri",
      uri: "https://example.com/photos/vivero-octubre.jpg",
    },
  ],
  createdAt,
};

describe("org.hypercerts.context.attachment as a standalone update", () => {
  it("accepts an update with the author's profile as subject", () => {
    const result = Attachment.validateMain(standaloneUpdate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.subjects).toEqual([authorProfile]);
      expect(result.value.contentType).toBe("update");
      expect(result.value.title).toBe("Primeras lluvias en el vivero");
    }
  });

  it("accepts the same record as a project update with subjects", () => {
    const result = Attachment.validateMain({
      ...standaloneUpdate,
      subjects: [
        {
          uri: "at://did:plc:alice/org.hypercerts.claim.activity/3k2abc",
          cid: VALID_CID,
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.subjects).toHaveLength(1);
    }
  });

  it("accepts a minimal attachment: title and createdAt only, no subjects", () => {
    expect(
      Attachment.validateMain({
        $type: ids.OrgHypercertsContextAttachment,
        title: "Hola",
        createdAt,
      }).success,
    ).toBe(true);
  });

  it("keeps contentType an open vocabulary", () => {
    for (const contentType of ["update", "report", "post", "coffee"]) {
      expect(
        Attachment.validateMain({ ...standaloneUpdate, contentType }).success,
      ).toBe(true);
    }
  });

  it("still requires a title", () => {
    const { title: _title, ...noTitle } = standaloneUpdate;
    expect(
      validate(noTitle, ids.OrgHypercertsContextAttachment, "main", false)
        .success,
    ).toBe(false);
  });
});
