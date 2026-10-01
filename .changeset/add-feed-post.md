---
"@hypercerts-org/lexicon": minor
---

Add `app.certified.feed.post`, a standalone post record for certified feeds: optional `text` (up to 5000 graphemes) with `facets`, an optional `reply` that threads it under another post, an optional `embed` (images, video, gallery, external link card, quoted record, or quoted record with media), `langs`, self-`labels`, `tags`, `attachments`, and `signatures`. Fields shared with `app.bsky.feed.post` use the same types, so an app can also post on Bluesky by writing a second record. Add it to the `app.certified.authWrite` permission set.

Vendor `app.bsky.embed.{defs,images,video,gallery,external,record,recordWithMedia}` and `com.atproto.label.defs` so these refs resolve for codegen and runtime validation. `external`, `record`, and `recordWithMedia` keep only their record-side defs; their AppView `view*` defs are omitted.
