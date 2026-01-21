---
"@hypercerts-org/lexicon": patch
---

Improve lexicon style guide compliance

- Changed `enum` to `knownValues` in `badge/response.json` for schema evolution compliance
- Added `maxLength` constraints to string fields without format:
  - `badge/definition.json`: badgeType (100), title (256), description (1000)
  - `badge/award.json`: note (500)
  - `badge/response.json`: weight (50)
  - `rights.json`: rightsDescription (5000 bytes, 1000 graphemes)
  - `funding/receipt.json`: to (256), amount (50), currency (10), paymentRail (50), paymentNetwork (50), transactionId (256)
- Changed `maxGraphemes` to `maxLength` for URI definition in `defs.json`
