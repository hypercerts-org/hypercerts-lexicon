---
"@hypercerts-org/lexicon": minor
---

Updated `org.hypercerts.claim.collection` lexicon:

- Added optional `type` field to specify collection type (e.g., 'favorites', 'project')
- Renamed fields for consistency:
  - `collectionTitle` → `title`
  - `shortCollectionDescription` → `shortDescription`
  - `collectionDescription` → `description`
- Changed `description` from string to Leaflet linear document reference (`pub.leaflet.pages.linearDocument#main`) to support rich-text descriptions

**Breaking changes**:

- Field names have been renamed (e.g., `collectionTitle` → `title`)
- The `description` field now expects a reference object instead of a plain string
