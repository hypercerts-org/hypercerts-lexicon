---
"@hypercerts-org/lexicon": minor
---

Refactor collection lexicon to use items array instead of activities. The items array contains plain strongRefs (com.atproto.repo.strongRef) that can reference activities (org.hypercerts.claim.activity) and/or other collections (org.hypercerts.claim.collection), enabling recursive collection nesting. This change removes the activityWeight object structure from the base collection lexicon.
