---
"@hypercerts-org/lexicon": minor
---

Add fraction event and order listing lexicons for hypercert fractional sales

Introduces three new lexicons:

- `org.hypercerts.fraction.transferEvent` — an immutable event record representing a peer-to-peer transfer of a fraction of an activity claim, including a full cryptographic proof (`signedAt`, `nonce`, `chainId`, `signerEVMAddress`, `signature`)
- `org.hypercerts.fraction.saleEvent` — an immutable event record representing the purchase of a fraction of an activity claim, referencing an `org.hypercerts.funding.receipt` AT-URI as proof of the transaction
- `org.hypercerts.order.listing` — a mutable listing record for the sale of fractions of an activity claim, keyed by the activity claim's rkey to enforce one listing per claim; includes `goalInUSD`, `currency`, `allowOversell`, and `status` fields
