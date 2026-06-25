---
"@hypercerts-org/lexicon": minor
---

Add `app.certified.actor.createdVia` record lexicon for lightweight account provenance.

The record carries a required `clientId` property holding the OAuth `client_id` URL (the client metadata document URL) that uniquely identifies the application which created the Certified account. This lets consumers distinguish records originating from, for example, test or staging environments from real ones, without requiring cryptographic platform attestations.

Like other Certified records, it includes an optional `signatures` array (`app.certified.signature.defs#list`) so the provenance marker can itself be attested.
