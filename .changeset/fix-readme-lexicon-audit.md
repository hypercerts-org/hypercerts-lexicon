---
"@hypercerts-org/lexicon": patch
---

Fix incorrect NSID reference in `org.hyperboards.board` subject field description (`org.hypercerts.claim.collection` → `org.hypercerts.collection`).

Documentation fixes in `README.md` and `SCHEMAS.md`:

- Correct `validate()` call signature examples (parameter order and result shape)
- Fix relationship diagram arrow directions and missing entries (`link/evm`, `CERTIFIED` section)
- Fix contributor field name (`avatar` → `image`)
- Fix context target descriptions (generalized to `any record` since subjects use generic `strongRef`)
- Add missing `$type` discriminators to union member examples
