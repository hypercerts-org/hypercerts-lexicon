---
"@hypercerts-org/lexicon": minor
---

Add `org.hypercerts.entity.feature`, a subject record for non-agent things that claims describe (for example land zones and ecological strata). A feature carries identity (`title`, coarse advisory `type`), governed classification (`tags` referencing `org.hypercerts.vocab.tag`), optional spatial representations (`locations` referencing `app.certified.location` — multiple entries are representations of one subject, never different places), and exact entity concordance (`sameAs`). Collection `itemIdentifier` documentation now names features as valid items, and `org.hypercerts.authWrite` grants access to the new collection. Activity claims are unchanged and continue to reference location records directly.
