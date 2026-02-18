---
"@hypercerts-org/lexicon": minor
---

Convert app.certified.defs#did to object type

The did definition in app.certified.defs has been converted from a primitive
string type to an object type to comply with the ATProto specification
requirement that all union variants must be object or record types.

This change was necessary because app.certified.badge.award uses this
definition in a union for the subject property.

Breaking changes:

- `app.certified.defs#did`: Now an object with `did` string property (maxLength 256)
- Code using this type must now access the `.did` property instead of using the value directly
