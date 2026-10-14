---
"@hypercerts-org/lexicon": minor
---

Funding receipt: define `amount` as the gross the sender paid and make `amount` and `currency` optional, so a receipt can omit them when only the received amount is known; add optional `netAmount` / `netCurrency` for what the recipient received; give `paymentRail` an open `knownValues` vocabulary; define `paymentNetwork` as where `transactionId` can be looked up (CAIP-2 chain ID for onchain payments); add privacy guidance to `transactionId`; and state how to record payments that pass through platforms, hosts, or regrantors. Existing receipts remain valid. Readers can no longer assume `amount` or `currency` is present: the generated types are now `amount?: string` and `currency?: string`.
