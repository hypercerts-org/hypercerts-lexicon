---
"@hypercerts-org/lexicon": minor
---

Funding receipt: reconciliation and completeness fields — `fx`, `fees`/`netAmount`, `refundOf`, `via`, `settledAt` — plus `transactionId` privacy guidance.

**Non-breaking:** all new fields are optional; existing receipts remain valid.

Informed by the payment models of Stripe (BalanceTransaction gross/fee/net, available_on), Wise (source/target amounts, rate), PayPal (gross/fee/net, platform_fees) and ISO 20022 pacs.008 (instructed vs settlement amount, settlement date, intermediary agents):

- **`fx`** (new `#fxInfo` object: required `originalAmount`/`originalCurrency`, optional `rate`/`rateSource`/`rateTimestamp`) stamps the payment's original denomination and conversion rate at payment time, so receipts for one payment written by different parties in different currencies reconcile deterministically instead of re-deriving rates that drift.
- **`fees`** (array of new `#fee`: `type` with knownValues [processor, platform, network, fx, tax, other], `label`, required `amount`) and **`netAmount`** record the universal gross/fee/net triple: `amount` stays the gross the sender paid, `netAmount` is what the recipient actually received. Without them, a sender's "$100" and a recipient's "$96.80" receipt for the same payment can never reconcile or cluster. No charge-bearer field: a receipt is retrospective, the amounts already encode who bore what.
- **`refundOf`** (strongRef) marks a receipt as a partial or whole refund of the referenced receipt. Receipts are immutable once attested, so refunds are new receipts, never edits; copying the original's `fx` computes partial refunds at the original rate without forex drift; multiple partial refunds are multiple receipts, netted by consumers.
- **`via`** (same party union as `from`/`to`) names the intermediary that facilitated the payment (funding platform, payment servicer, broker) in the record itself, rather than leaving it implied by receipt authorship.
- **`settledAt`** records when funds actually settled to the recipient — may differ from `occurredAt` by days on delayed rails such as bank transfers.
- **`transactionId`** description now carries privacy guidance for public repositories: prefer opaque processor IDs or internal references, avoid bank references embedding account details, and note an onchain transaction hash publicly reveals the sending wallet — significant when `from` was omitted for sender anonymity.
