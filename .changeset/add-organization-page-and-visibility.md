---
"@hypercerts-org/lexicon": minor
---

Add optional `longDescription` and `visibility` fields to `app.certified.actor.organization` lexicon. `longDescription` uses the description union pattern — an inline string for plain text or markdown, an embedded Leaflet linear document for rich-text content, or a strong reference to an existing description record — matching the pattern used on activity, collection, and attachment.
