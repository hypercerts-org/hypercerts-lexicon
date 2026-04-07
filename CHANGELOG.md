# @hypercerts-org/lexicon

## 0.11.0

The v0.11.0 release introduces EVM identity linking, stronger type safety across badge and funding schemas, vendored Leaflet lexicons for runtime validation, and a set of schema refinements based on real-world usage from the first month of v0.10.0 adoption. All changes listed below are merged to `main` and will ship together as a single coordinated release.

```bash
npm install @hypercerts-org/lexicon@0.11.0
```

---

### New lexicons

#### EVM identity linking

`app.certified.link.evm`

A new record type for creating verifiable links between ATProto identities and EVM wallet addresses. Each record contains a cryptographic proof — currently EIP-712 typed data signatures for EOA wallets — that binds a DID to an Ethereum address onchain.

The `proof` field is an open union, so future signature methods (ERC-1271, ERC-6492) can be added without breaking existing records.

```jsonc
{
  "address": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
  "proof": {
    "$type": "app.certified.link.evm#eip712Proof",
    "signature": "0x...",
    "message": {
      "did": "did:plc:abc123",
      "evmAddress": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      "chainId": "1",
      "timestamp": "1711929600",
      "nonce": "0",
    },
  },
  "createdAt": "2026-04-03T00:00:00.000Z",
}
```

#### Vendored Leaflet and richtext lexicons

`pub.leaflet.*` · `pub.leaflet.richtext.facet`

The package now ships the full set of Leaflet block and richtext facet lexicon JSON files (17 files). Previously, these external schemas were shimmed at the TypeScript type level via `@atcute` packages, which caused `LexiconDefNotFoundError` at runtime when validating records with `description` or facet fields. Vendoring them fixes runtime validation and removes the `@atcute/leaflet` and `@atcute/bluesky` dependencies.

This is a **packaging change**, not a schema change. No record structures are affected.

---

### Breaking changes

This release includes four breaking schema changes. All were identified early enough in adoption that the team decided the long-term gains outweigh the migration cost.

#### Description fields widened to union type

`org.hypercerts.claim.activity` · `org.hypercerts.collection` · `org.hypercerts.context.attachment` · `org.hypercerts.context.evaluation` · `org.hypercerts.context.measurement`

The `description` field across all major lexicons changed from a single Leaflet `linearDocument` ref to a three-way union: an inline string (`org.hypercerts.defs#descriptionString`), a Leaflet linear document (`pub.leaflet.pages.linearDocument`), or a strong reference to an external description record (`com.atproto.repo.strongRef`). This resolves the pain point where apps broke because only Leaflet documents were accepted.

The new `descriptionString` def supports plain text or markdown up to 250,000 bytes (25,000 graphemes) with optional rich text facets.

```diff
  // Before — Leaflet only
- "description": { "$type": "pub.leaflet.pages.linearDocument", "blocks": [...] }

  // After — plain string (simplest)
+ "description": {
+   "$type": "org.hypercerts.defs#descriptionString",
+   "value": "A reforestation project in the Amazon basin."
+ }

  // After — Leaflet (still works)
+ "description": { "$type": "pub.leaflet.pages.linearDocument", "blocks": [...] }

  // After — strong ref to external record
+ "description": { "$type": "com.atproto.repo.strongRef", "uri": "at://...", "cid": "bafyrei..." }
```

**Who needs to update:**

| Consumer      | Action                                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Indexers      | Handle union with `$type` discriminator. Store string descriptions directly. Continue handling Leaflet docs. Resolve strong refs if needed.    |
| AppViews      | Return descriptions with their `$type`. Render all three variants appropriately.                                                               |
| SDK consumers | Regenerate types. Code that previously passed a bare Leaflet doc must now include the `$type` discriminator.                                   |
| Frontend      | Render plain strings, Leaflet docs, and resolved strong refs. The `descriptionString` variant is the simplest path for apps that broke before. |

#### Evaluation scores are now strings

`org.hypercerts.context.evaluation`

The `min`, `max`, and `value` fields on evaluation scores changed from `integer` to `string`. ATProto has no native decimal type, and integer-only scores made use cases like "3.7 out of 5" impossible.

```diff
  // Before
- { "min": 0, "max": 10, "value": 7 }
+ // After
+ { "min": "0", "max": "10", "value": "7.5" }
```

**Who needs to update:**

| Consumer | Action                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| Indexers | Change column type from `INTEGER` to `TEXT`. Backfill existing records. Update any numeric sorting or filtering logic. |
| AppViews | Parse scores as strings. Use `parseFloat()` for numeric display where appropriate.                                     |
| Frontend | Handle both numeric strings (`"3.7"`) and potentially non-numeric strings (`"A+"`) in display components.              |

#### Badge references are now strong refs

`app.certified.badge.award` · `app.certified.badge.response`

Badge awards and responses now reference their parent records via `com.atproto.repo.strongRef` instead of plain lexicon refs. Strong references include both a URI and a content hash (CID), pinning the reference to a specific version of the badge definition. This prevents the meaning of an award from drifting if the underlying badge definition is later modified.

```diff
  // Before
- "badge": "at://did:plc:abc/app.certified.badge.definition/123"

  // After
+ "badge": {
+   "uri": "at://did:plc:abc/app.certified.badge.definition/123",
+   "cid": "bafyrei..."
+ }
```

**Who needs to update:**

| Consumer      | Action                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| Indexers      | Update parsing to expect `{ uri, cid }` objects instead of plain URI strings for `badge` and `badgeAward` fields. |
| AppViews      | Update resolution logic. Dereference using both `uri` and `cid` for content verification.                         |
| SDK consumers | Regenerate types. Any code constructing badge awards or responses must supply the full strong ref.                |

#### Funding receipt fields normalized

`org.hypercerts.funding.receipt`

The `from`, `to`, and `for` fields have been reworked for consistency and stronger type safety.

| Field  | Before (v0.10.0)  | After                                                                                      |
| ------ | ----------------- | ------------------------------------------------------------------------------------------ |
| `from` | Required, DID ref | **Optional**, union of `#text` \| `app.certified.defs#did` \| `com.atproto.repo.strongRef` |
| `to`   | Plain string      | Union of `#text` \| `app.certified.defs#did` \| `com.atproto.repo.strongRef`               |
| `for`  | AT-URI string     | `com.atproto.repo.strongRef` (pins to a specific record version)                           |

