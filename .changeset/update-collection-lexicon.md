---
"@hypercerts-org/lexicon": minor
---

Updated `org.hypercerts.claim.collection` lexicon:

- Added optional `type` field to specify collection type (e.g., 'favorites', 'project')
- Changed `collectionDescription` from string to Leaflet linear document reference (`pub.leaflet.pages.linearDocument#main`) to support rich-text descriptions

**Breaking change**: The `collectionDescription` field now expects a reference object instead of a plain string.
