---
"@hypercerts-org/lexicon": minor
---

Convert union string variants to object types to comply with ATProto specification. The `workScopeString`, `contributorIdentity`, and `contributorRole` types in `org.hypercerts.claim.activity` are now objects with a `value` property instead of raw strings. This breaking change ensures all union variants are properly typed objects that can include the required `$type` discriminator field per the ATProto spec.
