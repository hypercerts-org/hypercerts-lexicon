---
"@hypercerts-org/lexicon": minor
---

Widen description fields on activity, collection, and attachment from a bare Leaflet ref to a union of inline descriptionString and Leaflet linearDocument, with a shared def in org.hypercerts.defs.

This is technically a breaking schema change (ref → union), but not breaking for most published records, as they already include a `$type` discriminator on the description object, so existing data validates against the union without modification.
