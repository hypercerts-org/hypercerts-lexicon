---
"@hypercerts-org/lexicon": minor
---

Add explicit crypto-vs-fiat classification to `org.hypercerts.funding.receipt`: a new optional `paymentType` field plus `knownValues` on `paymentRail`.

**Non-breaking:** the new field is optional and `knownValues` is advisory — existing receipts remain valid.

- New `paymentType` string with `knownValues: ["crypto", "fiat"]` — the explicit asset-class discriminator. Consumers classify by this field and treat receipts without it (or with an unrecognized value) as unclassified, never silently as fiat. The `amount`/`currency` pair cannot substitute: receipts often record normalized fiat-equivalent amounts for crypto payments, and stablecoins carry fiat-pegged currencies.
- `paymentType` is orthogonal to `paymentRail` (the transfer mechanism): a card-funded crypto purchase is `paymentType: "crypto"` + `paymentRail: "credit_card"`.
- `paymentRail` now declares `knownValues: ["onchain", "payment_processor", "bank_transfer", "credit_card", "cash", "check"]` (previously prose-only examples), giving form UIs a canonical vocabulary instead of free-text input.
- `paymentNetwork`'s description now distinguishes its two uses (chain for `onchain`, processor/scheme for fiat rails) and strongly recommends it for `onchain` payments, since a transaction hash is not interpretable without knowing its chain.

Motivated by downstream integration work (Ma Earth publishing receipts for both fiat and crypto donations): platforms need consumers to split crypto from fiat deterministically, and free-string rails forced every consumer to invent its own heuristic.
