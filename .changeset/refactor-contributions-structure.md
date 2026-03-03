---
"@hypercerts-org/lexicon": minor
---

Refactor contributions structure in activity lexicon

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
