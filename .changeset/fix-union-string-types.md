---
"@hypercerts-org/lexicon": minor
---

Convert union string definitions to object types in activity lexicon

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
