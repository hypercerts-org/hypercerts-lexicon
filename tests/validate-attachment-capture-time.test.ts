import { describe, it, expect } from "vitest";
import { validate, ids } from "../generated/lexicons";
import * as Attachment from "../generated/types/org/hypercerts/context/attachment";

const base = {
  $type: ids.OrgHypercertsContextAttachment,
  title: "Historical capture",
  createdAt: "2026-09-15T00:00:00Z",
};

function validateCapturedAt(capturedAt: unknown) {
  return validate(
    { ...base, capturedAt },
    ids.OrgHypercertsContextAttachment,
    "main",
    false,
  );
}

describe("org.hypercerts.context.attachment capturedAt", () => {
  it.each([
    "2019-07-14T01:22:05Z",
    "2019-07-14T01:22:05.123Z",
    "2019-07-14T13:22:05+12:00",
    "2019-07-14T13:22:05.123456-07:00",
  ])("accepts a full datetime with timezone: %s", (capturedAt) => {
    const result = Attachment.validateMain({ ...base, capturedAt });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.capturedAt).toBe(capturedAt);
      expect(result.value.createdAt).toBe(base.createdAt);
    }
  });

  it("remains optional", () => {
    expect(Attachment.validateMain(base).success).toBe(true);
  });

  it.each([
    ["date-only", "2019-07-14"],
    ["minute precision", "2019-07-14T13:22Z"],
    ["space separator", "2019-07-14 13:22:05Z"],
    ["unknown-offset -00:00", "2019-07-14T13:22:05-00:00"],
    ["non-datetime string", "not a datetime"],
    ["number", 1563067325],
    ["object", { value: "2019-07-14T13:22:05Z" }],
  ])("rejects %s", (_label, capturedAt) => {
    expect(validateCapturedAt(capturedAt).success).toBe(false);
  });

  it("documents that the installed validator accepts offsetless local times", () => {
    // The atproto spec lists offsetless datetimes (e.g.
    // "1985-04-12T23:20:50.123") as invalid because timezone is required,
    // but @atproto/lexicon's datetime validator currently accepts them.
    // This gap affects every datetime field; publishers with only a local
    // time must omit capturedAt rather than rely on validation to catch it.
    // If this assertion starts failing, the validator has been tightened
    // and this case can move into the rejection table above.
    expect(validateCapturedAt("2019-07-14T13:22:05").success).toBe(true);
  });
});
