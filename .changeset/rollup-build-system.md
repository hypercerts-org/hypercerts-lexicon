---
"@hypercerts-org/lexicon": minor
---

chore: switch to build via rollup

Major build system improvements:

- **Build System**: Migrated from direct TypeScript to Rollup-based builds
  - Generates proper ESM (`dist/index.mjs`) and CommonJS (`dist/index.cjs`) bundles
  - Generates TypeScript declarations (`dist/index.d.ts`)
  - Includes source maps for debugging
  - Adds `/lexicons` export for lighter bundle (validation only)

- **Code Generation**:
  - Auto-generates `generated/exports.ts` with clean, organized exports
  - Creates type shims for external lexicons (@atcute/leaflet)
  - All generated code now in `generated/` directory (gitignored)

- **Package Exports**:
  - Main export: `@hypercerts-org/lexicon` (full package with types)
  - Lexicons export: `@hypercerts-org/lexicon/lexicons` (schemas only, smaller bundle)
  - Proper dual package support (ESM + CommonJS)

- **Code Quality**:
  - Added ESLint configuration
  - Added TypeScript type-checking to CI
  - Improved build validation workflow

- **Dependencies**:
  - Added `@atcute/leaflet` for external lexicon references
  - Added `multiformats` as runtime dependency
  - Moved `@atproto/lex-cli` to devDependencies (build-time only)

**Migration**: No breaking changes for existing users. Package structure is improved
but import paths remain compatible.