The `from` and `to` fields were asymmetric — `from` required an AT Protocol identity while `to` accepted any string. Now both are three-way unions that accept a free-text string (`#text` — for display names, wallet addresses, or other identifiers), a DID, or a strong reference. This treats senders and recipients uniformly while preserving the ability to reference non-ATProto participants. `from` is also optional, properly supporting anonymous funding. `for` is now a strong ref, ensuring the receipt always points to the exact version of the activity it funded.

```diff
  // Before
- "from": { "$type": "app.certified.defs#did", "did": "did:plc:sender" },
- "to": "did:plc:recipient",
- "for": "at://did:plc:abc/org.hypercerts.claim.activity/123"

  // After — with a DID
+ "from": { "$type": "app.certified.defs#did", "did": "did:plc:sender" },
+ "to": { "$type": "app.certified.defs#did", "did": "did:plc:recipient" },

  // After — with a free-text identifier
+ "to": { "$type": "org.hypercerts.funding.receipt#text", "value": "0xAb58...eC9B" },

  // After — for field
+ "for": {
+   "uri": "at://did:plc:abc/org.hypercerts.claim.activity/123",
+   "cid": "bafyrei..."
+ }
```

**Who needs to update:**

| Consumer      | Action                                                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Indexers      | Update parsing for `from`, `to` (now unions with `$type` discriminator — handle all three variants), and `for` (now `{ uri, cid }`). Allow `NULL` for `from`.  |
| AppViews      | Update resolution logic for all three fields. `for` requires dereferencing via both URI and CID. Handle `#text` variants for display.                          |
| SDK consumers | Regenerate types. Code constructing receipts must supply union-typed `to` and strong ref `for`.                                                                |
| Frontend      | Update forms to construct proper union objects for sender/recipient. Handle `#text` for non-ATProto participants. Handle missing `from` for anonymous display. |

---

### Schema changes

> **A note on "optional" fields:** Even new optional fields require attention from indexers and AppViews. If an indexer doesn't store a new field, that data is silently lost for every downstream consumer. The changes below are non-breaking in the strict sense — existing records remain valid — but ignoring them means incomplete data.

#### Known values

Several free-text string fields now declare `knownValues` — a set of canonical values that establish interoperability conventions across the ecosystem. Custom values are still permitted. Think of these as Schelling points, not constraints.

| Lexicon                             | Field         | Known values                                                                                       |
| ----------------------------------- | ------------- | -------------------------------------------------------------------------------------------------- |
| `org.hypercerts.collection`         | `type`        | `favorites` · `project` · `portfolio` · `program`                                                  |
| `org.hypercerts.context.attachment` | `contentType` | `report` · `audit` · `evidence` · `testimonial` · `methodology`                                    |
| `app.certified.badge.definition`    | `badgeType`   | `endorsement` · `verification` · `participation` · `certification` · `affiliation` · `recognition` |

**Action:** Indexers should index these values for filtering and categorization. AppViews and frontends can use them for dropdowns, search facets, and display grouping. No schema migration required — the underlying field type is still a string.

#### Badge icon is now optional

`app.certified.badge.definition`

The `icon` field moved from `required` to optional. Not all badges have a visual representation — endorsements, participation records, and text-based certifications can now omit the icon entirely.

**Action:** Indexers should allow `NULL` in the icon column. Frontend developers must add a fallback or placeholder when rendering badges without an icon — apps that assume `icon` is always present will crash or render broken UI.

#### Contributors array is uncapped

`org.hypercerts.claim.activity`

Removed the `maxLength: 1000` constraint on the `contributors` array. ATProto records have a natural 1 MB size limit (~2,000–4,000 contributors), making the artificial cap unnecessary.

**Action:** Indexers and AppViews with hardcoded length limits matching the old max should remove them. Frontends should implement pagination or lazy loading for large contributor lists to avoid performance issues.

#### Rich text on collection short descriptions

`org.hypercerts.collection`

Added `shortDescriptionFacets` — an optional array of rich text facets (mentions, URLs, hashtags) that annotate the `shortDescription` field. This brings collections in line with activity claims, which already supported facets.

**Action:** Indexers must store the new field when present — without it, rich text annotations (links, mentions) are permanently lost. AppViews should include facets in API responses. Frontends can render rich text using the standard ATProto facet model.

---

### Documentation improvements

- **Contributor and item defs** now have descriptions, improving TypeScript IntelliSense and AI code generation.
- **`occurredAt` vs `createdAt`** semantics clarified on funding receipts. `occurredAt` is when the funding happened in the real world; `createdAt` is when the record was written to the PDS.
- **Stale references** in board and measurement lexicon descriptions have been corrected.
- **README** rewritten with an ASCII namespace map and structured reference tables.
- **AI agent skill** added for downstream developers. Install via `npx skills add hypercerts-org/hypercerts-lexicon`.

---

### Upgrading

```bash
npm install @hypercerts-org/lexicon@0.11.0
```

