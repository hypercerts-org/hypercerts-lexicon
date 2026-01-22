# @hypercerts-org/lexicon

## 0.10.0-beta.11

### Minor Changes

- [#123](https://github.com/hypercerts-org/hypercerts-lexicon/pull/123) [`c623d32`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/c623d327e0e6c1a4f5ca92135ece284cfe166421) Thanks [@aspiers](https://github.com/aspiers)! - Add `location` property to collections. Collections can now reference a location record directly via strongRef. This replaces the sidecar pattern which was impractical since location records cannot be reused across multiple collections.

## 0.10.0-beta.10

### Minor Changes

- [#122](https://github.com/hypercerts-org/hypercerts-lexicon/pull/122) [`3e3da41`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/3e3da41df8016d4d7f63477000a01756704d0820) Thanks [@aspiers](https://github.com/aspiers)! - Drop HELPER\_ prefix from workScopeTag constants. `HELPER_WORK_SCOPE_TAG_NSID`, `HELPER_WORK_SCOPE_TAG_LEXICON_JSON`, and `HELPER_WORK_SCOPE_TAG_LEXICON_DOC` are now `WORK_SCOPE_TAG_NSID`, `WORK_SCOPE_TAG_LEXICON_JSON`, and `WORK_SCOPE_TAG_LEXICON_DOC`.

## 0.10.0-beta.9

### Minor Changes

- [#121](https://github.com/hypercerts-org/hypercerts-lexicon/pull/121) [`5c33b79`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/5c33b796f78eca2a207116d246a715cd5712f392) Thanks [@aspiers](https://github.com/aspiers)! - Fix camelCase export names to use underscores. Generated constants like `CONTRIBUTIONDETAILS_LEXICON_*` are now `CONTRIBUTION_DETAILS_LEXICON_*` for consistency.

  Affected exports:
  - `CONTRIBUTION_DETAILS_NSID`, `CONTRIBUTION_DETAILS_LEXICON_JSON`, `CONTRIBUTION_DETAILS_LEXICON_DOC` (was `CONTRIBUTIONDETAILS_*`)
  - `CONTRIBUTOR_INFORMATION_NSID`, `CONTRIBUTOR_INFORMATION_LEXICON_JSON`, `CONTRIBUTOR_INFORMATION_LEXICON_DOC` (was `CONTRIBUTORINFORMATION_*`)
  - `STRONG_REF_NSID`, `STRONG_REF_LEXICON_JSON`, `STRONG_REF_LEXICON_DOC` (was `STRONGREF_*`)
  - `HELPER_WORK_SCOPE_TAG_NSID`, `HELPER_WORK_SCOPE_TAG_LEXICON_JSON`, `HELPER_WORK_SCOPE_TAG_LEXICON_DOC` (was `HELPER_WORKSCOPETAG_*`)

## 0.10.0-beta.8

### Minor Changes

- [#107](https://github.com/hypercerts-org/hypercerts-lexicon/pull/107) [`678de97`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/678de97614826fc124ed3208cccb236d9b6e2bb1) Thanks [@holkexyz](https://github.com/holkexyz)! - Add work scope logic expression system with boolean operators

  **New Features:**
  - **Work scope logic AST (`org.hypercerts.defs`):**
    - Added `org.hypercerts.defs#workScopeAll` (logical AND): requires all arguments to be satisfied, with recursive union support for nested expressions
    - Added `org.hypercerts.defs#workScopeAny` (logical OR): requires at least one argument to be satisfied, with recursive union support for nested expressions
    - Added `org.hypercerts.defs#workScopeNot` (logical NOT): negates an expression, with recursive union support for nested expressions
    - Added `org.hypercerts.defs#workScopeAtom`: atomic reference to a scope tag record via strongRef
    - All operators support recursive boolean logic expressions through union types in their `args`/`arg` properties, allowing nested combinations of `workScopeAll`, `workScopeAny`, `workScopeNot`, and `workScopeAtom`
  - **Work scope tag lexicon (`org.hypercerts.helper.workScopeTag`):**
    - New record type for reusable scope atoms
    - Fields: `createdAt`, `key`, `label` (required), `kind`, `description`, `parent`, `aliases`, `externalReference` (optional)
    - Supports taxonomy/hierarchy via `parent` strongRef
    - Supports external references via URI or blob
  - **Activity lexicon (`org.hypercerts.claim.activity`):**
    - Added `org.hypercerts.claim.activity#workScope` field using a union type that references `org.hypercerts.defs#workScopeAll`, `org.hypercerts.defs#workScopeAny`, `org.hypercerts.defs#workScopeNot`, and `org.hypercerts.defs#workScopeAtom`
    - Enables complex boolean logic expressions for work scope definitions with recursive nesting support
    - Replaces simple strongRef approach with expressive AST-based system

  **Breaking Changes:**
  - The `workScope` field in `org.hypercerts.claim.activity` now expects a work scope logic expression instead of a simple strongRef. Existing records using the old format will need to be migrated to use the new AST structure.

## 0.10.0-beta.7

### Minor Changes

- [#106](https://github.com/hypercerts-org/hypercerts-lexicon/pull/106) [`b03a1f7`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/b03a1f7925b56a5d614bb3a40f7fe5e6321f3d34) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add avatar and banner fields to collection lexicon for visual representation

- [#113](https://github.com/hypercerts-org/hypercerts-lexicon/pull/113) [`c3f9ca2`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/c3f9ca2f5cb2c5da4d0f4272a74d06f6798e058b) Thanks [@holkexyz](https://github.com/holkexyz)! - Refactor collection items structure to support optional weights and remove activityWeight from activity schema

  **Breaking Changes:**
  - **Activity lexicon (`org.hypercerts.claim.activity`):**
    - Removed `org.hypercerts.claim.activity#activityWeight` def
    - Activity records no longer include activity weight information
  - **Collection lexicon (`org.hypercerts.claim.collection`):**
    - Changed `org.hypercerts.claim.collection#items` from array of strongRefs to array of item objects
    - Added `org.hypercerts.claim.collection#item` def with:
      - `itemIdentifier` (required): strongRef to an item (activity or collection)
      - `itemWeight` (optional): positive numeric value stored as string
    - Supports recursive collection nesting (items can reference activities or other collections)

  **Migration:**

  **Collection items:** Convert from array of strongRefs to array of item objects:

  ```json
  // Before
  "items": [strongRef1, strongRef2]

  // After
  "items": [
    { "itemIdentifier": strongRef1, "itemWeight": "1.5" },
    { "itemIdentifier": strongRef2 }
  ]
  ```

  **Activity weights:** Migrate existing `org.hypercerts.claim.activity#activityWeight` data to collection `org.hypercerts.claim.collection#item.itemWeight`:

  ```json
  // Old (removed from activity)
  { "activity": { "uri": "...", "cid": "..." }, "weight": "1.5" }

  // New (in collection items)
  { "itemIdentifier": { "uri": "...", "cid": "..." }, "itemWeight": "1.5" }
  ```

  Update collections that reference activities to include weights in `org.hypercerts.claim.collection#item.itemWeight`. Weights can be dropped if not needed.

- [#91](https://github.com/hypercerts-org/hypercerts-lexicon/pull/91) [`0c6da09`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/0c6da093c8a38a3ee516a85b6bffee0850535b14) Thanks [@holkexyz](https://github.com/holkexyz)! - Add rich text facet support to activity claim descriptions

  Add `shortDescriptionFacets` and `descriptionFacets` fields to the activity lexicon to support rich text annotations (mentions, URLs, hashtags, etc.) in activity claim descriptions.

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
