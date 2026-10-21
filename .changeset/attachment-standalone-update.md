---
"@hypercerts-org/lexicon": minor
---

Attachment: state that a standalone update by its author (a personal or organization post not about any particular project) is an `org.hypercerts.context.attachment` whose `subjects` point at the author's own `app.certified.actor.profile`, for people and organizations alike, and that project updates are the same record with `subjects` pointing at the project; add `update` to the `contentType` known values for narrative updates; and say to match a profile subject by `uri`, since profiles are edited. No schema shape changes: every existing record remains valid. Resolves the standalone-post question without a new post lexicon.
