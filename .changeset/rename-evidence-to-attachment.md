---
"@hypercerts-org/lexicon": minor
---

Rename evidence lexicon to attachment and refactor schema structure

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
