---
"@hypercerts-org/lexicon": minor
---

Refactor measurement lexicon schema: convert subject to subjects array, add unit field, date ranges, and locations array

**Breaking Changes:**

- **Measurement lexicon (`org.hypercerts.claim.measurement`):**
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
