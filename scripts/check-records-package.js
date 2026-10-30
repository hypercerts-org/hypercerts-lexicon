#!/usr/bin/env node
/**
 * Checks the packed package the way a consumer installs it, for the
 * `@hypercerts-org/lexicon/records` subpath:
 *
 * 1. `npm pack`, then install the tarball and @atproto/lex into an empty
 *    project outside this repository (no workspace or source aliases).
 * 2. Import `/records` and a per-lexicon `/records/*` path in Node (ESM),
 *    and validate a record.
 * 3. Typecheck a TypeScript consumer against the installed declarations.
 * 4. Bundle `import { activity } from "@hypercerts-org/lexicon/records"`
 *    for the browser with Rollup, and report whether unrelated record
 *    schemas were left out (tree-shaking).
 *
 * Run after `npm run build`. Needs network access for `npm install`.
 */

import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rollup } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(
  readFileSync(join(projectRoot, "package.json"), "utf-8"),
);
const lexVersion = packageJson.devDependencies["@atproto/lex"];
const typescriptVersion = JSON.parse(
  readFileSync(
    join(projectRoot, "node_modules/typescript/package.json"),
    "utf-8",
  ),
).version;

const run = (command, args, cwd) =>
  execFileSync(command, args, { cwd, encoding: "utf-8", stdio: "pipe" });

const workDir = mkdtempSync(join(tmpdir(), "hypercerts-lexicon-records-"));
try {
  // `npm pack` runs the `prepare` script, which prints its own output; the
  // tarball name is the last line.
  const tarball = run(
    "npm",
    ["pack", "--silent", "--pack-destination", workDir],
    projectRoot,
  )
    .trim()
    .split("\n")
    .at(-1);
  const consumerDir = join(workDir, "consumer");
  mkdirSync(consumerDir);
  writeFileSync(
    join(consumerDir, "package.json"),
    JSON.stringify({ name: "consumer", private: true, type: "module" }),
  );
  run(
    "npm",
    [
      "install",
      "--silent",
      "--no-audit",
      "--no-fund",
      join(workDir, tarball),
      `@atproto/lex@${lexVersion}`,
      `typescript@${typescriptVersion}`,
    ],
    consumerDir,
  );

  // 2. Runtime import from the installed tarball.
  writeFileSync(
    join(consumerDir, "runtime.js"),
    `import { activity, badgeAward } from "@hypercerts-org/lexicon/records";
import * as ActivityModule from "@hypercerts-org/lexicon/records/org/hypercerts/claim/activity.defs";
const record = {
  $type: "org.hypercerts.claim.activity",
  title: "t",
  shortDescription: "s",
  createdAt: "2026-10-30T12:00:00.000Z",
};
if (activity.$type !== "org.hypercerts.claim.activity") throw new Error("activity.$type");
if (badgeAward.$type !== "app.certified.badge.award") throw new Error("badgeAward.$type");
if (ActivityModule.main !== activity) throw new Error("deep import is a different module");
if (!activity.safeValidate(record).success) throw new Error("valid record rejected");
if (activity.safeValidate({ ...record, title: 1 }).success) throw new Error("invalid record accepted");
`,
  );
  run("node", ["runtime.js"], consumerDir);
  console.log("✅ /records and /records/* import and validate in Node (ESM)");

  // The existing CommonJS and ESM entry points still load from the tarball.
  writeFileSync(
    join(consumerDir, "existing.cjs"),
    `const root = require("@hypercerts-org/lexicon");
const lexicons = require("@hypercerts-org/lexicon/lexicons");
if (root.ACTIVITY_NSID !== "org.hypercerts.claim.activity") throw new Error("root CJS");
if (typeof lexicons.validate !== "function") throw new Error("/lexicons CJS");
`,
  );
  writeFileSync(
    join(consumerDir, "existing.mjs"),
    `import { ACTIVITY_NSID } from "@hypercerts-org/lexicon";
if (ACTIVITY_NSID !== "org.hypercerts.claim.activity") throw new Error("root ESM");
`,
  );
  run("node", ["existing.cjs"], consumerDir);
  run("node", ["existing.mjs"], consumerDir);
  console.log("✅ Existing root and /lexicons entry points load (CJS and ESM)");

  // 3. Types from the installed declarations.
  writeFileSync(
    join(consumerDir, "types.ts"),
    `import { Client } from "@atproto/lex";
import { activity, type Activity, OrgHypercertsDefs } from "@hypercerts-org/lexicon/records";
import type { Main } from "@hypercerts-org/lexicon/records/org/hypercerts/claim/activity.defs";

const client = new Client({ did: "did:plc:abc123", service: "https://pds.example" });
export const create = () =>
  client.create(activity, { title: "t", shortDescription: "s", createdAt: "2026-10-30T12:00:00.000Z" });
export const same = (record: Activity): Main => record;
export type Uri = OrgHypercertsDefs.Uri;
// @ts-expect-error title is required
export const missing = () => client.create(activity, { shortDescription: "s", createdAt: "2026-10-30T12:00:00.000Z" });
`,
  );
  run(
    join(consumerDir, "node_modules/.bin/tsc"),
    [
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--module",
      "nodenext",
      "--moduleResolution",
      "nodenext",
      "--target",
      "es2022",
      "types.ts",
    ],
    consumerDir,
  );
  console.log(
    "✅ TypeScript consumer typechecks against installed declarations",
  );

  // 4. Browser bundle of a single schema.
  writeFileSync(
    join(consumerDir, "entry.js"),
    `import { activity } from "@hypercerts-org/lexicon/records";\nconsole.log(activity.$type);\n`,
  );
  const bundle = await rollup({
    input: join(consumerDir, "entry.js"),
    plugins: [
      nodeResolve({
        browser: true,
        rootDir: consumerDir,
        preferBuiltins: false,
      }),
    ],
    onwarn: () => {},
  });
  const { output } = await bundle.generate({ format: "es" });
  await bundle.close();
  const code = output
    .map((chunk) => ("code" in chunk ? chunk.code : ""))
    .join("");
  const unrelated = [
    "org.hyperboards.board",
    "app.certified.badge.award",
    "app.certified.graph.follow",
    "org.hypercerts.funding.receipt",
  ].filter((nsid) => code.includes(`"${nsid}"`));
  const kib = (Buffer.byteLength(code) / 1024).toFixed(0);
  if (unrelated.length > 0) {
    console.log(
      `⚠️  Browser bundle of \`activity\` (${kib} KiB, unminified) still contains: ${unrelated.join(", ")}`,
    );
  } else {
    console.log(
      `✅ Browser bundle of \`activity\` (${kib} KiB, unminified) leaves out unrelated record schemas`,
    );
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
