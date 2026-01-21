---
"@hypercerts-org/lexicon": minor
---

Refactor contributions structure and split contributor lexicon

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
