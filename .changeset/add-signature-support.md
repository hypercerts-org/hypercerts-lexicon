---
"@hypercerts-org/lexicon": minor
---

Add optional cryptographic signature support to all 21 record lexicons.

**Non-breaking:** signatures are optional on every record.

- New `app.certified.signature.defs` with `#list` (open union of inline signatures and `com.atproto.repo.strongRef` references) and `#inline` (raw ECDSA `(r,s)` bytes plus a DID verification method reference; signing curve derived from the verification method's multicodec prefix).
- New `app.certified.signature.proof` record for remote attestations.
- Every record lexicon gains an optional `signatures` property referencing `#list`.
- `README.md`, `SCHEMAS.md`, and the `building-with-hypercerts-lexicons` agent skill all gain a "Cryptographic Signatures" section with a worked end-to-end signing example.

On-the-wire shape, signing procedure, and verification procedure all conform to Nick Gerakines' [ATProtocol Attestation Specification](https://tangled.org/strings/did:plc:cbkjy5n7bk3ax2wplmtjofq2/3m3fy2xuahc22) (see also the [accompanying blog post](https://ngerakines.leaflet.pub/3m3idxul5hc2r)).

On `app.certified.link.evm` the existing EIP-712 `proof` field (wallet consent) and the new `signatures` array (record provenance) are complementary and do not conflict.
