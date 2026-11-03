#!/usr/bin/env node
/**
 * Bundles the `/legacy` (generated/exports.ts) and `/lexicons`
 * (generated/lexicons.ts) entry points as ESM and CommonJS into dist/, one
 * self-contained bundle per entry point and format, as `package.json`
 * `exports` and `sideEffects` expect. Each entry point is built on its own so
 * Vite does not move shared code into a separate chunk.
 *
 * Declarations come from `pnpm build:types` and the package root from
 * `pnpm build:records`, so dist/ is not emptied here.
 */

import { isAbsolute } from "node:path";
import { build } from "vite";

const entries = { index: "generated/exports.ts", lexicons: "generated/lexicons.ts" };

for (const [name, entry] of Object.entries(entries)) {
  await build({
    configFile: false,
    logLevel: "warn",
    build: {
      outDir: "dist",
      emptyOutDir: false,
      sourcemap: true,
      minify: false,
      target: "es2022",
      lib: {
        entry,
        formats: ["es", "cjs"],
        fileName: (format) => `${name}.${format === "es" ? "mjs" : "cjs"}`,
      },
      rolldownOptions: {
        // Dependencies stay imports; only this package's own modules are bundled.
        external: (id) => !id.startsWith(".") && !isAbsolute(id),
        output: { exports: "named" },
      },
    },
  });
}
