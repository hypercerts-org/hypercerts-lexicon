---
"@hypercerts-org/lexicon": minor
---

This release represents the migration of the lexicon package from the SDK monorepo (`hypercerts-sdk/packages/lexicon`) to a dedicated standalone repository (`hypercerts-lexicon`). This separation allows for independent versioning and development of the lexicon definitions.

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
