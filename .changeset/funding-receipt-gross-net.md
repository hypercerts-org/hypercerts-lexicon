---
"@hypercerts-org/lexicon": minor
---

Funding receipt: define `amount` as the gross the sender paid and add optional `netAmount` / `netCurrency` for what the recipient received; give `paymentRail` an open `knownValues` vocabulary; define `paymentNetwork` as where `transactionId` can be looked up (CAIP-2 chain ID for onchain payments) and raise its `maxLength` to 64; add privacy guidance to `transactionId`; and state how to record payments that pass through platforms, hosts, or regrantors. All additions are optional, so existing receipts remain valid.
