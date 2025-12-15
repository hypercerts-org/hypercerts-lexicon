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
- **Generated TypeScript types**: Auto-generated in `types/` directory
  (do not edit manually)
- **Documentation**: Markdown files including README.md, ERD.md, and
  REMAINING_WORK.md

## Critical Build System Detail

**The `types/` directory contains auto-generated code. Do not edit files
in `types/` directly.**

To regenerate types after modifying lexicon JSON files:

```bash
npm run gen-api
```

This runs `lex gen-api` on all lexicon JSON files and regenerates the
TypeScript types.

## Development Commands

### Code Generation

```bash
# Regenerate TypeScript API types from lexicons
npm run gen-api

# Generate markdown documentation from lexicons
npm run gen-md

# Generate TypeScript object types
npm run gen-ts

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
# Validate lexicon definitions and regenerate types
npm run check
```

## Architecture

### Lexicon Structure

Lexicons are JSON files following the ATProto lexicon schema:

- Each lexicon defines a `main` record type
- Records specify `key`, `record` schema, and validation rules
- Lexicons are organized by namespace (e.g., `org.hypercerts.claim.*`)

### Generated Code

The `types/` directory contains:

- **index.ts**: Main client class (`AtpBaseClient`) and exports
- **types/**: TypeScript type definitions for each lexicon
- **lexicons.ts**: Lexicon schema definitions
- **util.ts**: Utility types and helpers

**Important**: All files in `types/` are generated. Changes should be
made to the lexicon JSON files, then types regenerated.

### Project Structure

```text
lexicons/
  app/certified/location.json
  com/atproto/repo/strongRef.json
  org/hypercerts/
    claim/
      activity.json
      collection.json
      contribution.json
      evaluation.json
      evidence.json
      measurement.json
      rights.json
    defs.json

types/              # Generated - do not edit
  index.ts
  lexicons.ts
  types/
  util.ts
```

## Common Patterns

### Adding / modifying a lexicon

1. Create / edit JSON file in `lexicons/` following the namespace
   structure
2. Update `ERD.puml` as appropriate
3. Update `README.md` as appropriate
4. Run `npm run format` to ensure everything is formatted correctly
   via Prettier.

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
- **Never edit `types/` directly** - all changes are lost on regeneration
- The `.prettierignore` excludes `types/` since it's generated code

## Entity Relationships

See `ERD.puml` for the entity relationship diagram. Key relationships:

- Claims reference collections, contributions, evidence, measurements,
  evaluations, and rights
- Collections group multiple claims with weights
- Contributions link to contributors (DIDs or strings)
- Evidence and measurements support claims
- Evaluations provide assessments of claims
