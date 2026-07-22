---
"@hypercerts-org/lexicon": minor
---

Add `app.certified.graph.entityFollow`, a follow record for non-account entities. `subject` is an open union currently offering only `#recordSubject` (a record referenced by AT-URI without a CID, so the follow survives updates to the referenced record); account follows remain in `app.certified.graph.follow`.
