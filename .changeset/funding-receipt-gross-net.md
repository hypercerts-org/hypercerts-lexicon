---
"@hypercerts-org/lexicon": minor
---

Funding receipt: define `amount` as the gross the sender paid and make it optional, so a receipt can omit it when only the received amount is known; add optional `netAmount` / `netCurrency` for what the recipient received; give `paymentRail` an open `knownValues` vocabulary; define `paymentNetwork` as where `transactionId` can be looked up (CAIP-2 chain ID for onchain payments); add privacy guidance to `transactionId`; and state how to record payments that pass through platforms, hosts, or regrantors. Existing receipts remain valid. Readers can no longer assume `amount` is present: the generated type is now `amount?: string`.
