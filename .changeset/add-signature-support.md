---
"@hypercerts-org/lexicon": minor
---

Add cryptographic signature support to all lexicons

Adds optional cryptographic signature support to all record lexicons, enabling platform attestation and verification that records were created through trusted services. This is inspired by the [ATProtocol Attestation Specification](https://ngerakines.leaflet.pub/3m3idxul5hc2r) by Nick Gerakines.

**New lexicons:**

- `app.certified.signature.inline` - Inline cryptographic signature object with JOSE algorithm identifiers (ES256, ES256K, Ed25519)
- `app.certified.signature.list` - Reusable array type (union of inline signatures and strongRefs to remote proofs)
- `app.certified.signature.proof` - Remote attestation proof record containing the CID of attested content

**Changes to existing lexicons:**

All 20 record lexicons now include an optional `signatures` property (a ref to `app.certified.signature.list`) placed directly on the record with no wrapper object:

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
- `app.certified.link.evm`

**Design notes:**

This is a non-breaking extension - signatures are optional on all records. Two signature patterns are supported:

1. **Inline signatures** - Embedded directly in the record via `app.certified.signature.inline`
2. **Remote attestations** - References to proof records in other repositories via `com.atproto.repo.strongRef`

Signature algorithm identifiers use [JOSE format](https://www.iana.org/assignments/jose/jose.xhtml) per ATProto convention:

- `ES256K` - secp256k1 (Ethereum/Bitcoin curve, ATProto default)
- `ES256` - P-256 (NIST curve, WebCrypto compatible)
- `Ed25519` - EdDSA
