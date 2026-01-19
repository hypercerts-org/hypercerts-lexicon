---
"@hypercerts-org/lexicon": minor
---

Remove bidirectional project-activity link. Activities no longer include a `project` field reference. Projects continue to reference activities via the `activities` array, making the relationship unidirectional (project → activities only).
