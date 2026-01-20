---
"@hypercerts-org/lexicon": minor
---

Remove org.hypercerts.claim.project lexicon and replace with org.hypercerts.claim.collection.project sidecar. Projects are now represented as collections with an optional project sidecar (same TID) that provides rich-text descriptions, avatars, and cover photos. Avatar and coverPhoto fields moved from base collection to project sidecar. Collections without the project sidecar are simple groupings; collections with it are "projects" with rich documentation.
