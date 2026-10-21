import { describe, expect, it } from "vitest";
import {
  changesetBump,
  contributorErrors,
  releaseKind,
  releasePrErrors,
} from "../scripts/check-release-policy.mjs";

describe("Lexicon release policy", () => {
  it("reads Changesets for this package only", () => {
    expect(
      changesetBump(
        '---\n"@hypercerts-org/lexicon": minor\n---\n\nAdd a field',
      ),
    ).toBe("minor");
    expect(changesetBump('---\n"other-package": patch\n---\n')).toBeUndefined();
  });

  it("requires a minor or major Changeset for any Lexicon change", () => {
    expect(contributorErrors(true, [])).toHaveLength(1);
    expect(contributorErrors(true, ["patch"])).toHaveLength(1);
    expect(contributorErrors(true, ["minor"])).toEqual([]);
    expect(contributorErrors(true, ["patch", "major"])).toEqual([]);
    expect(contributorErrors(false, [])).toEqual([]);
  });

  it("classifies releases, including promotion from a prerelease", () => {
    expect(releaseKind("1.5.1", "1.5.2")).toBe("patch");
    expect(releaseKind("1.5.1", "1.6.0")).toBe("minor");
    expect(releaseKind("1.5.1", "2.0.0")).toBe("major");
    expect(releaseKind("1.6.0-beta.2", "1.6.0")).toBe("minor");
    expect(releaseKind("2.0.0-beta.0", "2.0.0")).toBe("major");
    expect(releaseKind("1.5.2-beta.0", "1.5.2")).toBe("patch");
  });

  it("rejects a patch release that changes Lexicons", () => {
    expect(releasePrErrors("1.5.1", "1.5.2", true, "")).toHaveLength(1);
    expect(releasePrErrors("1.5.1", "1.5.2", false, "")).toEqual([]);
  });

  it("requires a Docs PR link for minor/major Release PRs", () => {
    const short = "Release note: hypercerts-org/documentation#173";
    const url = "https://github.com/hypercerts-org/documentation/pull/173";
    expect(releasePrErrors("1.5.1", "1.6.0", true, "")).toHaveLength(1);
    expect(releasePrErrors("1.5.1", "1.6.0", true, short)).toEqual([]);
    expect(releasePrErrors("1.5.1", "1.6.0", true, url)).toEqual([]);
    expect(releasePrErrors("1.6.0-beta.2", "1.6.0", true, "")).toHaveLength(1);
  });
});
