---
"@hypercerts-org/lexicon": minor
---

Add optional `validFrom` and `validUntil` to `app.certified.badge.award`, so an award can state when it starts and stops applying: a certification granted before it was recorded, or a verification that lapses. Names follow W3C Verifiable Credentials 2.0 and Open Badges 3.0. Expiry is distinct from revocation, which remains deleting the award record.
