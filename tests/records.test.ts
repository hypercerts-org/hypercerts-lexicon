import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as records from "../generated/records/index.js";
import { app, org } from "../generated/records/index.js";

type Activity = org.hypercerts.claim.activity.Main;
type BadgeAward = app.certified.badge.award.Main;

/** Follows an NSID through lex's namespace tree: org.hypercerts.claim.activity. */
function lookup(nsid: string): unknown {
  return nsid
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined,
      records,
    );
}

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const lexiconsDir = join(projectRoot, "lexicons");

function lexiconFiles(): {
  path: string;
  doc: { id: string; defs?: { main?: { type?: string } } };
}[] {
  return readdirSync(lexiconsDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => {
      const file = join(entry.parentPath, entry.name);
      return {
        path: relative(lexiconsDir, file).split(sep).join("/"),
        doc: JSON.parse(readFileSync(file, "utf-8")),
      };
    });
}

function recordNsids(): string[] {
  return lexiconFiles()
    .filter(({ doc }) => doc.defs?.main?.type === "record")
    .map(({ doc }) => doc.id)
    .sort();
}

const validActivity = {
  $type: "org.hypercerts.claim.activity",
  title: "Reforestation in the Amazon Basin 2026",
  shortDescription: "Planting native trees on degraded pasture.",
  createdAt: "2026-10-30T12:00:00.000Z",
} satisfies Activity;

describe("@hypercerts-org/lexicon/records", () => {
  it("exports lex's NSID namespace tree", () => {
    expect(Object.keys(records).sort()).toEqual(["app", "com", "org", "pub"]);
  });

  it("has a record schema at the NSID path of every record lexicon", () => {
    const nsids = recordNsids();
    expect(nsids).toHaveLength(27);
    for (const nsid of nsids) {
      const node = lookup(nsid) as
        { $type?: string; main?: { type?: string } } | undefined;
      expect(node?.$type, nsid).toBe(nsid);
      expect(node?.main?.type, nsid).toBe("record");
    }
  });

  // `@hypercerts-org/lexicon/records/<nsid path>.defs` is public API (the
  // `./records/*` export), so the per-lexicon layout must not change silently.
  it("has one <nsid path>.defs module per lexicon except permission sets", () => {
    const missing = lexiconFiles()
      .filter(({ doc }) => doc.defs?.main?.type !== "permission-set")
      .map(({ path }) => path.replace(/\.json$/, ".defs.ts"))
      .filter(
        (path) => !existsSync(join(projectRoot, "generated", "records", path)),
      );
    expect(missing).toEqual([]);
  });

  it("types records from the lexicons", () => {
    const award: Omit<BadgeAward, "$type"> = {
      badge: {
        uri: "at://did:plc:abc123/app.certified.badge.definition/3k2abc",
        cid: "bafyreie5737gdxlw5i64vzichcalba3z2v5n6icifvx5xytvske7mr3hpm",
      },
      subject: { $type: "app.certified.defs#did", did: "did:plc:def456" },
      createdAt: "2026-10-30T12:00:00.000Z",
    };
    expect(award.subject).toBeDefined();

    // @ts-expect-error title is required
    const missing: Activity = { ...validActivity, title: undefined };
    expect(missing).toBeDefined();
  });
});
