---
"@hypercerts-org/lexicon": minor
---

Add `app.certified.signature.defs#createdVia`, an inline signature by the application that wrote this version of a record, and fix the documented signing procedure. `$sig` is the signature entry without its `signature` bytes, plus the DID of the repository that holds the record, so it includes `key`. Signatures built from the previous README example do not verify under the ATProtocol Attestation Specification. Remote proof CIDs likewise use the proof record without `cid` as `$sig`.
