import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons";
import * as Attachment from "../generated/types/org/hypercerts/context/attachment";

// An attachment without `subjects` is a standalone update by its author
// (TECH-705). These tests pin that contract: no subjects is valid, `update`
// is a known contentType, and the vocabulary stays open.

const VALID_CID = "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy";
const createdAt = "2026-10-20T00:00:00Z";

const standaloneUpdate = {
  $type: ids.OrgHypercertsContextAttachment,
  title: "Primeras lluvias en el vivero",
  contentType: "update",
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
  it("accepts an update with no subjects", () => {
    const result = Attachment.validateMain(standaloneUpdate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.subjects).toBeUndefined();
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

  it("accepts a minimal update: title and createdAt only", () => {
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
