#!/usr/bin/env node
/**
 * Packs the package and installs the tarball, with @atproto/lex, into a
 * consumer project outside this repository, then checks it the way the SDK
 * repository checks its packages: Node imports the root and a deep import,
 * CommonJS requires `/legacy`, TypeScript consumers typecheck (including the
 * older `node10` resolution against `/legacy`), and the root bundles for the
 * browser. This catches packaging errors (bad exports, missing files) that
 * tests against the source would not.
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
const readJson = (file) => JSON.parse(readFileSync(file, "utf-8"));
const lexVersion = readJson(join(projectRoot, "package.json")).devDependencies[
  "@atproto/lex"
];
const typescriptVersion = readJson(
  join(projectRoot, "node_modules/typescript/package.json"),
).version;

// Child processes must not inherit the parent's npm settings: `npm publish
// --dry-run` sets npm_config_dry_run=true, which would make the nested
// `npm pack` and `npm install` do nothing.
const childEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => !key.toLowerCase().startsWith("npm_config_"),
  ),
);

const run = (command, args, cwd) =>
  execFileSync(command, args, {
    cwd,
    env: childEnv,
    encoding: "utf-8",
    stdio: "pipe",
    timeout: 300_000,
  });

const workDir = mkdtempSync(join(tmpdir(), "hypercerts-lexicon-consumer-"));
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
  const consumer = join(workDir, "consumer");
  mkdirSync(consumer);
  writeFileSync(
    join(consumer, "package.json"),
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
    consumer,
  );

  writeFileSync(
    join(consumer, "runtime.js"),
    `import { org } from "@hypercerts-org/lexicon";
import * as activity from "@hypercerts-org/lexicon/org/hypercerts/claim/activity";
if (org.hypercerts.claim.activity.main !== activity.main) throw new Error("the deep import is a different module");
// The README tells users to add $type before $safeParse; check that advice.
const formData = { title: "t", shortDescription: "s", createdAt: "2026-10-30T12:00:00.000Z" };
if (activity.$safeParse(formData).success) throw new Error("$safeParse accepted a record without $type; update the README");
if (!activity.$safeParse({ $type: activity.$type, ...formData }).success) throw new Error("$safeParse rejected a record with $type");
if (activity.$safeParse({ $type: activity.$type, ...formData, ...{ $type: "org.hypercerts.collection" } }).success) throw new Error("$safeParse accepted a record with another $type");
`,
  );
  run("node", ["runtime.js"], consumer);
  console.log("✅ Node imports the root and a deep import");

  writeFileSync(
    join(consumer, "legacy.cjs"),
    `const { ACTIVITY_NSID } = require("@hypercerts-org/lexicon/legacy");
if (ACTIVITY_NSID !== "org.hypercerts.claim.activity") throw new Error("/legacy is missing ACTIVITY_NSID");
`,
  );
  run("node", ["legacy.cjs"], consumer);
  console.log("✅ CommonJS requires /legacy");

  writeFileSync(
    join(consumer, "types.ts"),
    `import { Client } from "@atproto/lex";
import { org } from "@hypercerts-org/lexicon";
import { ACTIVITY_NSID, type OrgHypercertsClaimActivity } from "@hypercerts-org/lexicon/legacy";
export const legacyRecord: OrgHypercertsClaimActivity.Main = {
  $type: ACTIVITY_NSID,
  title: "t",
  shortDescription: "s",
  createdAt: "2026-10-30T12:00:00.000Z",
};
const client = new Client({ did: "did:plc:abc123", service: "https://pds.example" });
export const record: org.hypercerts.claim.activity.Main = {
  $type: "org.hypercerts.claim.activity",
  title: "t",
  shortDescription: "s",
  createdAt: "2026-10-30T12:00:00.000Z",
};
export const valid = () => client.create(org.hypercerts.claim.activity, { title: "t", shortDescription: "s", createdAt: "2026-10-30T12:00:00.000Z" });
// @ts-expect-error title is required
export const missing = () => client.create(org.hypercerts.claim.activity, { shortDescription: "s", createdAt: "2026-10-30T12:00:00.000Z" });
`,
  );
  run(
    join(consumer, "node_modules/.bin/tsc"),
    [
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--module",
      "nodenext",
      "--target",
      "es2022",
      "types.ts",
    ],
    consumer,
  );
  console.log("✅ A TypeScript consumer typechecks against the declarations");

  // Projects on the older `node10` resolution (the default with
  // `module: commonjs`) ignore `exports`; `typesVersions` gives them the
  // `/legacy` and `/lexicons` types.
  writeFileSync(
    join(consumer, "node10.ts"),
    `import { ACTIVITY_NSID, OrgHypercertsClaimActivity } from "@hypercerts-org/lexicon/legacy";
import { ids } from "@hypercerts-org/lexicon/lexicons";
export const record: OrgHypercertsClaimActivity.Main = {
  $type: ACTIVITY_NSID,
  title: "t",
  shortDescription: "s",
  createdAt: "2026-10-30T12:00:00.000Z",
};
export const nsid: string = ids.OrgHypercertsClaimActivity;
`,
  );
  run(
    join(consumer, "node_modules/.bin/tsc"),
    [
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--module",
      "commonjs",
      "--moduleResolution",
      "node10",
      "--target",
      "es2022",
      "node10.ts",
    ],
    consumer,
  );
  console.log("✅ A node10 TypeScript consumer typechecks against /legacy");

  writeFileSync(
    join(consumer, "entry.js"),
    `import { org } from "@hypercerts-org/lexicon";\nconsole.log(org.hypercerts.claim.activity.$safeParse({}).success);\n`,
  );
  const unresolved = [];
  const bundle = await rollup({
    input: join(consumer, "entry.js"),
    plugins: [
      nodeResolve({ browser: true, rootDir: consumer, preferBuiltins: false }),
    ],
    // Rollup leaves an import it cannot resolve external instead of failing.
    onwarn: (warning) => {
      if (warning.code === "UNRESOLVED_IMPORT")
        unresolved.push(warning.message);
    },
  });
  await bundle.generate({ format: "es" });
  await bundle.close();
  if (unresolved.length > 0)
    throw new Error(`Browser bundle: ${unresolved.join("; ")}`);
  console.log("✅ The root bundles for the browser");
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
