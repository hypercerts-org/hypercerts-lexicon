# @hypercerts-org/lexicon

## 0.10.0-beta.1

### Minor Changes

- [`96bdb6c`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/96bdb6c9c7107680da301a92a8120ee60e676f15) Thanks [@aspiers](https://github.com/aspiers)! - Improved exports structure with semantic collection mappings for extra syntactic sugar.

  **Breaking Changes:**
  - Renamed `ids` export to `HYPERCERTS_NSIDS_BY_TYPE` (maps type namespaces to NSIDs)

  **New Features:**
  - Added `HYPERCERTS_NSIDS` object with semantic keys (e.g., `ACTIVITY`, `RIGHTS`, `CONTRIBUTION`)
  - Added `HYPERCERTS_LEXICON_JSON` object with semantic keys mapping to raw JSON lexicons
  - Added `HYPERCERTS_LEXICON_DOC` object with semantic keys mapping to typed lexicon documents
  - All three new objects share the same key structure for consistency

  **Migration Guide:**

  If you were using the `ids` export (rare):

  ```typescript
  // Before
  import { ids } from "@hypercerts-org/lexicon";
  const nsid = ids.OrgHypercertsClaimActivity;

  // After
  import { HYPERCERTS_NSIDS_BY_TYPE } from "@hypercerts-org/lexicon";
  const nsid = HYPERCERTS_NSIDS_BY_TYPE.OrgHypercertsClaimActivity;
  ```

  Most users should use individual NSID constants (unchanged):

  ```typescript
  import { ACTIVITY_NSID, RIGHTS_NSID } from "@hypercerts-org/lexicon";
  ```

  Or the new semantic mapping:

  ```typescript
  import { HYPERCERTS_NSIDS } from "@hypercerts-org/lexicon";
  const nsid = HYPERCERTS_NSIDS.ACTIVITY; // Same as ACTIVITY_NSID
  ```

- [`ec91289`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/ec912892497198741254a861fd9104fa7c6dc827) Thanks [@aspiers](https://github.com/aspiers)! - chore: switch to build via rollup

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

### Patch Changes

- [`913eb06`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/913eb06bcec519552f45f5d9797579ce99be1635) Thanks [@aspiers](https://github.com/aspiers)! - Switch from bundled to individual type declaration files

  **Changes:**
  - Removed `rollup-plugin-dts` dependency
  - Switched to native TypeScript declaration generation
  - Type declarations now mirror source structure in `dist/types/`
  - Individual type files are small (1-3KB each) and lazy-loaded by TypeScript
  - Improves IDE performance by avoiding single 39MB bundled declaration file

  **Technical Details:**

  The package now generates individual `.d.ts` files alongside the bundled JavaScript
  output. This provides better IDE performance as TypeScript can lazy-load type files
  on demand rather than parsing a massive bundled declaration file upfront.

## 0.10.0-beta.0

### Minor Changes

- [`6a62c04`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/6a62c04e98950756a196110490cabd72f936a976) Thanks [@aspiers](https://github.com/aspiers)! - This release represents the migration of the lexicon package from the SDK monorepo (`hypercerts-sdk/packages/lexicon`) to a dedicated standalone repository (`hypercerts-lexicon`). This separation allows for independent versioning and development of the lexicon definitions.

  Major architectural and feature updates compared to the SDK lexicon package include but are not limited to the following:

  **New Lexicons:**
  - Activity model: `org.hypercerts.claim.activity` - activity-based hypercert records (replaces single claim model)
  - Project records: `org.hypercerts.claim.project` - projects that group multiple activities
  - Shared definitions: `org.hypercerts.defs` - common types (uri, smallBlob, largeBlob, smallImage, largeImage)
  - Badge system: `app.certified.badge.definition`, `app.certified.badge.award`, `app.certified.badge.response` for badge-based endorsements
  - Funding receipts: `org.hypercerts.funding.receipt` - payment and funding tracking

  **Architectural Changes:**
  - **Claim model**: Replaced single `org.hypercerts.claim` record with activity-based `org.hypercerts.claim.activity` model
  - **Collection model**: Collections now reference activities (via `activityWeight`) instead of claims (via `claimItem`)
  - **Work scope**: Activity model uses structured `workScope` object with label-based conditions (`withinAllOf`, `withinAnyOf`, `withinNoneOf`)
  - **Time fields**: Activity uses `startDate`/`endDate` instead of `workTimeFrameFrom`/`workTimeFrameTo`
  - **Image references**: Activity model references `org.hypercerts.defs#smallImage` instead of `app.certified.defs#uri`/`smallBlob`

  **Definition Updates:**
  - `app.certified.defs` now includes `did` type definition
  - Added `org.hypercerts.defs` with image and blob type definitions
  - Activity model references project via AT-URI instead of strongRef

  **Removed/Replaced:**
  - `org.hypercerts.claim` (replaced by `org.hypercerts.claim.activity`)
  - Top-level `org.hypercerts.collection` (replaced by `org.hypercerts.claim.collection` using activities)
