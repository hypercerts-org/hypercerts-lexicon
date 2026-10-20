---
"@hypercerts-org/lexicon": minor
---

Attachment: state that an `org.hypercerts.context.attachment` with no `subjects` is a standalone update by its author (a personal or organization post not about any particular project), and that project updates are the same record with `subjects` set; add `update` to the `contentType` known values for narrative updates; and say not to point a standalone update at the author's own profile. No schema shape changes: `subjects` was already optional, so every existing record remains valid. Resolves the standalone-post question without a new post lexicon.
