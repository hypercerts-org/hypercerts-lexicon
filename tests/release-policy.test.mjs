import { describe, expect, it } from "vitest";
import {
  changesetBump,
  lexiconChangeErrors,
  releasePrErrors,
  withoutDescriptions,
} from "../scripts/check-release-policy.mjs";

describe("Lexicon release policy", () => {
  it("distinguishes text-only edits from changes to the published shape", () => {
    const before = {
      defs: {
        main: {
          description: "Before",
          properties: { title: { type: "string", description: "Old" } },
        },
      },
    };
    const textEdit = {
      defs: {
        main: {
          description: "After",
          properties: { title: { type: "string", description: "New" } },
        },
      },
    };
    const newField = {
      defs: {
        main: {
          properties: {
            title: { type: "string" },
            capturedAt: { type: "string" },
          },
        },
      },
    };
    expect(withoutDescriptions(before)).toEqual(withoutDescriptions(textEdit));
    expect(withoutDescriptions(before)).not.toEqual(
      withoutDescriptions(newField),
    );
  });

  it("reads Changesets for this package only", () => {
    expect(
      changesetBump(
        '---\n"@hypercerts-org/lexicon": minor\n---\n\nAdd a field',
      ),
    ).toBe("minor");
    expect(changesetBump('---\n"other-package": patch\n---\n')).toBeUndefined();
  });

  it("blocks patch for an added field or removed record, but allows text edits", () => {
    const before = JSON.stringify({ defs: { main: { description: "Old" } } });
    const wording = JSON.stringify({ defs: { main: { description: "New" } } });
    const field = JSON.stringify({
      defs: { main: { properties: { capturedAt: { type: "string" } } } },
    });
    expect(
      lexiconChangeErrors("lexicons/example.json", before, wording, ["patch"]),
    ).toEqual([]);
    expect(
      lexiconChangeErrors("lexicons/example.json", before, field, ["patch"]),
    ).toHaveLength(1);
    expect(
      lexiconChangeErrors("lexicons/example.json", before, field, ["minor"]),
    ).toEqual([]);
    expect(
      lexiconChangeErrors("lexicons/example.json", before, null, ["minor"]),
    ).toHaveLength(1);
    expect(
      lexiconChangeErrors("lexicons/example.json", before, null, ["major"]),
    ).toEqual([]);
  });

  it("requires an editorial summary and Docs PR for major/minor Release PRs", () => {
    const raw =
      "# Lexicon\n\n## 1.6.0\n\n### Minor Changes\n\n- Add a field\n\n## 1.5.1\n";
    const summary = raw.replace(
      "### Minor Changes",
      "This release adds a way to date evidence.\n\n### Minor Changes",
    );
    const docs = "https://github.com/hypercerts-org/documentation/pull/173";
    expect(releasePrErrors("1.5.1", "1.6.0", raw, "")).toHaveLength(2);
    expect(releasePrErrors("1.5.1", "1.6.0", summary, docs)).toEqual([]);
    expect(releasePrErrors("1.5.1", "1.5.2", raw, "")).toEqual([]);
  });
});
