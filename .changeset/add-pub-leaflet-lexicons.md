---
"@hypercerts-org/lexicon": minor
---

Vendor pub.leaflet and app.bsky.richtext.facet lexicon JSONs to enable runtime validation of records with description and facet fields. Previously, these external schemas were only shimmed at the TypeScript type level via @atcute packages, causing LexiconDefNotFoundError at runtime when validating records that populated optional description or facet fields. Removes the now-unnecessary create-shims.sh script and @atcute/leaflet + @atcute/bluesky dependencies.
