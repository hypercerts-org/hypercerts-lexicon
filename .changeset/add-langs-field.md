---
"@hypercerts-org/lexicon": minor
---

Add an optional `langs` field, an array of up to three BCP-47 language tags, to `org.hypercerts.collection`, `org.hypercerts.claim.activity`, `org.hypercerts.context.attachment`, `org.hypercerts.entity.feature`, `app.certified.actor.profile` and `app.certified.actor.organization`, declaring the language(s) the record's text was written in. Same shape as Bluesky's `app.bsky.feed.post` `langs`. Writing apps set it from the text the author wrote, with the author able to correct it, never from the interface language or a profile preference alone. Readers treat it as a hint, not a guarantee, and must not hide a record because it lacks the field. Existing records remain valid.
