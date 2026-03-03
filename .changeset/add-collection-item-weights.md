---
"@hypercerts-org/lexicon": minor
---

Refactor collection items structure to support optional weights and remove activityWeight from activity schema

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
