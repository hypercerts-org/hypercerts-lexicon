# AGENTS.md

This file provides guidance to AI coding assistants when working with
code in this repository.

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

### Code Generation

```bash
# Regenerate TypeScript API types from lexicons and auto-generate generated/exports.ts
npm run gen-api

# Manually regenerate just generated/exports.ts
npm run gen-index

# Build distributable bundles
npm run build

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

### Versioning

**For AI agents**: Create changeset files directly in `.changeset/` directory.
The `npm run changeset` command is interactive and not suitable for automation.

**Changeset file format** (create a `.md` file in `.changeset/`):

```markdown
---
"@hypercerts-org/lexicon": minor
---

Description of the changes. This will appear in the changelog.
```

- **Version bump types**: `major`, `minor`, or `patch`
  - **Note**: While the package is still on version 0.x (initial development),
    do not use `major` version bumps. Use `minor` for potentially breaking
    changes and `patch` for non-breaking changes, as semantic versioning
    considers 0.x versions unstable where breaking changes are expected.
- **Filename**: Use a descriptive name or random identifier (e.g., `add-activity-lexicon.md`)
- **Package name**: Always use `"@hypercerts-org/lexicon"` for this repository

**IMPORTANT: Agents should NEVER perform releases.** The release process is
handled manually by maintainers through GitHub Actions workflows. Agents should
only create changeset files.

**Release Process Overview** (for reference only - agents do not perform this):

The repository uses a two-branch release strategy:

- **`develop` branch**: Beta/prerelease versions
  - Maintainers manually trigger the GitHub Actions release workflow from `develop`
  - Publishes to npm with the `beta` tag (e.g., `0.9.0-beta.1`)
  - Used for testing before stable releases

- **`main` branch**: Stable releases
  - Before merging `develop` → `main`, maintainers must run `npm run changeset pre exit` on `develop`
  - Maintainers manually trigger the GitHub Actions release workflow from `main`
  - Creates a "Release Pull Request" that must be merged to publish
  - Publishes to npm with the `latest` tag (e.g., `0.9.0`)

**Suggested Flow:** `feature` → `develop` (beta) → `main` (stable)

Agents should create changesets when making changes, but releases are handled
exclusively by maintainers through the GitHub Actions workflow.

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
3. Update `ERD.puml` as appropriate
4. Update `README.md` as appropriate
5. Run `npm run format` to ensure everything is formatted correctly
   via Prettier
6. Run `npm run check` to validate, typecheck, and build
7. Create a changeset file in `.changeset/` if the changes affect the public
   API or require a version bump (see "Versioning" section). Create
   the file directly - do not use the interactive `npm run changeset` command

**No manual edits needed!** Everything is automatically regenerated.

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
- **Create changesets** when making changes that affect the public API:
  - Adding new lexicons
  - Modifying existing lexicon schemas (breaking or non-breaking)
  - Changing TypeScript type exports
  - Any change that requires a version bump
    **For AI agents**: Create changeset files directly in `.changeset/` directory
    (do not use the interactive `npm run changeset` command). See the "Versioning"
    section for the file format.
- **NEVER perform releases**: Agents should only create changeset files. The
  release process (including running `npm run version-packages`, `npm run release`,
  or triggering GitHub Actions workflows) must be done manually by maintainers.
  See the "Versioning" section for details on the release process.

## Entity Relationships

See `ERD.puml` for the entity relationship diagram. Key relationships:

- Claims reference collections, contributions, evidence, measurements,
  evaluations, and rights
- Collections group multiple claims with weights
- Contributions link to contributors (DIDs or strings)
- Evidence and measurements support claims
- Evaluations provide assessments of claims
