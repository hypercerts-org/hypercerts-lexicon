# AGENTS.md

This file provides guidance to AI coding assistants when working with
code in this repository.

## ⚠️ CRITICAL REMINDER FOR AI AGENTS

**ALWAYS CREATE A CHANGESET** when making changes that affect the public API:

- Adding or modifying lexicon files
- Changing generated TypeScript exports
- Renaming constants, types, or functions
- Any change that users of this package will need to know about

Use the `writing-changesets` skill. **DO NOT skip this step!**

## Overview

This repository contains ATProto lexicon definitions for the Hypercerts
protocol. Lexicons define record types that can be stored on the ATProto
network using the ATProtocol (ATProto) standard.

The codebase consists of:

- **Lexicon definitions**: JSON files in `lexicons/` that define record
  schemas
- **Generated TypeScript types**: Auto-generated in `generated/` directory
  (gitignored, do not edit manually)
- **Built output**: Compiled bundles in `dist/` directory (gitignored)
- **Documentation**: Markdown files including README.md and ERD.md.

## Critical Build System Detail

**The `generated/` and `dist/` directories contain auto-generated code.
Do not edit files in these directories directly.**

To regenerate code after modifying lexicon JSON files:

```bash
npm run gen-api
```

This runs `lex gen-api` on all lexicon JSON files and:

1. Generates TypeScript types in `generated/`
2. Creates type shims for external lexicons
3. Auto-generates `generated/exports.ts` with clean exports

Then to build the distributable bundles:

```bash
npm run build
```

This runs Rollup to compile TypeScript and bundle into ESM, CommonJS,
and type declaration files in `dist/`.

## Development Commands

**⚠️ IMPORTANT FOR AI AGENTS**: Always run scripts through npm scripts (e.g., `npm run gen-schemas-md`) rather than executing Node.js files directly (e.g., `node scripts/generate-schemas.js`). This ensures proper environment setup and consistency with the project's workflow.

### Code Generation

```bash
# Regenerate TypeScript API types from lexicons and auto-generate generated/exports.ts
npm run gen-api

# Manually regenerate just generated/exports.ts
npm run gen-index

# Build distributable bundles
npm run build

# Generate SCHEMAS.md from lexicon definitions
npm run gen-schemas-md

# Generate markdown documentation from lexicons
npm run gen-md

# List all lexicon JSON files
npm run list
```

### Code Quality

```bash
# Check code formatting
npm run lint
# or
npm run format:check

# Auto-fix formatting issues
npm run format
```

### Validation

```bash
# Validate lexicon definitions, regenerate types, typecheck, and build
npm run check

# Type-check TypeScript without building
npm run typecheck
```

### Changesets and Versioning

This repository uses
[Changesets](https://github.com/changesets/changesets) for versioning.

Use the `writing-changesets` skill to create changeset files. Do NOT
write changeset files manually - always use the skill to ensure proper
format.

See the `writing-changesets` skill for details on:

- When changesets are required
- Proper file format and conventions
- Version bump types (major, minor, patch)

## Architecture

### Lexicon Structure

Lexicons are JSON files following the ATProto lexicon schema:

- Each lexicon defines a `main` record type
- Records specify `key`, `record` schema, and validation rules
- Lexicons are organized by namespace (e.g., `org.hypercerts.claim.*`)

### Generated Code

The `generated/` directory (gitignored) contains:

- **index.ts**: Generated client class (`AtpBaseClient`) - not exposed
- **exports.ts**: Auto-generated clean exports (package entry point)
- **types/**: TypeScript type definitions for each lexicon
- **lexicons.ts**: Lexicon schema definitions, IDs, and validation
- **util.ts**: Utility types and helpers

The `dist/` directory (gitignored) contains compiled bundles:

- **index.mjs**: ESM bundle
- **index.cjs**: CommonJS bundle
- **index.d.ts**: TypeScript declarations
- **\*.map**: Source maps

**Important**: All files in `generated/` and `dist/` are auto-generated.
Changes should be made to the lexicon JSON files, then regenerated.

### Project Structure

```text
lexicons/               # Source of truth (committed)
  app/certified/
    badge/
      award.json
      definition.json
      response.json
    defs.json
    location.json
  com/atproto/repo/strongRef.json
  org/hypercerts/
    claim/
      activity.json
      collection.json
      contribution.json
      evaluation.json
      evidence.json
      measurement.json
      project.json
      rights.json
    defs.json
    funding/
      receipt.json

scripts/                # Build scripts (committed)
  create-shims.sh       # Generate type shims for external lexicons
  generate-exports.js   # Auto-generate generated/exports.ts
  generate-schemas.js   # Auto-generate SCHEMAS.md from lexicons

generated/              # Auto-generated (gitignored)
  index.ts              # Generated client (not exposed)
  exports.ts            # Clean exports (entry point)
  lexicons.ts           # Schema definitions and validation
  types/                # Type definitions for each lexicon
  util.ts               # Utility types

dist/                   # Built output (gitignored)
  index.mjs             # ESM bundle
  index.cjs             # CommonJS bundle
  index.d.ts            # TypeScript declarations
  *.map                 # Source maps
```

## Common Patterns

### Adding / modifying a lexicon

1. Create / edit JSON file in `lexicons/` following the namespace
   structure

2. Run `npm run gen-api` to:
   - Generate types in `generated/`
   - Create type shims for external lexicons
   - Auto-generate `generated/exports.ts` with all exports

3. Update `ERD.puml` as appropriate:
   - **Include all fields except facet fields** (they're cosmetic and
     don't affect structure)

4. Update `README.md` as appropriate:
   - If README.md already references that lexicon, it must be updated
     to reflect the lexicon changes (modified properties updated,
     removed lexicons removed from docs). If it doesn't already then
     it's _recommended_ but _not mandatory_ to add some docs to it for
     the lexicon in question.

   - Document new lexicons or changes to existing ones

   - Document all properties **except facet fields** (facets may be
     omitted)

5. Run `npm run gen-schemas-md` to regenerate `SCHEMAS.md`

6. Run `npm run format` to ensure everything is formatted correctly
   via Prettier

7. Run `npm run check` to validate, typecheck, and build

8. **REQUIRED: Create a changeset file** using the `writing-changesets` skill
   - **This step is MANDATORY for ALL changes that affect users**
   - See the `writing-changesets` skill for details on changeset requirements
   - Use the skill - do NOT write changeset files manually

**No manual edits needed!** Everything is automatically regenerated.

**⚠️ IMPORTANT: Did you create a changeset?** All public API changes
require a changeset!

### Testing Changes

After modifying lexicons:

```bash
# Check formatting
npm run lint

# Validate lexicon syntax
npm run check
```

## Important Notes

- Lexicon JSON files should follow ATProto lexicon schema v1
- Use `npm run format` before committing to ensure consistent formatting
- Use `npm run check` before committing to ensure valid lexicons
- **Never edit `generated/` or `dist/` directly** - all changes are lost on regeneration
- The `.prettierignore` excludes `generated/` and `dist/` since they're auto-generated
- The `.gitignore` excludes `generated/` and `dist/` to keep the repo clean

## Entity Relationships

See `ERD.puml` for the entity relationship diagram. Key relationships:

- Claims reference collections, contributions, evidence, measurements,
  evaluations, and rights
- Collections group multiple claims with weights
- Contributions link to contributors (DIDs or strings)
- Evidence and measurements support claims
- Evaluations provide assessments of claims
