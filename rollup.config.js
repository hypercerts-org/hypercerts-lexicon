import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import dts from "rollup-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Entrypoints for the package
const entrypoints = [
  { name: "index", input: "generated/exports.ts" },
  { name: "lexicons", input: "generated/lexicons.ts" },
];

// Common plugins for JS builds
const getPlugins = () => [
  json(),
  typescript({
    tsconfig: resolve(__dirname, "tsconfig.json"),
    declaration: false,
    declarationMap: false,
    rootDir: resolve(__dirname),
    outDir: resolve(__dirname, "dist"),
  }),
  nodeResolve({
    preferBuiltins: true,
  }),
  commonjs(),
];

// External dependencies check
const external = (id) => !id.startsWith(".") && !id.startsWith("/");

// Generate JS builds (ESM and CJS) for each entrypoint
const jsBuild = entrypoints.map(({ name, input }) => ({
  input: resolve(__dirname, input),
  output: [
    {
      file: resolve(__dirname, `dist/${name}.mjs`),
      format: "es",
      sourcemap: true,
    },
    {
      file: resolve(__dirname, `dist/${name}.cjs`),
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
  ],
  plugins: getPlugins(),
  external,
}));

// Generate type declaration builds for each entrypoint
const dtsBuild = entrypoints.map(({ name, input }) => ({
  input: resolve(__dirname, input),
  output: {
    file: resolve(__dirname, `dist/${name}.d.ts`),
    format: "es",
  },
  plugins: [
    dts({
      tsconfig: resolve(__dirname, "tsconfig.json"),
    }),
  ],
  external,
}));

export default [...jsBuild, ...dtsBuild];
