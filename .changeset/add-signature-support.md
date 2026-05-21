---
"@hypercerts-org/lexicon": minor
---

Add cryptographic signature support to all lexicons

Adds optional cryptographic signature support to all record lexicons, enabling platform attestation and verification that records were created through trusted services. The on-the-wire shape, signing procedure, and verification procedure all conform to Nick Gerakines' [ATProtocol Attestation Specification](https://ngerakines.leaflet.pub/3m3idxul5hc2r).

**New lexicons:**

- `app.certified.signature.inline` - Inline cryptographic signature object. Two required fields only: `signature` (ECDSA bytes, low-S per BIP-0062, signing the record's CID) and `key` (DID verification method reference). The signing curve is determined by the multicodec prefix on the verification method's `publicKeyMultibase`, so no separate algorithm-tag field is carried on the signature itself.
- `app.certified.signature.defs` - Shared type definitions for signatures, providing the `#list` array def (open union of inline signatures and strongRefs to remote proofs) that is referenced from record lexicons.
- `app.certified.signature.proof` - Remote attestation proof record containing the CID of the attested content (computed with the spec's `$sig`-repository binding).

**Changes to existing lexicons:**

19 record lexicons now include an optional `signatures` property (a ref to `app.certified.signature.defs#list`) placed directly on the record with no wrapper object:

- `org.hypercerts.claim.activity`
- `org.hypercerts.claim.contribution`
- `org.hypercerts.claim.contributorInformation`
- `org.hypercerts.claim.rights`
- `org.hypercerts.collection`
- `org.hypercerts.context.acknowledgement`
- `org.hypercerts.context.attachment`
- `org.hypercerts.context.evaluation`
- `org.hypercerts.context.measurement`
- `org.hypercerts.funding.receipt`
- `org.hypercerts.workscope.tag`
- `org.hyperboards.board`
- `org.hyperboards.displayProfile`
- `app.certified.badge.award`
- `app.certified.badge.definition`
- `app.certified.badge.response`
- `app.certified.actor.profile`
- `app.certified.actor.organization`
- `app.certified.location`

`app.certified.link.evm` is deliberately excluded: it already carries its own EIP-712 wallet-ownership proof in the `proof` field, which is the integrity mechanism for its semantic DID ↔ wallet claim. Adding a second, incompatible signing mechanism on the same record would provide no additional trust and invite confusion.

**Design notes:**

This is a non-breaking extension - signatures are optional on all records. Two signature patterns are supported:

1. **Inline signatures** - Embedded directly in the record via `app.certified.signature.inline`.
2. **Remote attestations** - References to proof records in other repositories via `com.atproto.repo.strongRef`.

The signing curve (P-256 / K-256) is determined by the multicodec prefix of the verification method's `publicKeyMultibase`, per the ATProtocol Attestation Specification. ECDSA with the low-S variant per BIP-0062 is mandatory.
