---
"@hypercerts-org/lexicon": minor
---

Refactor measurement lexicon schema: add unit field, date ranges, and locations array

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
