---
"@hypercerts-org/lexicon": minor
---

Update `org.hypercerts.claim.contributor` lexicon to support individual contributor profiles and roles.

Breaking Changes:

- Removed `contributors` array.
- Added `identifier`, `displayName`, and `image` fields for individual profiles.
- Renamed `description` to `contributionDescription`.
- Updated `required` fields to only include `createdAt`.

Also corrected incorrect references to `org.hypercerts.claim.contribution` across the codebase to use the correct ID `org.hypercerts.claim.contributor`.
