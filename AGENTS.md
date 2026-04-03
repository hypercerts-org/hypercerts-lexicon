# AGENTS.md

This file provides guidance to AI coding assistants which are
modifying code in this repository.

If however you are building on _top_ of this repository rather than
_in_ it, then instead see the [`README.md`](README.md).

## ⚠️ CRITICAL REMINDER FOR AI AGENTS

**ALWAYS CREATE A CHANGESET** when making changes that affect the public API:

- Adding or modifying lexicon files
- Changing generated TypeScript exports
- Renaming constants, types, or functions
- Any change that users of this package will need to know about

Use the `writing-changesets` skill. **DO NOT skip this step!**

## Branch Strategy

**`main` is the only evergreen branch** and the default branch on
GitHub. Normal releases are published from `main`. Note that `main`,
the latest npm package release, and the lexicons published on ATProto
may not always be perfectly in sync due to the multiple moving parts
in the publishing process.

- **`main` branch**: Preparation for stable releases, which will be
  tagged and published from this branch.
- **`prerelease/*` branches**: Ephemeral branches for beta/prerelease
  versions (created from `main`, merged back when done; see
  [docs/PUBLISHING.md](docs/PUBLISHING.md))
- **`feature/*` (or `fix/*`) branches**: Short-lived branches for
  development work, targeting and merged to `main` or a
  `prerelease/*` branch via PR depending on whether a beta or
  prerelease is required.

> **Do not open PRs against `develop`** — it is a stale branch left
> over from a previous workflow and is no longer used.

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

## Guidance for development of downstream applications

As already mentioned above, downstream applications should _not_
depend on this document for guidance, which is intended for usage when
modifying this repository.

However for the sake of clarity, consume these lexicons **NOT** by
reading from `main` or other development branches of the repository,
but instead via the following published releases:

- **For TypeScript / JavaScript code** — use [the npm package
  `@hypercerts-org/lexicon`](https://www.npmjs.com/package/@hypercerts-org/lexicon),
  which includes generated types, validation helpers, and schema
  constants.
- **For other languages** — use the [tagged
  releases](https://github.com/hypercerts-org/hypercerts-lexicon/releases)
  published in this GitHub repository.

Both npm releases and git tags follow [SemVer](https://semver.org/).
For npm, you can depend on a version range to receive compatible
updates automatically. For GitHub releases/tags, pin a specific tag
or upgrade manually to a newer compatible SemVer release.

The raw lexicons published on ATProto can also be used, but they are
(unavoidably) missing useful context such as full documentation
(including changelogs), TypeScript type definitions, SemVer
guarantees, git history, and other tooling provided by the packaged
releases.

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

**⚠️ IMPORTANT FOR AI AGENTS**: Always run scripts through npm scripts
(e.g., `npm run gen-schemas-md`) rather than executing Node.js files
directly (e.g., `node scripts/generate-schemas.js`). This ensures
proper environment setup and consistency with the project's workflow.

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
lexicons/               Source of truth (committed)
  org/hypercerts/         Hypercerts protocol lexicons
  org/hyperboards/        Hyperboards visual layer lexicons
  app/certified/          Shared/certified lexicons
  com/atproto/            ATProto external references

generated/              Auto-generated TypeScript (gitignored)
dist/                   Built bundles (gitignored)
scripts/                Build and codegen scripts
```

> **Never edit `generated/` or `dist/` directly** — they are
> regenerated from lexicon JSON files.

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

### Writing Tests

Tests live in `tests/` with one file per lexicon, named
`validate-<lexicon-slug>.test.ts` (e.g. `validate-link-evm.test.ts`,
`validate-rights.test.ts`).

The generated code provides two ways to validate records:

- **`validate()` from `generated/lexicons.js`** — generic, untyped.
  The return type is `ValidationResult<{ $type?: string }>` so
  `result.value` has no lexicon-specific fields. Use this for negative
  tests (missing fields, bad types) where you don't need to inspect
  the returned value.

- **`validateMain()` from per-lexicon type modules** (e.g.
  `generated/types/app/certified/link/evm.js`) — returns a properly
  typed `ValidationResult` with all lexicon fields on `result.value`.
  Use this for positive tests where you assert on specific field
  values. Note: `validateMain` requires `$type` to be present on the
  input record.

Example:

```typescript
import { validate, ids } from "../generated/lexicons.js";
import * as EvmLink from "../generated/types/app/certified/link/evm.js";

// Positive test — typed result via validateMain
const result = EvmLink.validateMain({
  $type: ids.AppCertifiedLinkEvm,
  ...record,
});
if (result.success) {
  expect(result.value.address).toBe("0x..."); // ← type-safe
}

// Negative test — generic validate (no $type needed)
const bad = validate(
  { address: "0x..." }, // missing required fields
  ids.AppCertifiedLinkEvm,
  "main",
  false,
);
expect(bad.success).toBe(false);
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

<!-- BEGIN BEADS INTEGRATION -->

## Issue Tracking with bd (beads)

**IMPORTANT**: Developers of this project sometimes use **bd
(beads)**, but _not_ for _all_ issue tracking. At the time of writing,
the GitHub issue tracker is also used.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Dolt-powered version control with native sync
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**

```bash
bd ready --json
```

**Create new issues:**

```bash
bd create "Issue title" --description="Detailed context" -t bug|feature|task -p 0-4 --json
bd create "Issue title" --description="What this issue is about" -p 1 --deps discovered-from:bd-123 --json
```

**Claim and update:**

```bash
bd update <id> --claim --json
bd update bd-42 --priority 1 --json
```

**Complete work:**

```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task atomically**: `bd update <id> --claim`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" --description="Details about what was found" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`

### Auto-Sync

bd automatically syncs via Dolt:

- Each write auto-commits to Dolt history
- Use `bd dolt push`/`bd dolt pull` for remote sync
- No manual export/import needed!

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems

For more details, see README.md and docs/QUICKSTART.md.

<!-- END BEADS INTEGRATION -->

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push origin HEAD
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
