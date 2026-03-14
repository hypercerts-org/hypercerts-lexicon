---
"@hypercerts-org/lexicon": minor
---

Add `app.certified.link.evm` lexicon for verifiable linking of EVM
wallet addresses to ATProto identities via cryptographic signatures.
Currently supports EOA wallets with EIP-712 typed data; the `proof`
field is an open union to allow future signature methods (e.g.
ERC-1271, ERC-6492).
