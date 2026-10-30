import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@atproto/lex";
import { describe, expect, it } from "vitest";
import * as records from "../generated/records/index.js";
import {
  activity,
  badgeAward,
  type Activity,
  type BadgeAward,
} from "../generated/records/index.js";

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
  it("exports a record schema for every record lexicon", () => {
    const exported = Object.values(records as Record<string, unknown>)
      .filter(
        (value): value is { type: "record"; $type: string } =>
          typeof value === "object" &&
          value !== null &&
          "type" in value &&
          value.type === "record",
      )
      .map((schema) => schema.$type)
      .sort();

    expect(exported).toEqual(recordNsids());
    expect(exported).toHaveLength(27);
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

  it("accepts a valid record", () => {
    const result = activity.safeValidate(validActivity);
    expect(result.success).toBe(true);
  });

  it("rejects a record missing a required field", () => {
    const { title: _title, ...missingTitle } = validActivity;
    expect(activity.safeValidate(missingTitle).success).toBe(false);
  });

  it("rejects a record with a field of the wrong type", () => {
    const result = activity.safeValidate({ ...validActivity, title: 42 });
    expect(result.success).toBe(false);
  });

  it("works with Client.create and builds a createRecord request", async () => {
    const requests: Request[] = [];
    const client = new Client({
      did: "did:plc:abc123",
      service: "https://pds.example",
      fetch: async (input, init) => {
        requests.push(new Request(input, init));
        return Response.json({
          uri: "at://did:plc:abc123/org.hypercerts.claim.activity/3k2abc",
          cid: "bafyreie5737gdxlw5i64vzichcalba3z2v5n6icifvx5xytvske7mr3hpm",
        });
      },
    });

    const { $type: _type, ...input } = validActivity;
    await client.create(activity, input);

    expect(requests).toHaveLength(1);
    const request = requests[0];
    expect(new URL(request.url).pathname).toBe(
      "/xrpc/com.atproto.repo.createRecord",
    );
    const body = await request.json();
    expect(body).toMatchObject({
      repo: "did:plc:abc123",
      collection: "org.hypercerts.claim.activity",
      record: { $type: "org.hypercerts.claim.activity", title: input.title },
    });
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
    expect(badgeAward.$type).toBe("app.certified.badge.award");
    expect(award.subject).toBeDefined();

    // @ts-expect-error title is required
    const missing: Activity = { ...validActivity, title: undefined };
    expect(missing).toBeDefined();
  });
});
