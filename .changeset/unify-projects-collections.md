---
"@hypercerts-org/lexicon": minor
---

Unify project and collection schemas into a single
`org.hypercerts.claim.collection` lexicon with `type` discriminator
field to allow collections to be designated as projects. Custom
strings are also allowed in `type`.

Also make `shortDescription` field optional in
`org.hypercerts.claim.collection` to match
`org.hypercerts.claim.project`.

This unification removes `org.hypercerts.claim.project`, so existing
projects should be migrated to collections with `type` set to
`project`.
