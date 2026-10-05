---
"@hypercerts-org/lexicon": minor
---

Add `legalName`, `logo`, `publicEmail`, and `additionalLocations` to `app.certified.actor.organization`, so partner directories can publish an enterprise's registered name, full logo (wordmark or combination mark), public contact email, and every location it operates from. All four are optional, so existing records stay valid.

Clarify field descriptions to say where each piece of organization data belongs: the square brandmark goes in `app.certified.actor.profile` `avatar` and the full logo in `organization.logo`; the public-facing name in `profile.displayName` and the legal name in `organization.legalName`; the main website in `profile.website` rather than `urls`; and the primary location in `location` (the one point shown on a map), with further locations in `additionalLocations`. The `location` description now notes that a strong reference pins a version, so it must be updated when the location record is edited.
