import { describe, expect, it } from "vitest";
import { ids, validate } from "../generated/lexicons";
import * as Attachment from "../generated/types/org/hypercerts/context/attachment";

const tag = {
  uri: "at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/org.hypercerts.vocab.tag/field-photo",
  cid: "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy",
};
const base = {
  $type: ids.OrgHypercertsContextAttachment,
  title: "Field photo",
  createdAt: "2026-09-15T00:00:00Z",
};

describe("attachment tags", () => {
  it("keeps existing attachments without tags valid", () => {
    expect(Attachment.validateMain(base).success).toBe(true);
  });

  it.each([0, 1, 20])("accepts %i tag strong references", (count) => {
    const tags = Array.from({ length: count }, (_, i) => ({
      ...tag,
      uri: `${tag.uri}-${i}`,
    }));
    const result = Attachment.validateMain({ ...base, tags });
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.tags).toEqual(tags);
  });

  it.each([
    { tags: Array.from({ length: 21 }, () => tag) },
    { tags: [{ uri: tag.uri }] },
    { tags: [{ cid: tag.cid }] },
    { tags: ["field-photo"] },
  ])("rejects invalid tag arrays: %j", ({ tags }) => {
    expect(
      validate({ ...base, tags }, ids.OrgHypercertsContextAttachment, "main", false).success,
    ).toBe(false);
  });
});
