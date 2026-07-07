---
"@hypercerts-org/lexicon": minor
---

Funding receipt: add `fx` (foreign-exchange context) and `refundOf` (immutable refund representation), plus `transactionId` privacy guidance.

**Non-breaking:** both new fields are optional; existing receipts remain valid.

- **`fx`** (new `#fxInfo` object: required `originalAmount`/`originalCurrency`, optional `rate`/`rateSource`/`rateTimestamp`) stamps the payment's original denomination and conversion rate at payment time. Without it, receipts for the same payment written by different parties in different currencies never reconcile — cross-receipt math diverges as market rates move, and amount/currency-based payment clustering can't match them. Writers of related receipts copy the block verbatim so consumers compare deterministically.
- **`refundOf`** (strongRef) marks a receipt as a partial or whole refund of the referenced receipt. Receipts are immutable once published — attestations bind to their content — so refunds are new receipts, never edits: the refunded amount in the original denomination (copying the original's `fx` so partial refunds compute at the original rate, without forex drift), `from`/`to` mirrored, one receipt per partial refund. Aggregating consumers net refund receipts against the receipt they reference.
- **`transactionId`** description now carries privacy guidance for public repositories: prefer opaque processor IDs or internal references, avoid bank references embedding account details, and note that an onchain transaction hash publicly reveals the sending wallet — significant when the sender was deliberately kept anonymous by omitting `from`.
