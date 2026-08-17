---
"@hypercerts-org/lexicon": minor
---

Add `org.hypercerts.tag`, a general governed vocabulary record (category, lifecycle `status`/`supersededBy`, aliases, exact-match `sameAs` links to external vocabularies), and an optional `tags` array on `org.hypercerts.collection` referencing those terms. Collection tags are plain conjunctive facts (logical AND) with permanently fixed semantics — any future expression logic must arrive as a new field. `org.hypercerts.workscope.tag` and `org.hypercerts.workscope.cel` are unchanged.