The source of truth for lexicon definitions is the [NPM package](https://www.npmjs.com/package/@hypercerts-org/lexicon) and the published ATProto repository. The `main` branch on GitHub is a development branch — do not build production applications against it.

After upgrading, regenerate your TypeScript types and run your validation suite against the updated schemas. The package includes all lexicon JSON files and pre-built type definitions.

## 0.10.0

### Minor Changes

- [#76](https://github.com/hypercerts-org/hypercerts-lexicon/pull/76) [`3044e22`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/3044e22c1345b3cd5764e3c6c3714b21e6911663) Thanks [@s-adamantine](https://github.com/s-adamantine)! - Add org.hypercerts.acknowledgement lexicon for bidirectional inclusion links between records across PDS repos

- [#141](https://github.com/hypercerts-org/hypercerts-lexicon/pull/141) [`06fb6b5`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/06fb6b54542fe6311d55cb26a1c468c1374b0ab1) Thanks [@holkexyz](https://github.com/holkexyz)! - Add CEL expression support for structured work scopes (`org.hypercerts.workscope.cel`, `org.hypercerts.workscope.tag`)

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

- [#149](https://github.com/hypercerts-org/hypercerts-lexicon/pull/149) [`9f124eb`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/9f124eb404e30a30ac90a6c4be934ece84556c08) Thanks [@daviddao](https://github.com/daviddao)! - Add `org.hyperboards.board` and `org.hyperboards.displayProfile` lexicons for hyperboard visual presentation records.

- [#123](https://github.com/hypercerts-org/hypercerts-lexicon/pull/123) [`c623d32`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/c623d327e0e6c1a4f5ca92135ece284cfe166421) Thanks [@aspiers](https://github.com/aspiers)! - Add `location` property to collections. Collections can now reference a location record directly via strongRef. This replaces the sidecar pattern which was impractical since location records cannot be reused across multiple collections.

- [#140](https://github.com/hypercerts-org/hypercerts-lexicon/pull/140) [`20eb414`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/20eb414bd75cb100bebe16cfb41286377c18d5e7) Thanks [@holkexyz](https://github.com/holkexyz)! - Add app.certified.actor.organization sidecar record for organization actor profiles with fields for organization type, labeled URLs, location (strongRef), and founded date

- [#133](https://github.com/hypercerts-org/hypercerts-lexicon/pull/133) [`6752cad`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/6752cad3c9e58b9a8e1a3ca17f2ea7a4a68dba81) Thanks [@Kzoeps](https://github.com/Kzoeps)! - Add profile lexicon for Hypercert account profiles with support for display name, description, pronouns, website, avatar, banner.

- [#78](https://github.com/hypercerts-org/hypercerts-lexicon/pull/78) [`c55d8a7`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/c55d8a77ff2949136bab0c6680b7e458712404f1) Thanks [@bitbeckers](https://github.com/bitbeckers)! - Remove org.hypercerts.claim.project lexicon and replace with org.hypercerts.claim.collection.project sidecar. Projects are now represented as collections with an optional project sidecar (same TID) that provides rich-text descriptions, avatars, and cover photos. Avatar and coverPhoto fields moved from base collection to project sidecar. Collections without the project sidecar are simple groupings; collections with it are "projects" with rich documentation.

- [#91](https://github.com/hypercerts-org/hypercerts-lexicon/pull/91) [`0c6da09`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/0c6da093c8a38a3ee516a85b6bffee0850535b14) Thanks [@holkexyz](https://github.com/holkexyz)! - Add rich text facet support to activity claim descriptions

  Add `shortDescriptionFacets` and `descriptionFacets` fields to the activity lexicon to support rich text annotations (mentions, URLs, hashtags, etc.) in activity claim descriptions.

- [#144](https://github.com/hypercerts-org/hypercerts-lexicon/pull/144) [`fb90134`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/fb90134e5df32e955e5f9fba748f4ca46d00e90e) Thanks [@holkexyz](https://github.com/holkexyz)! - Make items optional in collection schema to allow creating empty collections

- [#151](https://github.com/hypercerts-org/hypercerts-lexicon/pull/151) [`4d5f42f`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/4d5f42fa4f9ae2c74a6703f3af50e9acfd09ae95) Thanks [@holkexyz](https://github.com/holkexyz)! - Add optional `url` field to `app.certified.badge.award` for linking to an external page associated with the badge

- [#122](https://github.com/hypercerts-org/hypercerts-lexicon/pull/122) [`3e3da41`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/3e3da41df8016d4d7f63477000a01756704d0820) Thanks [@aspiers](https://github.com/aspiers)! - Drop HELPER\_ prefix from workScopeTag constants. `HELPER_WORK_SCOPE_TAG_NSID`, `HELPER_WORK_SCOPE_TAG_LEXICON_JSON`, and `HELPER_WORK_SCOPE_TAG_LEXICON_DOC` are now `WORK_SCOPE_TAG_NSID`, `WORK_SCOPE_TAG_LEXICON_JSON`, and `WORK_SCOPE_TAG_LEXICON_DOC`.

- [#136](https://github.com/hypercerts-org/hypercerts-lexicon/pull/136) [`062fbde`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/062fbde905dbd939f75c366760be1c02bb8a0412) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Expand locationType knownValues to include geojson, h3, geohash, wkt, address, and scaledCoordinates from the [Location Protocol spec](https://spec.decentralizedgeo.org/specification/location-types/#location-type-registry)

- [#131](https://github.com/hypercerts-org/hypercerts-lexicon/pull/131) [`7f42fad`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/7f42fad517e191dad6db22fc67ec8346ec167f5c) Thanks [@aspiers](https://github.com/aspiers)! - Add inline string format to app.certified.location schema with documentation and examples

- [#121](https://github.com/hypercerts-org/hypercerts-lexicon/pull/121) [`5c33b79`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/5c33b796f78eca2a207116d246a715cd5712f392) Thanks [@aspiers](https://github.com/aspiers)! - Fix camelCase export names to use underscores. Generated constants like `CONTRIBUTIONDETAILS_LEXICON_*` are now `CONTRIBUTION_DETAILS_LEXICON_*` for consistency.

  Affected exports:
  - `CONTRIBUTION_DETAILS_NSID`, `CONTRIBUTION_DETAILS_LEXICON_JSON`, `CONTRIBUTION_DETAILS_LEXICON_DOC` (was `CONTRIBUTIONDETAILS_*`)
  - `CONTRIBUTOR_INFORMATION_NSID`, `CONTRIBUTOR_INFORMATION_LEXICON_JSON`, `CONTRIBUTOR_INFORMATION_LEXICON_DOC` (was `CONTRIBUTORINFORMATION_*`)
  - `STRONG_REF_NSID`, `STRONG_REF_LEXICON_JSON`, `STRONG_REF_LEXICON_DOC` (was `STRONGREF_*`)
  - `HELPER_WORK_SCOPE_TAG_NSID`, `HELPER_WORK_SCOPE_TAG_LEXICON_JSON`, `HELPER_WORK_SCOPE_TAG_LEXICON_DOC` (was `HELPER_WORKSCOPETAG_*`)

- [#132](https://github.com/hypercerts-org/hypercerts-lexicon/pull/132) [`da481e0`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/da481e09f5bd1a8e62e388f2c6001896d76b1fbf) Thanks [@aspiers](https://github.com/aspiers)! - Convert app.certified.defs#did to object type

  The did definition in app.certified.defs has been converted from a primitive
  string type to an object type to comply with the ATProto specification
  requirement that all union variants must be object or record types.

  This change was necessary because app.certified.badge.award uses this
  definition in a union for the subject property.

  Breaking changes:
  - `app.certified.defs#did`: Now an object with `did` string property (maxLength 256)
  - Code using this type must now access the `.did` property instead of using the value directly

- [#132](https://github.com/hypercerts-org/hypercerts-lexicon/pull/132) [`e134b26`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/e134b26c43a70c0a9ae04cc12b8a3bd05990c470) Thanks [@aspiers](https://github.com/aspiers)! - Convert union string definitions to object types in activity lexicon

  The contributorIdentity, contributorRole, and workScopeString definitions
  in org.hypercerts.claim.activity have been converted from primitive string
  types to object types to comply with the ATProto specification requirement
  that all union variants must be object or record types.

  Additionally, maximum length constraints have been reduced to more reasonable
  values:
  - `contributorIdentity.identity`: maxLength 1000, maxGraphemes 100 (previously no limits)
  - `contributorRole.role`: maxLength 1000, maxGraphemes 100 (previously maxLength 10000, maxGraphemes 1000)
  - `workScopeString.scope`: maxLength 1000, maxGraphemes 100 (previously maxLength 10000, maxGraphemes 1000)

  Breaking changes:
  - `contributorIdentity`: Now an object with `identity` string property
  - `contributorRole`: Now an object with `role` string property
  - `workScopeString`: Now an object with `scope` string property
  - Reduced maximum lengths may affect existing records with longer values

  This requires updating code that uses these union types to access the nested
  property instead of using the value directly.

- [#152](https://github.com/hypercerts-org/hypercerts-lexicon/pull/152) [`2afb6ed`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/2afb6edb89ffd186f2e0cf015bcc3557e13a7a6d) Thanks [@holkexyz](https://github.com/holkexyz)! - Use Leaflet linear documents for rich-text descriptions in activity and attachment lexicons, and make attachment content optional.

- [#161](https://github.com/hypercerts-org/hypercerts-lexicon/pull/161) [`96bdb6c`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/96bdb6c9c7107680da301a92a8120ee60e676f15) Thanks [@aspiers](https://github.com/aspiers)! - Improved exports structure with semantic collection mappings for extra syntactic sugar.

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

- [#161](https://github.com/hypercerts-org/hypercerts-lexicon/pull/161) [`6a62c04`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/6a62c04e98950756a196110490cabd72f936a976) Thanks [@aspiers](https://github.com/aspiers)! - This release represents the migration of the lexicon package from the SDK monorepo (`hypercerts-sdk/packages/lexicon`) to a dedicated standalone repository (`hypercerts-lexicon`). This separation allows for independent versioning and development of the lexicon definitions.

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

- [#153](https://github.com/hypercerts-org/hypercerts-lexicon/pull/153) [`57dc44c`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/57dc44c163a6d62e4256e3de41ccf14617eb07e8) Thanks [@holkexyz](https://github.com/holkexyz)! - Improve acknowledgement schema: move to org.hypercerts.context.acknowledgement, generalize descriptions, make context optional, add maxGraphemes to comment.

- [#158](https://github.com/hypercerts-org/hypercerts-lexicon/pull/158) [`7743aa6`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/7743aa6014faa35714d3e146cfa45b0e67501992) Thanks [@holkexyz](https://github.com/holkexyz)! - Move collection lexicon from `org.hypercerts.claim.collection` to `org.hypercerts.collection` to reflect that collections can contain more than just claims.

- [#154](https://github.com/hypercerts-org/hypercerts-lexicon/pull/154) [`4c52b2c`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/4c52b2c9b2d449cbeb74eea9efa0a9eb2a0a39b7) Thanks [@holkexyz](https://github.com/holkexyz)! - Move evaluation and attachment lexicons to org.hypercerts.context namespace.

- [#135](https://github.com/hypercerts-org/hypercerts-lexicon/pull/135) [`806cfbc`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/806cfbca7cbcd3674a5f8e97a6b6dd87ba806c08) Thanks [@Kzoeps](https://github.com/Kzoeps)! - Move profile lexicon from app.certified.profile to app.certified.actor.profile namespace, requiring migration of existing profile records

- [#97](https://github.com/hypercerts-org/hypercerts-lexicon/pull/97) [`ceddab9`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/ceddab9e829d8ade3868eac4d10dd906e12a153c) Thanks [@aspiers](https://github.com/aspiers)! - Move schema documentation tables from README.md to auto-generated SCHEMAS.md to reduce git merge conflicts. The SCHEMAS.md file is now auto-generated from lexicon definitions and included in the distributed package.

- [#102](https://github.com/hypercerts-org/hypercerts-lexicon/pull/102) [`68011ae`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/68011ae1f58dcc35408e2400c02dfa16559e18d6) Thanks [@holkexyz](https://github.com/holkexyz)! - Refactor contributions structure in activity lexicon

  **Breaking Changes:**
  - **Activity lexicon (`org.hypercerts.claim.activity`):**
    - Renamed `contributions` field to `contributors`
    - Replaced `contributions` array (array of strongRefs) with new `contributors` array containing contributor objects
    - Each contributor object (`org.hypercerts.claim.activity#contributor`) has three fields:
      - `contributorIdentity` (required): string (DID/identifier) or strongRef to a contributor information record
      - `contributionWeight` (optional): positive numeric value stored as string
      - `contributionDetails` (optional): string or strongRef to a contribution details record
    - Added internal defs:
      - `#contributor`: object type for contributor entries
      - `#contributorIdentity`: string type for DID/identifier values
      - `#contributorRole`: string type for contribution details (maxLength 10000, maxGraphemes 1000)

  **Migration:**

  Convert from array of strongRefs to array of contributor objects:

  ```json
  // Before
  "contributions": [strongRef1, strongRef2]

  // After
  "contributors": [
    {
      "contributorIdentity": "did:example:123",
      "contributionWeight": "1.5",
      "contributionDetails": "Lead developer"
    },
    {
      "contributorIdentity": strongRefToContributorInfo,
      "contributionDetails": strongRefToContributionDetails
    }
  ]
  ```

- [#120](https://github.com/hypercerts-org/hypercerts-lexicon/pull/120) [`b2f7b68`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/b2f7b683ac17f07a891a59ee8289d26717197ba3) Thanks [@holkexyz](https://github.com/holkexyz)! - Refactor measurement lexicon schema: convert subject to subjects array, add unit field, date ranges, and locations array

  **Breaking Changes:**
  - **Measurement lexicon (`org.hypercerts.context.measurement`):**
    - Changed `subject` (single strongRef) to `subjects` (array of strongRefs, maxLength: 100)
    - Changed required fields: removed `measurers` from required, added `unit` as required
    - Added `unit` field (required, string, maxLength: 50): The unit of the measured value (e.g. kg CO₂e, hectares, %, index score)
    - Added `startDate` field (optional, datetime): The start date and time when the measurement began
    - Added `endDate` field (optional, datetime): The end date and time when the measurement ended
    - Changed `location` (single strongRef) to `locations` (array of strongRefs, maxLength: 100)
    - Moved `measurers` from required to optional field
    - Added `comment` field (optional, string): Short comment suitable for previews and list views
    - Added `commentFacets` field (optional, array): Rich text annotations for `comment` (mentions, URLs, hashtags, etc.)
    - Updated field descriptions for `metric` and `value` with more detailed examples

- [#67](https://github.com/hypercerts-org/hypercerts-lexicon/pull/67) [`b51dd76`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/b51dd7652b73c5ae6bba103f07eca9f5195809f0) Thanks [@bitbeckers](https://github.com/bitbeckers)! - Remove bidirectional project-activity link. Activities no longer include a `project` field reference. Projects continue to reference activities via the `activities` array, making the relationship unidirectional (project → activities only).

- [#98](https://github.com/hypercerts-org/hypercerts-lexicon/pull/98) [`43b0431`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/43b04316d8cb11066d61d79e70f262f0d2426cde) Thanks [@aspiers](https://github.com/aspiers)! - Remove org.hypercerts.claim.collection.project lexicon

- [#155](https://github.com/hypercerts-org/hypercerts-lexicon/pull/155) [`a59e541`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/a59e5418e242a2f6b2868cc46f5481d75a7bf0ca) Thanks [@holkexyz](https://github.com/holkexyz)! - Rename contributionDetails to contribution (org.hypercerts.claim.contribution).

- [#118](https://github.com/hypercerts-org/hypercerts-lexicon/pull/118) [`8427780`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/8427780888759ee749a683528f49e6b0da2b97c2) Thanks [@holkexyz](https://github.com/holkexyz)! - Rename evidence lexicon to attachment and refactor schema structure

  **Breaking Changes:**
  - **Lexicon ID change:**
    - `org.hypercerts.claim.evidence` → `org.hypercerts.claim.attachment`
    - All existing evidence records must be migrated to use the new lexicon ID
  - **Schema structure changes (`org.hypercerts.claim.attachment`):**
    - Changed `subject` (single strongRef) to `subjects` (array of strongRefs, maxLength: 100)
    - Changed `content` from single union (uri/blob) to array of unions (maxLength: 100)
    - Added `contentType` field (string, maxLength: 64) to specify attachment type
    - Removed `relationType` field (previously used to indicate supports/challenges/clarifies)
    - Removed `contributors` field
    - Removed `locations` field
    - Added rich text support: `shortDescriptionFacets` and `descriptionFacets` (arrays of `app.bsky.richtext.facet`)
    - Updated required fields: `["title", "content", "createdAt"]` (content is now required)
  - **Common definitions (`org.hypercerts.defs`):**
    - Added `weightedContributor` def for contributor references with optional weights
    - Added `contributorIdentity` def for string-based contributor identification

  **Migration:**

  **Lexicon ID:** Update all references from `org.hypercerts.claim.evidence` to `org.hypercerts.claim.attachment`.

  **Schema migration:**

  ```json
  // Before (org.hypercerts.claim.evidence)
  {
    "$type": "org.hypercerts.claim.evidence",
    "subject": { "uri": "...", "cid": "..." },
    "content": { "uri": "https://..." },
    "title": "Evidence Title",
    "relationType": "supports",
    "createdAt": "..."
  }

  // After (org.hypercerts.claim.attachment)
  {
    "$type": "org.hypercerts.claim.attachment",
    "subjects": [{ "uri": "...", "cid": "..." }],
    "content": [{ "uri": "https://..." }],
    "contentType": "evidence",
    "title": "Evidence Title",
    "createdAt": "..."
  }
  ```

  **Field mapping:**
  - `subject` → `subjects` (wrap in array)
  - `content` (single) → `content` (array, wrap existing value)
  - `relationType` → remove (no direct replacement)
  - `contributors` → remove (no direct replacement)
  - `locations` → remove (no direct replacement)

- [#156](https://github.com/hypercerts-org/hypercerts-lexicon/pull/156) [`86f252d`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/86f252da1f755bac6e323142a2ed11a8c6e37cba) Thanks [@holkexyz](https://github.com/holkexyz)! - Require createdAt in app.certified.actor.profile schema

- [#161](https://github.com/hypercerts-org/hypercerts-lexicon/pull/161) [`ec91289`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/ec912892497198741254a861fd9104fa7c6dc827) Thanks [@aspiers](https://github.com/aspiers)! - chore: switch to build via rollup

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

- [#125](https://github.com/hypercerts-org/hypercerts-lexicon/pull/125) [`771d142`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/771d14269ced86ea686cb6dac3414a7a283c482a) Thanks [@s-adamantine](https://github.com/s-adamantine)! - Simplify workScope to union of strongRef and string

  **Breaking Changes:**
  - The `workScope` field in `org.hypercerts.claim.activity` is now a union of:
    - `com.atproto.repo.strongRef`: A reference to a work-scope logic record for structured, nested work scope definitions
    - `org.hypercerts.claim.activity#workScopeString`: A free-form string for simple or legacy scopes
  - **Removed** from `org.hypercerts.defs`:
    - `workScopeAll` (logical AND operator)
    - `workScopeAny` (logical OR operator)
    - `workScopeNot` (logical NOT operator)
    - `workScopeAtom` (atomic scope reference)

  This simplification allows work scope complexity to be managed via referenced records while still supporting simple string-based scopes for straightforward use cases.

- [#47](https://github.com/hypercerts-org/hypercerts-lexicon/pull/47) [`6a66e4b`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/6a66e4b78ef676cc66b35773f2f9828ea697d332) Thanks [@satyam-mishra-pce](https://github.com/satyam-mishra-pce)! - Add support for multiple locations in an activity claim.

- [#103](https://github.com/hypercerts-org/hypercerts-lexicon/pull/103) [`b5d79da`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/b5d79da303ff7726c7a84b7568b18ee055ac0e81) Thanks [@s-adamantine](https://github.com/s-adamantine)! - Align all lexicons with the ATProto Lexicon Style Guide: change badge response `enum` to `knownValues`, add `maxLength`/`maxGraphemes` to unconstrained string and array fields, fix style checker to skip format-typed fields.

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

- [#118](https://github.com/hypercerts-org/hypercerts-lexicon/pull/118) [`8427780`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/8427780888759ee749a683528f49e6b0da2b97c2) Thanks [@holkexyz](https://github.com/holkexyz)! - Add location property to attachment schema

  **New Feature:**
  - **`location` field** (`org.hypercerts.claim.attachment`):
    - Added optional `location` property as a strong reference (`com.atproto.repo.strongRef`)
    - Allows attachments to associate location metadata directly without using the sidecar pattern
    - The referenced record must conform to the `app.certified.location` lexicon

  **Usage:**

  ```json
  {
    "$type": "org.hypercerts.claim.attachment",
    "subjects": [
      {
        "uri": "at://did:plc:.../org.hypercerts.claim.activity/...",
        "cid": "..."
      }
    ],
    "content": [{ "uri": "https://..." }],
    "title": "Field Report",
    "location": {
      "uri": "at://did:plc:.../app.certified.location/abc123",
      "cid": "..."
    },
    "createdAt": "..."
  }
  ```

  This change aligns with the location property addition to collections (PR #123), providing a consistent pattern for associating location metadata across record types.

- [#161](https://github.com/hypercerts-org/hypercerts-lexicon/pull/161) [`5a490bf`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/5a490bf4404f6690fe832f82023ea05663050977) Thanks [@aspiers](https://github.com/aspiers)! - Add basic test suite using vitest 4.

- [#77](https://github.com/hypercerts-org/hypercerts-lexicon/pull/77) [`0d61ff7`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/0d61ff7e030a25682cd71877ae603b8782b09c3b) Thanks [@bitbeckers](https://github.com/bitbeckers)! - Document ATProto sidecar pattern for collections using app.certified.location. Collections can now have location metadata by creating a location record with the same TID, allowing location updates without changing the collection CID. Updated README with usage example and ERD with sidecar relationship.

- [#161](https://github.com/hypercerts-org/hypercerts-lexicon/pull/161) [`ece7629`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/ece7629956d6efbfed757d66609fe4ccc1c81d5a) Thanks [@aspiers](https://github.com/aspiers)! - Include CHANGELOG.md in package distribution for better user documentation.

- [#74](https://github.com/hypercerts-org/hypercerts-lexicon/pull/74) [`f845f92`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/f845f924907f62c8b96afa6a18ac203c4bd4cad5) Thanks [@aspiers](https://github.com/aspiers)! - Make startDate and endDate optional in activity lexicon

- [#161](https://github.com/hypercerts-org/hypercerts-lexicon/pull/161) [`913eb06`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/913eb06bcec519552f45f5d9797579ce99be1635) Thanks [@aspiers](https://github.com/aspiers)! - Switch from bundled to individual type declaration files

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

## 0.10.0-beta.16

### Minor Changes

- [#141](https://github.com/hypercerts-org/hypercerts-lexicon/pull/141) [`06fb6b5`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/06fb6b54542fe6311d55cb26a1c468c1374b0ab1) Thanks [@holkexyz](https://github.com/holkexyz)! - Add CEL expression support for structured work scopes (`org.hypercerts.workscope.cel`, `org.hypercerts.workscope.tag`)

- [#149](https://github.com/hypercerts-org/hypercerts-lexicon/pull/149) [`9f124eb`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/9f124eb404e30a30ac90a6c4be934ece84556c08) Thanks [@daviddao](https://github.com/daviddao)! - Add `org.hyperboards.board` and `org.hyperboards.displayProfile` lexicons for hyperboard visual presentation records.

- [#140](https://github.com/hypercerts-org/hypercerts-lexicon/pull/140) [`20eb414`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/20eb414bd75cb100bebe16cfb41286377c18d5e7) Thanks [@holkexyz](https://github.com/holkexyz)! - Add app.certified.actor.organization sidecar record for organization actor profiles with fields for organization type, labeled URLs, location (strongRef), and founded date

- [#144](https://github.com/hypercerts-org/hypercerts-lexicon/pull/144) [`fb90134`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/fb90134e5df32e955e5f9fba748f4ca46d00e90e) Thanks [@holkexyz](https://github.com/holkexyz)! - Make items optional in collection schema to allow creating empty collections

- [#151](https://github.com/hypercerts-org/hypercerts-lexicon/pull/151) [`4d5f42f`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/4d5f42fa4f9ae2c74a6703f3af50e9acfd09ae95) Thanks [@holkexyz](https://github.com/holkexyz)! - Add optional `url` field to `app.certified.badge.award` for linking to an external page associated with the badge

- [#152](https://github.com/hypercerts-org/hypercerts-lexicon/pull/152) [`2afb6ed`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/2afb6edb89ffd186f2e0cf015bcc3557e13a7a6d) Thanks [@holkexyz](https://github.com/holkexyz)! - Use Leaflet linear documents for rich-text descriptions in activity and attachment lexicons, and make attachment content optional.

- [#153](https://github.com/hypercerts-org/hypercerts-lexicon/pull/153) [`57dc44c`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/57dc44c163a6d62e4256e3de41ccf14617eb07e8) Thanks [@holkexyz](https://github.com/holkexyz)! - Improve acknowledgement schema: move to org.hypercerts.context.acknowledgement, generalize descriptions, make context optional, add maxGraphemes to comment.

- [#158](https://github.com/hypercerts-org/hypercerts-lexicon/pull/158) [`7743aa6`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/7743aa6014faa35714d3e146cfa45b0e67501992) Thanks [@holkexyz](https://github.com/holkexyz)! - Move collection lexicon from `org.hypercerts.claim.collection` to `org.hypercerts.collection` to reflect that collections can contain more than just claims.

- [#154](https://github.com/hypercerts-org/hypercerts-lexicon/pull/154) [`4c52b2c`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/4c52b2c9b2d449cbeb74eea9efa0a9eb2a0a39b7) Thanks [@holkexyz](https://github.com/holkexyz)! - Move evaluation and attachment lexicons to org.hypercerts.context namespace.

- [#155](https://github.com/hypercerts-org/hypercerts-lexicon/pull/155) [`a59e541`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/a59e5418e242a2f6b2868cc46f5481d75a7bf0ca) Thanks [@holkexyz](https://github.com/holkexyz)! - Rename contributionDetails to contribution (org.hypercerts.claim.contribution).

- [#156](https://github.com/hypercerts-org/hypercerts-lexicon/pull/156) [`86f252d`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/86f252da1f755bac6e323142a2ed11a8c6e37cba) Thanks [@holkexyz](https://github.com/holkexyz)! - Require createdAt in app.certified.actor.profile schema

- [#103](https://github.com/hypercerts-org/hypercerts-lexicon/pull/103) [`b5d79da`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/b5d79da303ff7726c7a84b7568b18ee055ac0e81) Thanks [@s-adamantine](https://github.com/s-adamantine)! - Align all lexicons with the ATProto Lexicon Style Guide: change badge response `enum` to `knownValues`, add `maxLength`/`maxGraphemes` to unconstrained string and array fields, fix style checker to skip format-typed fields.

## 0.10.0-beta.15

### Minor Changes

- [#76](https://github.com/hypercerts-org/hypercerts-lexicon/pull/76) [`3044e22`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/3044e22c1345b3cd5764e3c6c3714b21e6911663) Thanks [@s-adamantine](https://github.com/s-adamantine)! - Add org.hypercerts.acknowledgement lexicon for bidirectional inclusion links between records across PDS repos

- [#136](https://github.com/hypercerts-org/hypercerts-lexicon/pull/136) [`062fbde`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/062fbde905dbd939f75c366760be1c02bb8a0412) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Expand locationType knownValues to include geojson, h3, geohash, wkt, address, and scaledCoordinates from the [Location Protocol spec](https://spec.decentralizedgeo.org/specification/location-types/#location-type-registry)

## 0.10.0-beta.14

### Minor Changes

- [#133](https://github.com/hypercerts-org/hypercerts-lexicon/pull/133) [`6752cad`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/6752cad3c9e58b9a8e1a3ca17f2ea7a4a68dba81) Thanks [@Kzoeps](https://github.com/Kzoeps)! - Add profile lexicon for Hypercert account profiles with support for display name, description, pronouns, website, avatar, banner.

- [#132](https://github.com/hypercerts-org/hypercerts-lexicon/pull/132) [`da481e0`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/da481e09f5bd1a8e62e388f2c6001896d76b1fbf) Thanks [@aspiers](https://github.com/aspiers)! - Convert app.certified.defs#did to object type

  The did definition in app.certified.defs has been converted from a primitive
  string type to an object type to comply with the ATProto specification
  requirement that all union variants must be object or record types.

  This change was necessary because app.certified.badge.award uses this
  definition in a union for the subject property.

  Breaking changes:
  - `app.certified.defs#did`: Now an object with `did` string property (maxLength 256)
  - Code using this type must now access the `.did` property instead of using the value directly

- [#132](https://github.com/hypercerts-org/hypercerts-lexicon/pull/132) [`e134b26`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/e134b26c43a70c0a9ae04cc12b8a3bd05990c470) Thanks [@aspiers](https://github.com/aspiers)! - Convert union string definitions to object types in activity lexicon

  The contributorIdentity, contributorRole, and workScopeString definitions
  in org.hypercerts.claim.activity have been converted from primitive string
  types to object types to comply with the ATProto specification requirement
  that all union variants must be object or record types.

  Additionally, maximum length constraints have been reduced to more reasonable
  values:
  - `contributorIdentity.identity`: maxLength 1000, maxGraphemes 100 (previously no limits)
  - `contributorRole.role`: maxLength 1000, maxGraphemes 100 (previously maxLength 10000, maxGraphemes 1000)
  - `workScopeString.scope`: maxLength 1000, maxGraphemes 100 (previously maxLength 10000, maxGraphemes 1000)

  Breaking changes:
  - `contributorIdentity`: Now an object with `identity` string property
  - `contributorRole`: Now an object with `role` string property
  - `workScopeString`: Now an object with `scope` string property
  - Reduced maximum lengths may affect existing records with longer values

  This requires updating code that uses these union types to access the nested
  property instead of using the value directly.

- [#135](https://github.com/hypercerts-org/hypercerts-lexicon/pull/135) [`806cfbc`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/806cfbca7cbcd3674a5f8e97a6b6dd87ba806c08) Thanks [@Kzoeps](https://github.com/Kzoeps)! - Move profile lexicon from app.certified.profile to app.certified.actor.profile namespace, requiring migration of existing profile records

## 0.10.0-beta.13

### Minor Changes

- [#131](https://github.com/hypercerts-org/hypercerts-lexicon/pull/131) [`7f42fad`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/7f42fad517e191dad6db22fc67ec8346ec167f5c) Thanks [@aspiers](https://github.com/aspiers)! - Add inline string format to app.certified.location schema with documentation and examples

- [#118](https://github.com/hypercerts-org/hypercerts-lexicon/pull/118) [`8427780`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/8427780888759ee749a683528f49e6b0da2b97c2) Thanks [@holkexyz](https://github.com/holkexyz)! - Rename evidence lexicon to attachment and refactor schema structure

  **Breaking Changes:**
  - **Lexicon ID change:**
    - `org.hypercerts.claim.evidence` → `org.hypercerts.claim.attachment`
    - All existing evidence records must be migrated to use the new lexicon ID
  - **Schema structure changes (`org.hypercerts.claim.attachment`):**
    - Changed `subject` (single strongRef) to `subjects` (array of strongRefs, maxLength: 100)
    - Changed `content` from single union (uri/blob) to array of unions (maxLength: 100)
    - Added `contentType` field (string, maxLength: 64) to specify attachment type
    - Removed `relationType` field (previously used to indicate supports/challenges/clarifies)
    - Removed `contributors` field
    - Removed `locations` field
    - Added rich text support: `shortDescriptionFacets` and `descriptionFacets` (arrays of `app.bsky.richtext.facet`)
    - Updated required fields: `["title", "content", "createdAt"]` (content is now required)
  - **Common definitions (`org.hypercerts.defs`):**
    - Added `weightedContributor` def for contributor references with optional weights
    - Added `contributorIdentity` def for string-based contributor identification

  **Migration:**

  **Lexicon ID:** Update all references from `org.hypercerts.claim.evidence` to `org.hypercerts.claim.attachment`.

  **Schema migration:**

  ```json
  // Before (org.hypercerts.claim.evidence)
  {
    "$type": "org.hypercerts.claim.evidence",
    "subject": { "uri": "...", "cid": "..." },
    "content": { "uri": "https://..." },
    "title": "Evidence Title",
    "relationType": "supports",
    "createdAt": "..."
  }

  // After (org.hypercerts.claim.attachment)
  {
    "$type": "org.hypercerts.claim.attachment",
    "subjects": [{ "uri": "...", "cid": "..." }],
    "content": [{ "uri": "https://..." }],
    "contentType": "evidence",
    "title": "Evidence Title",
    "createdAt": "..."
  }
  ```

  **Field mapping:**
  - `subject` → `subjects` (wrap in array)
  - `content` (single) → `content` (array, wrap existing value)
  - `relationType` → remove (no direct replacement)
  - `contributors` → remove (no direct replacement)
  - `locations` → remove (no direct replacement)

### Patch Changes

- [#118](https://github.com/hypercerts-org/hypercerts-lexicon/pull/118) [`8427780`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/8427780888759ee749a683528f49e6b0da2b97c2) Thanks [@holkexyz](https://github.com/holkexyz)! - Add location property to attachment schema

  **New Feature:**
  - **`location` field** (`org.hypercerts.claim.attachment`):
    - Added optional `location` property as a strong reference (`com.atproto.repo.strongRef`)
    - Allows attachments to associate location metadata directly without using the sidecar pattern
    - The referenced record must conform to the `app.certified.location` lexicon

  **Usage:**

  ```json
  {
    "$type": "org.hypercerts.claim.attachment",
    "subjects": [
      {
        "uri": "at://did:plc:.../org.hypercerts.claim.activity/...",
        "cid": "..."
      }
    ],
    "content": [{ "uri": "https://..." }],
    "title": "Field Report",
    "location": {
      "uri": "at://did:plc:.../app.certified.location/abc123",
      "cid": "..."
    },
    "createdAt": "..."
  }
  ```

  This change aligns with the location property addition to collections (PR #123), providing a consistent pattern for associating location metadata across record types.

## 0.10.0-beta.12

### Minor Changes

- [#120](https://github.com/hypercerts-org/hypercerts-lexicon/pull/120) [`b2f7b68`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/b2f7b683ac17f07a891a59ee8289d26717197ba3) Thanks [@holkexyz](https://github.com/holkexyz)! - Refactor measurement lexicon schema: add unit field, date ranges, and locations array

  **Breaking Changes:**
  - **Measurement lexicon (`org.hypercerts.claim.measurement`):**
    - Changed required fields: removed `measurers` from required, added `unit` as required
    - Added `unit` field (required, string, maxLength: 50): The unit of the measured value (e.g. kg CO₂e, hectares, %, index score)
    - Added `startDate` field (optional, datetime): The start date and time when the measurement began
    - Added `endDate` field (optional, datetime): The end date and time when the measurement ended
    - Changed `location` (single strongRef) to `locations` (array of strongRefs, maxLength: 100)
    - Moved `measurers` from required to optional field
    - Added `comment` field (optional, string): Short comment suitable for previews and list views
    - Added `commentFacets` field (optional, array): Rich text annotations for `comment` (mentions, URLs, hashtags, etc.)
    - Updated field descriptions for `metric` and `value` with more detailed examples

  **Migration:**

  **Required fields:** Update measurement records to include the new required `unit` field:

  ```json
  // Before
  {
    "$type": "org.hypercerts.claim.measurement",
    "measurers": [...],
    "metric": "CO₂ sequestered",
    "value": "1000",
    "createdAt": "..."
  }

  // After
  {
    "$type": "org.hypercerts.claim.measurement",
    "metric": "CO₂ sequestered",
    "unit": "kg CO₂e",
    "value": "1000",
    "measurers": [...],  // Now optional
    "createdAt": "..."
  }
  ```

  **Location field:** Convert from single location to locations array:

  ```json
  // Before
  {
    "location": { "uri": "...", "cid": "..." }
  }

  // After
  {
    "locations": [{ "uri": "...", "cid": "..." }]
  }
  ```

  **Date ranges:** Optionally add `startDate` and `endDate` to specify when measurements were taken.

- [#125](https://github.com/hypercerts-org/hypercerts-lexicon/pull/125) [`771d142`](https://github.com/hypercerts-org/hypercerts-lexicon/commit/771d14269ced86ea686cb6dac3414a7a283c482a) Thanks [@s-adamantine](https://github.com/s-adamantine)! - Simplify workScope to union of strongRef and string

  **Breaking Changes:**
  - The `workScope` field in `org.hypercerts.claim.activity` is now a union of:
    - `com.atproto.repo.strongRef`: A reference to a work-scope logic record for structured, nested work scope definitions
    - `org.hypercerts.claim.activity#workScopeString`: A free-form string for simple or legacy scopes
  - **Removed** from `org.hypercerts.defs`:
    - `workScopeAll` (logical AND operator)
    - `workScopeAny` (logical OR operator)
    - `workScopeNot` (logical NOT operator)
    - `workScopeAtom` (atomic scope reference)

  This simplification allows work scope complexity to be managed via referenced records while still supporting simple string-based scopes for straightforward use cases.

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
