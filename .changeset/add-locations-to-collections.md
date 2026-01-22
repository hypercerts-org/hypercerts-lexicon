---
"@hypercerts-org/lexicon": minor
---

Add `location` property to collections. Collections can now reference a location record directly via strongRef. This replaces the sidecar pattern which was impractical since location records cannot be reused across multiple collections.
