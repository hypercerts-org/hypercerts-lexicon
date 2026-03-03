# Auto-Generation System

## Overview

The `generated/exports.ts` file is **automatically generated** from lexicon JSON files. You should never edit it manually.

## How It Works

When you run `npm run gen-api`, the build process:

1. Runs `lex gen-api` to generate TypeScript types in `generated/`
2. Runs `scripts/create-shims.sh` to create type shims for external lexicons
3. Runs `scripts/generate-exports.js` to auto-generate `generated/exports.ts`

## The Generation Script

`scripts/generate-exports.js` scans all lexicon JSON files and creates:

- **Raw JSON imports** with `_JSON` suffix (e.g., `BADGE_AWARD_LEXICON_JSON`)
- **Typed LexiconDoc exports** with `_DOC` suffix (e.g., `BADGE_AWARD_LEXICON_DOC`)
- **Individual NSID constants** with `_NSID` suffix (e.g., `ACTIVITY_NSID`)
- **Type namespace re-exports** (e.g., `AppCertifiedBadgeAward`)
- **Semantic mapping objects** (`HYPERCERTS_NSIDS`, `HYPERCERTS_LEXICON_JSON`, `HYPERCERTS_LEXICON_DOC`)
- **Core utilities** (`HYPERCERTS_SCHEMAS`, `HYPERCERTS_SCHEMA_DICT`, `HYPERCERTS_NSIDS_BY_TYPE`, `lexicons`, `validate`)

### Naming Conventions

The script generates intelligent names:

| Source                | Raw JSON (untyped)         | LexiconDoc (typed)        | NSID Constant      | Type Namespace               | Semantic Key  |
| --------------------- | -------------------------- | ------------------------- | ------------------ | ---------------------------- | ------------- |
| `badge/award.json`    | `BADGE_AWARD_LEXICON_JSON` | `BADGE_AWARD_LEXICON_DOC` | `BADGE_AWARD_NSID` | `AppCertifiedBadgeAward`     | `BADGE_AWARD` |
| `claim/activity.json` | `ACTIVITY_LEXICON_JSON`    | `ACTIVITY_LEXICON_DOC`    | `ACTIVITY_NSID`    | `OrgHypercertsClaimActivity` | `ACTIVITY`    |

**Semantic Mapping Objects** (all share the same keys):

- `HYPERCERTS_NSIDS.ACTIVITY` → NSID string
- `HYPERCERTS_LEXICON_JSON.ACTIVITY` → Raw JSON
- `HYPERCERTS_LEXICON_DOC.ACTIVITY` → Typed LexiconDoc

**Type-based Mapping**:

- `HYPERCERTS_NSIDS_BY_TYPE.OrgHypercertsClaimActivity` → NSID string

**Schemas**:

- `HYPERCERTS_SCHEMAS` (array) or `HYPERCERTS_SCHEMA_DICT` (keyed by namespace)

## When to Regenerate

Run `npm run gen-api` (or just `npm run gen-index`) whenever:

- You add a new lexicon JSON file
- You remove a lexicon JSON file
- You rename a lexicon JSON file
- The build fails because exports are missing

## Benefits

✅ **Zero maintenance** - Adding lexicons is automatic
✅ **Consistent naming** - Generated names follow patterns
✅ **No conflicts** - Unique constant names guaranteed
✅ **Type-safe** - TypeScript checks everything
✅ **Clean exports** - Only what consumers need

## Manual Script

If you need to regenerate just `generated/exports.ts`:

```bash
npm run gen-index
```

This is useful for testing the generation script without regenerating all the types.
