import { describe, expect, it } from "vitest";
import {
  changesetBump,
  lexiconChangeErrors,
  releaseKind,
  releasePrErrors,
  requiredBump,
  withoutDescriptions,
} from "../scripts/check-release-policy.mjs";

const lexicon = (id, properties, description = "A record") => ({
  lexicon: 1,
  id,
  defs: { main: { type: "record", description, properties } },
});
const byId = (...lexicons) => new Map(lexicons.map((item) => [item.id, item]));

const title = { title: { type: "string", description: "Old" } };
const before = byId(lexicon("org.example.claim", title));

describe("Lexicon release policy", () => {
  it("ignores description prose but keeps properties named description", () => {
    const withField = {
      properties: { description: { type: "string", description: "Prose" } },
    };
    expect(withoutDescriptions(withField)).toEqual({
      properties: { description: { type: "string" } },
    });
  });

  it("reads Changesets for this package only", () => {
    expect(
      changesetBump(
        '---\n"@hypercerts-org/lexicon": minor\n---\n\nAdd a field',
      ),
    ).toBe("minor");
    expect(changesetBump('---\n"other-package": patch\n---\n')).toBeUndefined();
  });

  it("allows patch only for description edits and key reordering", () => {
    const wording = byId(
      lexicon(
        "org.example.claim",
        { title: { description: "New", type: "string" } },
        "Reworded",
      ),
    );
    expect(requiredBump(before, wording).required).toBe("patch");
    expect(lexiconChangeErrors(before, wording, ["patch"])).toEqual([]);
  });

  it("requires minor for an optional field, even one named description", () => {
    for (const field of [
      { capturedAt: { type: "string", format: "datetime" } },
      { description: { type: "string" } },
    ]) {
      const after = byId(lexicon("org.example.claim", { ...title, ...field }));
      expect(lexiconChangeErrors(before, after, ["patch"])).toHaveLength(1);
      expect(lexiconChangeErrors(before, after, ["minor"])).toEqual([]);
    }
  });

  it("requires major for a removed Lexicon but not for a moved file", () => {
    expect(lexiconChangeErrors(before, new Map(), ["minor"])).toHaveLength(1);
    expect(lexiconChangeErrors(before, new Map(), ["major"])).toEqual([]);
    // Keyed by NSID, so the same `id` at a new path is unchanged.
    expect(requiredBump(before, byId(...before.values())).changes).toEqual([]);
  });

  it("classifies releases, including promotion from a prerelease", () => {
    expect(releaseKind("1.5.1", "1.5.2")).toBe("patch");
    expect(releaseKind("1.5.1", "1.6.0")).toBe("minor");
    expect(releaseKind("1.5.1", "2.0.0")).toBe("major");
    expect(releaseKind("1.6.0-beta.2", "1.6.0")).toBe("minor");
    expect(releaseKind("2.0.0-beta.0", "2.0.0")).toBe("major");
    expect(releaseKind("1.5.2-beta.0", "1.5.2")).toBe("patch");
  });

  it("requires a Docs PR link for minor/major Release PRs", () => {
    const minor = { required: "minor", changes: ["added org.example.claim"] };
    const none = { required: "patch", changes: [] };
    const short = "Release note: hypercerts-org/documentation#173";
    const url = "https://github.com/hypercerts-org/documentation/pull/173";
    expect(releasePrErrors("1.5.1", "1.6.0", "", minor)).toHaveLength(1);
    expect(releasePrErrors("1.5.1", "1.6.0", short, minor)).toEqual([]);
    expect(releasePrErrors("1.5.1", "1.6.0", url, minor)).toEqual([]);
    expect(releasePrErrors("1.6.0-beta.2", "1.6.0", "", minor)).toHaveLength(1);
    expect(releasePrErrors("1.5.1", "1.5.2", "", none)).toEqual([]);
  });

  it("rejects a patch release that contains schema changes", () => {
    const minor = { required: "minor", changes: ["changed org.example.claim"] };
    expect(releasePrErrors("1.5.1", "1.5.2", "", minor)).toHaveLength(1);
  });
});
