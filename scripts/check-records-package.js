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
 * 4. Bundle `import { org } from "@hypercerts-org/lexicon/records"`, using
 *    only `org.hypercerts.claim.activity`,
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

// Child npm and node processes must not inherit the parent's npm settings:
// `npm publish --dry-run` runs this script with npm_config_dry_run=true,
// which would make the nested `npm pack` and `npm install` do nothing.
const childEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => !key.toLowerCase().startsWith("npm_config_"),
  ),
);

const run = (command, args, cwd, timeout = 120_000) =>
  execFileSync(command, args, {
    cwd,
    env: childEnv,
    encoding: "utf-8",
    stdio: "pipe",
    timeout,
  });

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
    300_000,
  );

  // 2. Runtime import from the installed tarball.
  writeFileSync(
    join(consumerDir, "runtime.js"),
    `import { app, org } from "@hypercerts-org/lexicon/records";
import * as ActivityModule from "@hypercerts-org/lexicon/records/org/hypercerts/claim/activity";
const activity = org.hypercerts.claim.activity;
const record = {
  $type: "org.hypercerts.claim.activity",
  title: "t",
  shortDescription: "s",
  createdAt: "2026-10-30T12:00:00.000Z",
};
if (activity.$type !== "org.hypercerts.claim.activity") throw new Error("activity.$type");
if (app.certified.badge.award.$type !== "app.certified.badge.award") throw new Error("badge award $type");
if (ActivityModule.main !== activity.main) throw new Error("deep import is a different module");
if (!activity.$safeValidate(record).success) throw new Error("valid record rejected");
if (activity.$safeValidate({ ...record, title: 1 }).success) throw new Error("invalid record accepted");
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
import { org } from "@hypercerts-org/lexicon/records";
import type { Main } from "@hypercerts-org/lexicon/records/org/hypercerts/claim/activity";
type Activity = org.hypercerts.claim.activity.Main;
const activity = org.hypercerts.claim.activity;

const client = new Client({ did: "did:plc:abc123", service: "https://pds.example" });
export const create = () =>
  client.create(activity, { title: "t", shortDescription: "s", createdAt: "2026-10-30T12:00:00.000Z" });
export const same = (record: Activity): Main => record;
export type Uri = org.hypercerts.defs.Uri;
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
    `import { org } from "@hypercerts-org/lexicon/records";\nconsole.log(org.hypercerts.claim.activity.$safeParse({}).success);\n`,
  );
  /** @type {string[]} */
  const problems = [];
  const bundle = await rollup({
    input: join(consumerDir, "entry.js"),
    plugins: [
      nodeResolve({
        browser: true,
        rootDir: consumerDir,
        preferBuiltins: false,
      }),
    ],
    onwarn: (warning) => {
      // An import that cannot be resolved for the browser would otherwise
      // be left external and the bundle reported as fine.
      if (warning.code === "UNRESOLVED_IMPORT") problems.push(warning.message);
    },
  });
  const { output } = await bundle.generate({ format: "es" });
  await bundle.close();
  const code = output
    .map((chunk) => ("code" in chunk ? chunk.code : ""))
    .join("");
  // The schema itself, not just its NSID string (a constant a bundler can
  // inline): field names only appear in the generated schema code.
  if (
    !code.includes('"org.hypercerts.claim.activity"') ||
    !code.includes("shortDescription")
  ) {
    problems.push("the bundle does not contain the activity schema");
  }
  const unrelated = [
    "org.hyperboards.board",
    "app.certified.badge.award",
    "app.certified.graph.follow",
    "org.hypercerts.funding.receipt",
  ].filter((nsid) => code.includes(`"${nsid}"`));
  if (unrelated.length > 0) {
    problems.push(
      `unrelated record schemas in the bundle: ${unrelated.join(", ")}`,
    );
  }
  if (problems.length > 0) {
    throw new Error(`Browser bundle of \`activity\`: ${problems.join("; ")}`);
  }
  const kib = (Buffer.byteLength(code) / 1024).toFixed(0);
  console.log(
    `✅ Browser bundle of \`activity\` (${kib} KiB, unminified) leaves out unrelated record schemas`,
  );
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
