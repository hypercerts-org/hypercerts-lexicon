---
"@hypercerts-org/lexicon": minor
---

Add `app.certified.graph.entityFollow` lexicon — a follow record that targets a **record** rather than an **account**.

It is structurally identical to `app.certified.graph.follow` (same `key: tid`, same `createdAt`, optional `via` strongRef, and optional `signatures` fields). The only difference is `subject`, which is a `string` with `format: at-uri` referencing the record being followed, instead of a `string` with `format: did` identifying an account. This lets clients express "follow this activity/claim/collection" alongside the existing "follow this account" relationship, without overloading the meaning of `app.certified.graph.follow`.

Because `subject` is an unconstrained `at-uri`, an entity follow may reference a record in any collection — including one governed by a lexicon outside this repository. Consumers should resolve the referenced record before assuming a particular shape, and treat the collection portion of the URI as untrusted input.

The new NSID is added to the `app.certified.authWrite` permission set, so apps already requesting `include:app.certified.authWrite` gain create/update/delete on the new collection when the updated set is published. Note that this widens the effective grant of an already-consented set; see `docs/design/permission-sets.md` for the set-growth semantics.

Exports new `GRAPH_ENTITY_FOLLOW_NSID`, `GRAPH_ENTITY_FOLLOW_LEXICON_JSON`, `GRAPH_ENTITY_FOLLOW_LEXICON_DOC`, and the `AppCertifiedGraphEntityFollow` type namespace.
