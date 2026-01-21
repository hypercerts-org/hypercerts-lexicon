# @hypercerts-org/lexicon

## 0.10.0-beta.6

### Minor Changes

- [#102](https://github.com/hypercerts-org/hypercerts-lexicon/pull/102) [`68011ae`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/68011ae1f58dcc35408e2400c02dfa16559e18d6) Thanks [@holkexyz](https://github.com/holkexyz)! - Refactor contributions structure and split contributor lexicon

  **Breaking Changes:**
  - **Activity lexicon (`org.hypercerts.claim.activity`):**
    - Renamed `contributions` field to `contributors`
    - Replaced `contributions` array (array of strongRefs) with new `contributors` array containing contributor objects
    - Each contributor object has three fields:
      - `contributorInformation` (required): string (DID/identifier) or strongRef to `org.hypercerts.claim.contributorInformation#main`
      - `weight` (optional): positive number (stored as string)
      - `contributionDetails` (optional): string or strongRef to `org.hypercerts.claim.contributionDetails#main`
    - Renamed internal `contribution` object type to `contributor`
    - Renamed string wrapper defs: `contributorInformationString` → `contributorIdentity`, `contributionDetailsString` → `contributorRole`
    - Updated `contributorRole` string limits: maxLength 10000, maxGraphemes 1000
  - **Contributor lexicon (`org.hypercerts.claim.contributor`):**
    - Split into two separate lexicon files:
      - `org.hypercerts.claim.contributorInformation`: new lexicon file containing `identifier`, `displayName`, `image` (contributor profile information)
      - `org.hypercerts.claim.contributionDetails`: new lexicon file containing `role`, `contributionDescription`, `startDate`, `endDate` (contribution-specific details)
    - The original `org.hypercerts.claim.contributor` lexicon has been removed

  Existing contributions using the old structure will need to be migrated to the new format.

## 0.10.0-beta.5

### Minor Changes

- [#78](https://github.com/hypercerts-org/hypercerts-lexicon/pull/78) [`c55d8a7`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/c55d8a77ff2949136bab0c6680b7e458712404f1) Thanks [@bitbeckers](https://github.com/bitbeckers)! - Remove org.hypercerts.claim.project lexicon and replace with org.hypercerts.claim.collection.project sidecar. Projects are now represented as collections with an optional project sidecar (same TID) that provides rich-text descriptions, avatars, and cover photos. Avatar and coverPhoto fields moved from base collection to project sidecar. Collections without the project sidecar are simple groupings; collections with it are "projects" with rich documentation.

- [#93](https://github.com/hypercerts-org/hypercerts-lexicon/pull/93) [`3276d6e`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/3276d6e59975ac8cfdd9a8eed09ddfd57fdddf41) Thanks [@bitbeckers](https://github.com/bitbeckers)! - Change workScope from inline object definition to strongRef in activity lexicon. This breaking change removes the workScope definition (withinAllOf, withinAnyOf, withinNoneOf properties) and changes the workScope property to reference an external record via strongRef, allowing for more flexible work scope definitions.

- [#97](https://github.com/hypercerts-org/hypercerts-lexicon/pull/97) [`ceddab9`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/ceddab9e829d8ade3868eac4d10dd906e12a153c) Thanks [@aspiers](https://github.com/aspiers)! - Move schema documentation tables from README.md to auto-generated SCHEMAS.md to reduce git merge conflicts. The SCHEMAS.md file is now auto-generated from lexicon definitions and included in the distributed package.

- [#78](https://github.com/hypercerts-org/hypercerts-lexicon/pull/78) [`cc9d7bf`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/cc9d7bff3dc63f155ce8e11204fc1506ca687711) Thanks [@bitbeckers](https://github.com/bitbeckers)! - Refactor collection lexicon to use items array instead of activities. The items array contains plain strongRefs (com.atproto.repo.strongRef) that can reference activities (org.hypercerts.claim.activity) and/or other collections (org.hypercerts.claim.collection), enabling recursive collection nesting. This change removes the activityWeight object structure from the base collection lexicon.

- [#67](https://github.com/hypercerts-org/hypercerts-lexicon/pull/67) [`b51dd76`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/b51dd7652b73c5ae6bba103f07eca9f5195809f0) Thanks [@bitbeckers](https://github.com/bitbeckers)! - Remove bidirectional project-activity link. Activities no longer include a `project` field reference. Projects continue to reference activities via the `activities` array, making the relationship unidirectional (project → activities only).

- [#98](https://github.com/hypercerts-org/hypercerts-lexicon/pull/98) [`43b0431`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/43b04316d8cb11066d61d79e70f262f0d2426cde) Thanks [@aspiers](https://github.com/aspiers)! - Remove org.hypercerts.claim.collection.project lexicon

- [#75](https://github.com/hypercerts-org/hypercerts-lexicon/pull/75) [`95e2ba1`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/95e2ba174ea348746ce64507bf94b73c3d3d3954) Thanks [@s-adamantine](https://github.com/s-adamantine)! - Unify project and collection schemas into a single
  `org.hypercerts.claim.collection` lexicon with `type` discriminator
  field to allow collections to be designated as projects. Custom
  strings are also allowed in `type`.

  Also make `shortDescription` field optional in
  `org.hypercerts.claim.collection` to match
  `org.hypercerts.claim.project`.

  This unification removes `org.hypercerts.claim.project`, so existing
  projects should be migrated to collections with `type` set to
  `project`.

- [#80](https://github.com/hypercerts-org/hypercerts-lexicon/pull/80) [`e8d5a7c`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/e8d5a7cd080e4f8d4e6b96ce5762678deaeb2902) Thanks [@s-adamantine](https://github.com/s-adamantine)! - Updated `org.hypercerts.claim.collection` lexicon:
  - Added optional `type` field to specify collection type (e.g., 'favorites', 'project')
  - Renamed fields for consistency:
    - `collectionTitle` → `title`
    - `shortCollectionDescription` → `shortDescription`
    - `collectionDescription` → `description`
  - Changed `description` from string to Leaflet linear document reference (`pub.leaflet.pages.linearDocument#main`) to support rich-text descriptions

  **Breaking changes**:
  - Field names have been renamed (e.g., `collectionTitle` → `title`)
  - The `description` field now expects a reference object instead of a plain string

- [#92](https://github.com/hypercerts-org/hypercerts-lexicon/pull/92) [`bec8e63`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/bec8e63195fb73734b68f3d5201864b9bede0904) Thanks [@s-adamantine](https://github.com/s-adamantine)! - Update `org.hypercerts.claim.contributor` lexicon to support individual contributor profiles and roles.

  Breaking Changes:
  - Removed `contributors` array.
  - Added `identifier`, `displayName`, and `image` fields for individual profiles.
  - Renamed `description` to `contributionDescription`.
  - Updated `required` fields to only include `createdAt`.

  Also corrected incorrect references to `org.hypercerts.claim.contribution` across the codebase to use the correct ID `org.hypercerts.claim.contributor`.

### Patch Changes

- [#77](https://github.com/hypercerts-org/hypercerts-lexicon/pull/77) [`0d61ff7`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/0d61ff7e030a25682cd71877ae603b8782b09c3b) Thanks [@bitbeckers](https://github.com/bitbeckers)! - Document ATProto sidecar pattern for collections using app.certified.location. Collections can now have location metadata by creating a location record with the same TID, allowing location updates without changing the collection CID. Updated README with usage example and ERD with sidecar relationship.

- [#74](https://github.com/hypercerts-org/hypercerts-lexicon/pull/74) [`f845f92`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/f845f924907f62c8b96afa6a18ac203c4bd4cad5) Thanks [@aspiers](https://github.com/aspiers)! - Make startDate and endDate optional in activity lexicon

## 0.10.0-beta.4

### Minor Changes

- [#47](https://github.com/hypercerts-org/hypercerts-lexicon/pull/47) [`6a66e4b`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/6a66e4b78ef676cc66b35773f2f9828ea697d332) Thanks [@satyam-mishra-pce](https://github.com/satyam-mishra-pce)! - Add support for multiple locations in an activity claim.

## 0.10.0-beta.3

### Patch Changes

- [`ece7629`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/ece7629956d6efbfed757d66609fe4ccc1c81d5a) Thanks [@aspiers](https://github.com/aspiers)! - Include CHANGELOG.md in package distribution for better user documentation.

## 0.10.0-beta.2

### Patch Changes

- [`5a490bf`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/5a490bf4404f6690fe832f82023ea05663050977) Thanks [@aspiers](https://github.com/aspiers)! - Add basic test suite using vitest 4.

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
