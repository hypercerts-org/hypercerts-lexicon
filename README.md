# @hypercerts-org/lexicon

ATProto lexicon definitions and TypeScript types for the
[Hypercerts](https://hypercerts.org) protocol — a system for tracking,
evaluating, and funding impact work on the
[AT Protocol](https://atproto.com) network.

## Lexicon Map

```text
CLAIMS ─ the core impact record and its parts
──────────────────────────────────────────────────────────────────────
  activity ──────────┬──► collection ◄──┐  (recursive nesting)
  (the hypercert)    │       │          │
                     │       ▼          │
                     ├──► contribution          (role, timeframe)
                     ├──► contributorInformation (identity, avatar)
                     ├──► rights                (licensing terms)
                     └──► workScope
                            ├── cel             (CEL expression)
                            └── tag             (reusable scope atom)

CONTEXT ─ evidence, data, and social verification
──────────────────────────────────────────────────────────────────────
  attachment ─────────────► activity / evaluation / ...
  measurement ────────────► activity / ...
  evaluation ─────────────► activity / attachment
                  └──────► measurement
  acknowledgement ────────► activity / collection  (bidirectional link)

FUNDING ─ payment records
──────────────────────────────────────────────────────────────────────
  receipt ────────────────► activity    (from funder → to recipient)

HYPERBOARDS ─ visual display layer (hyperboards.org)
──────────────────────────────────────────────────────────────────────
  board ──────────────────► activity / collection
    └── contributorConfig ► contributorInformation
  displayProfile            (per-user visual defaults)

CERTIFIED ─ shared lexicons (certified.app)
──────────────────────────────────────────────────────────────────────
  location                  (geo coordinates, GeoJSON, H3, …)
  actor/profile             (user profile)
  actor/organization        (org metadata)
  badge/definition ──► badge/award ──► badge/response
  signature/inline          (embedded cryptographic signature)
  signature/defs            (shared signatures array def)
  signature/proof           (remote attestation proof record)
```

Every arrow (`►`) is a `strongRef` or union reference stored on the
AT Protocol network. Full field-level documentation is in
[SCHEMAS.md](SCHEMAS.md).

## Consuming These Lexicons

If you are building a downstream application on top of these lexicons,
we strongly recommend **NOT** reading from `main` or other development
branches of the repository, but instead via the following published
releases:

- **For TypeScript / JavaScript code** — use [the npm package
  `@hypercerts-org/lexicon`](https://www.npmjs.com/package/@hypercerts-org/lexicon),
  which includes generated types, validation helpers, and schema
  constants.
- **For other languages** — use the [tagged
  releases](https://github.com/hypercerts-org/hypercerts-lexicon/releases)
  published in this GitHub repository.

Both npm releases and git tags follow [SemVer](https://semver.org/).
For npm, you can depend on a version range to receive compatible
updates automatically. For GitHub releases/tags, pin a specific tag
or upgrade manually to a newer compatible SemVer release.

The raw lexicons published on ATProto can also be used, but they are
(unavoidably) missing useful context such as full documentation
(including changelogs), TypeScript type definitions, SemVer
guarantees, git history, and other tooling provided by the packaged
releases.

### AI Agent Skill

If you use AI coding assistants (e.g. Claude Code, OpenCode), you can
install a skill that teaches your agent how to build with these
lexicons:

```bash
npx skills add hypercerts-org/hypercerts-lexicon
```

This installs the
[`building-with-hypercerts-lexicons`](.agents/skills/building-with-hypercerts-lexicons/SKILL.md)
skill, which provides your agent with guidance on package entry points,
TypeScript types, validation, all lexicon schemas, code examples, and
AT Protocol conventions.

## Maintenance and publishing releases

Clearly stability and predictability for users and developers are
essential.

Unfortunately AT Protocol doesn't support any kind of native
versioning or migrations which could support lexicon schema changes.
Instead, the AT Protocol community recommends minimising changes to
lexicons in general, and to avoid breaking changes wherever possible:

- https://atproto.com/guides/lexicon-style-guide
- https://www.pfrazee.com/blog/lexicon-guidance

This project intends to follow that guidance as much as possible
whilst retaining a pragmatic approach. In practice that means:

- Changes to other tooling within this repository which _do not touch
  lexicons_ may be made at any time as long as they follow
  [SemVer](https://semver.org/) to avoid negative impact on
  developers.

- Non-breaking changes to lexicons, such as adding an optional
  property or updating a `description`, may be made sparingly. While
  these changes are backwards-compatible at the protocol level, they
  may still require consuming applications and indexers to update
  their schemas for consistent UX.

- Breaking changes to lexicons will only be made in exceptional
  circumstances. Specifically, a breaking change will only proceed
  **if and only if**:
  - the broader community — not just the Hypercerts core team —
    agrees that the benefits clearly outweigh the cost of the
    breakage, **and**
  - full consideration is given to all affected parties across the
    community and wider ecosystem, not only those involved in the
    decision, **and**
  - no viable alternative exists, such as releasing a new `.v2`
    version of the lexicon or introducing a `v2` field.

  To date, breaking changes have only occurred during the early
  stages of launching Hypercerts on AT Protocol, before external
  consumers were building against the lexicons. We intend to keep
  it that way.

It is also worth noting that members of the ATProto community have
been working on tooling to make these problems easier to deal with in
future, e.g. see https://panproto.dev/

## Use of branches

`main` is the only evergreen branch and the default branch on GitHub.
We aim to minimise deviations between `main` and versions published on
npm and ATProto. However the publishing processes involve several
moving parts (including third-party systems), and it is technically
impossible to update all three at the same time. So **please do not
assume they will always be perfectly in sync**.

See [docs/PUBLISHING.md](docs/PUBLISHING.md) for the full release workflow.

> If you see a `develop` branch, it is a stale leftover from a
> previous workflow and is no longer used; do not open pull requests
> against it.

## Contributing / development

Please see [CONTRIBUTING.md](CONTRIBUTING.md).

### Project Structure

```text
lexicons/               Source of truth (committed)
  org/hypercerts/         Hypercerts protocol lexicons
  org/hyperboards/        Hyperboards visual layer lexicons
  app/certified/          Shared/certified lexicons
  com/atproto/            ATProto external references

generated/              Auto-generated TypeScript (gitignored)
dist/                   Built bundles (gitignored)
scripts/                Build and codegen scripts
```

> **Never edit `generated/` or `dist/` directly** — they are
> regenerated from lexicon JSON files.

## Installation

```bash
npm install @hypercerts-org/lexicon
```

## Quick Start

```typescript
import {
  HYPERCERTS_SCHEMAS,
  ACTIVITY_NSID,
  validate,
} from "@hypercerts-org/lexicon";
import { Agent } from "@atproto/api";

const agent = new Agent({ service: "https://bsky.social" });

// Register lexicons with the agent
agent.api.lex.add(...HYPERCERTS_SCHEMAS);

// Build a record
const record = {
  $type: ACTIVITY_NSID,
  title: "Reforestation in Amazon Basin 2024",
  shortDescription: "Planted 5,000 native trees across 12 hectares",
  createdAt: new Date().toISOString(),
};

// Validate before writing
const result = validate(ACTIVITY_NSID, record);
if (!result.valid) throw new Error(JSON.stringify(result.errors));

// Write to the network
await agent.api.com.atproto.repo.createRecord({
  repo: agent.session?.did,
  collection: ACTIVITY_NSID,
  record,
});
```

## Lexicon Reference

### Claims (`org.hypercerts.claim.*`)

| Lexicon                     | NSID                                          | Description                                                                                                                            |
| --------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Activity**                | `org.hypercerts.claim.activity`               | The main hypercert record — describes impact work with title, description, contributors, work scope, timeframe, locations, and rights. |
| **Contribution**            | `org.hypercerts.claim.contribution`           | Details about a specific contribution: role, description, and timeframe.                                                               |
| **Contributor Information** | `org.hypercerts.claim.contributorInformation` | Identity record for a contributor: identifier (DID or URI), display name, and avatar.                                                  |
| **Rights**                  | `org.hypercerts.claim.rights`                 | Licensing and rights terms (e.g. "CC BY-SA 4.0") attached to an activity.                                                              |

### Collections (`org.hypercerts.*`)

| Lexicon        | NSID                        | Description                                                                                                                                                 |
| -------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Collection** | `org.hypercerts.collection` | A named, weighted group of activities and/or other collections. Supports recursive nesting. Used for projects, portfolios, favourites, funding rounds, etc. |

### Context (`org.hypercerts.context.*`)

| Lexicon             | NSID                                     | Description                                                                             |
| ------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| **Attachment**      | `org.hypercerts.context.attachment`      | Documents, reports, evidence, or other files linked to a record.                        |
| **Measurement**     | `org.hypercerts.context.measurement`     | Quantitative data point (metric + unit + value) linked to one or more records.          |
| **Evaluation**      | `org.hypercerts.context.evaluation`      | An assessment of a record with evaluators, summary, score, and supporting measurements. |
| **Acknowledgement** | `org.hypercerts.context.acknowledgement` | Bidirectional link: confirms or rejects inclusion of a record in another context.       |

### Work Scope (`org.hypercerts.workscope.*`)

| Lexicon            | NSID                           | Description                                                                                                                       |
| ------------------ | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Tag**            | `org.hypercerts.workscope.tag` | Reusable scope atom (topic, domain, method, …) with taxonomy support, aliases, and linked ontologies.                             |
| **CEL Expression** | `org.hypercerts.workscope.cel` | Structured work scope using [CEL](https://github.com/google/cel-spec) expressions over tags. Embedded inline in activity records. |

### Funding (`org.hypercerts.funding.*`)

| Lexicon     | NSID                             | Description                                                                                                                                                       |
| ----------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Receipt** | `org.hypercerts.funding.receipt` | Records a payment to a recipient, with amount, currency, payment rail, and optional transaction ID. The sender (`from`) is optional to support anonymous funders. |

### Hyperboards (`org.hyperboards.*`)

| Lexicon             | NSID                             | Description                                                                                                                         |
| ------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Board**           | `org.hyperboards.board`          | Visual presentation layer wrapping an activity or collection with background, colors, aspect ratio, and per-contributor styling.    |
| **Display Profile** | `org.hyperboards.displayProfile` | Per-user visual defaults (avatar, hover image, video, click-through URL) reusable across boards. Singleton record (`literal:self`). |

### Certified (`app.certified.*`)

| Lexicon              | NSID                               | Description                                                                                                                     |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Location**         | `app.certified.location`           | Geographic reference using the [Location Protocol](https://spec.decentralizedgeo.org) (coordinates, GeoJSON, H3, WKT, etc.).    |
| **Profile**          | `app.certified.actor.profile`      | User account profile with display name, bio, avatar, and banner.                                                                |
| **Organization**     | `app.certified.actor.organization` | Organization metadata: legal structure, URLs, location, founding date.                                                          |
| **Badge Definition** | `app.certified.badge.definition`   | Defines a badge type with title, icon, and optional issuer allowlist.                                                           |
| **Badge Award**      | `app.certified.badge.award`        | Awards a badge to a user, project, or activity.                                                                                 |
| **Badge Response**   | `app.certified.badge.response`     | Recipient accepts or rejects a badge award.                                                                                     |
| **EVM Link**         | `app.certified.link.evm`           | Verifiable ATProto DID ↔ EVM wallet link via EIP-712 signature. Extensible for future proof methods (e.g. ERC-1271, ERC-6492). |

### Signatures (`app.certified.signature.*`)

| Lexicon              | NSID                             | Description                                                                                                                                                              |
| -------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Inline Signature** | `app.certified.signature.inline` | An inline cryptographic signature for attesting to record content. Uses JOSE algorithm identifiers (ES256, ES256K, Ed25519).                                             |
| **Shared Defs**      | `app.certified.signature.defs`   | Shared type definitions for signatures. Provides the `#list` array def (a union of inline signatures and strongRefs) referenced by the `signatures` property on records. |
| **Proof**            | `app.certified.signature.proof`  | Remote attestation proof record containing the CID of attested content. Lives in the attestor's repository and can be referenced via strongRef.                          |

Nearly all record lexicons include an optional `signatures` property (a ref to `app.certified.signature.defs#list`) enabling cryptographic attestations. See [Cryptographic Signatures](#cryptographic-signatures) for usage details.

`app.certified.link.evm` is the one exception: it already carries its own EIP-712 wallet-ownership proof in the `proof` field, which is the integrity mechanism for its semantic claim (DID ↔ wallet). Adding an `app.certified.signature.defs#list` on top would introduce a second, incompatible signing mechanism on the same record and no additional trust, so it is deliberately omitted.

> **Full property tables** → [SCHEMAS.md](SCHEMAS.md)

## Entity Relationship Diagram

![Hypercert ERD](ERD.svg)

<details>
<summary>View ERD with field details</summary>

![Hypercert ERD with fields](ERD-with-fields.svg)

</details>

## Usage

### Accessing NSIDs

Individual constants (recommended):

```typescript
import { ACTIVITY_NSID, COLLECTION_NSID } from "@hypercerts-org/lexicon";
```

Semantic object:

```typescript
import { HYPERCERTS_NSIDS } from "@hypercerts-org/lexicon";

const id = HYPERCERTS_NSIDS.ACTIVITY;
```

Type-based mapping:

```typescript
import { HYPERCERTS_NSIDS_BY_TYPE } from "@hypercerts-org/lexicon";

const id = HYPERCERTS_NSIDS_BY_TYPE.OrgHypercertsClaimActivity;
```

Lightweight bundle (no TypeScript types, smaller bundle):

```typescript
import { schemas, validate, ids } from "@hypercerts-org/lexicon/lexicons";
```

### TypeScript Types

```typescript
import { OrgHypercertsClaimActivity } from "@hypercerts-org/lexicon";

const activity: OrgHypercertsClaimActivity.Main = {
  $type: "org.hypercerts.claim.activity",
  title: "My Impact Work",
  shortDescription: "...",
  createdAt: new Date().toISOString(),
};
```

### Lexicon Documents

```typescript
import {
  ACTIVITY_LEXICON_JSON, // raw JSON (untyped)
  ACTIVITY_LEXICON_DOC, // LexiconDoc (typed)
} from "@hypercerts-org/lexicon";
```

Or via semantic mapping objects:

```typescript
import {
  HYPERCERTS_LEXICON_JSON,
  HYPERCERTS_LEXICON_DOC,
} from "@hypercerts-org/lexicon";

const doc = HYPERCERTS_LEXICON_DOC.ACTIVITY;
```

## Examples

### Creating Activities with Work Scope

```typescript
import { ACTIVITY_NSID } from "@hypercerts-org/lexicon";

const activity = {
  $type: ACTIVITY_NSID,
  title: "Mangrove Restoration in Mombasa",
  shortDescription: "Restored 3 hectares of mangrove forest",
  // Structured work scope via CEL expression:
  workScope: {
    $type: "org.hypercerts.workscope.cel",
    expression:
      "scope.hasAll(['mangrove_restoration']) && location.country == 'KE'",
    usedTags: [
      {
        uri: "at://did:plc:alice/org.hypercerts.workscope.tag/3k2abc",
        cid: "...",
      },
    ],
    version: "v1",
    createdAt: new Date().toISOString(),
  },
  startDate: "2024-01-01T00:00:00Z",
  endDate: "2024-12-31T23:59:59Z",
  createdAt: new Date().toISOString(),
};
```

### Creating Collections (Projects, Portfolios, etc.)

```typescript
import { COLLECTION_NSID } from "@hypercerts-org/lexicon";

const project = {
  $type: COLLECTION_NSID,
  type: "project",
  title: "Carbon Offset Initiative",
  shortDescription: "Activities focused on carbon reduction and reforestation",
  items: [
    {
      itemIdentifier: {
        uri: "at://did:plc:alice/org.hypercerts.claim.activity/3k2abc",
        cid: "...",
      },
    },
    {
      itemIdentifier: {
        uri: "at://did:plc:bob/org.hypercerts.claim.activity/7x9def",
        cid: "...",
      },
    },
    // Collections can contain other collections (recursive nesting):
    {
      itemIdentifier: {
        uri: "at://did:plc:carol/org.hypercerts.collection/4m5ghi",
        cid: "...",
      },
    },
  ],
  createdAt: new Date().toISOString(),
};
```

### Creating Location Records

```typescript
import { LOCATION_NSID } from "@hypercerts-org/lexicon";

// Decimal coordinates
const location = {
  $type: LOCATION_NSID,
  lpVersion: "1.0",
  srs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
  locationType: "coordinate-decimal",
  location: { string: "-3.4653, -62.2159" },
  name: "Amazon Research Station",
  createdAt: new Date().toISOString(),
};

// GeoJSON
const geoLocation = {
  $type: LOCATION_NSID,
  lpVersion: "1.0",
  srs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
  locationType: "geojson-point",
  location: { string: '{"type":"Point","coordinates":[-62.2159,-3.4653]}' },
  name: "Research Station Alpha",
  createdAt: new Date().toISOString(),
};
```

### Acknowledging Inclusion

When one user includes another's record (e.g. adding an activity to a
collection), the owner can confirm or reject with an acknowledgement:

```typescript
import { ACKNOWLEDGEMENT_NSID } from "@hypercerts-org/lexicon";

const ack = {
  $type: ACKNOWLEDGEMENT_NSID,
  subject: {
    uri: "at://did:plc:bob/org.hypercerts.claim.activity/3k2abc",
    cid: "bafy...",
  },
  context: {
    uri: "at://did:plc:alice/org.hypercerts.collection/7x9def",
    cid: "bafy...",
  },
  acknowledged: true, // false to reject
  createdAt: new Date().toISOString(),
};
```

### Creating Attachments

```typescript
import { ATTACHMENT_NSID } from "@hypercerts-org/lexicon";

const attachment = {
  $type: ATTACHMENT_NSID,
  title: "Field Survey Report",
  contentType: "report",
  subjects: [
    {
      uri: "at://did:plc:alice/org.hypercerts.claim.activity/abc123",
      cid: "...",
    },
  ],
  content: [
    { uri: "https://example.com/reports/survey-2024.pdf" },
    { uri: "ipfs://Qm..." },
  ],
  shortDescription: "Quarterly field survey documenting project progress",
  createdAt: new Date().toISOString(),
};
```

### Cryptographic Signatures

Nearly all record lexicons support optional cryptographic signatures via the `signatures` property. This enables platform attestation and verification that records were created through trusted services. (`app.certified.link.evm` is the sole exception — see the [Signatures table](#signatures-appcertifiedsignature) above for why.)

Signatures support two patterns:

1. **Inline signatures**: Embedded directly in the record
2. **Remote attestations**: References to proof records in other repositories (via `strongRef`)

```typescript
import { ACTIVITY_NSID } from "@hypercerts-org/lexicon";

// Activity with inline signature
const signedActivity = {
  $type: ACTIVITY_NSID,
  title: "Verified Reforestation Project",
  shortDescription: "Planted 1,000 trees in partnership with local community",
  createdAt: new Date().toISOString(),
  signatures: [
    // Inline signature (embedded)
    {
      $type: "app.certified.signature.inline",
      signatureType: "ES256K", // JOSE algorithm: secp256k1
      signature: new Uint8Array([
        /* signature bytes */
      ]),
      key: "did:plc:platform123#signing", // DID verification method
    },
    // Remote attestation (reference to proof in another repo)
    {
      $type: "com.atproto.repo.strongRef",
      uri: "at://did:plc:verifier/app.certified.signature.proof/abc123",
      cid: "bafy...",
    },
  ],
};
```

#### Signature Algorithm Identifiers

The `signatureType` property uses [JOSE algorithm identifiers](https://www.iana.org/assignments/jose/jose.xhtml):

| Value     | Curve     | Description                             |
| --------- | --------- | --------------------------------------- |
| `ES256`   | P-256     | NIST curve, WebCrypto compatible        |
| `ES256K`  | secp256k1 | Ethereum/Bitcoin curve, ATProto default |
| `Ed25519` | Ed25519   | EdDSA, increasingly popular             |

#### Remote Attestation Proofs

For remote attestations, create a proof record in the attestor's repository:

```typescript
import { SIGNATURE_PROOF_NSID } from "@hypercerts-org/lexicon";

const proof = {
  $type: SIGNATURE_PROOF_NSID,
  cid: "bafy...", // CID of the attested content
  note: "Verified by platform quality assurance process",
  createdAt: new Date().toISOString(),
};
```

For the full specification, see Nick Gerakines' [ATProtocol Attestation Specification](https://ngerakines.leaflet.pub/3m3idxul5hc2r).

## Development

### Commands

```bash
npm run gen-api       # Regenerate TypeScript types from lexicons
npm run build         # Build distributable bundles (ESM, CJS, types)
npm run check         # Validate + typecheck + build (run before committing)
npm run lint          # Check formatting (Prettier + ESLint)
npm run format        # Auto-fix formatting
npm run gen-schemas-md # Regenerate SCHEMAS.md
npm run test          # Run tests
```

### Linking ATProto Identity to EVM Wallets

The `app.certified.link.evm` record enables verifiable linking between
an ATProto DID and an EVM wallet address. The link is proven via a
cryptographic signature, allowing any verifier to confirm that the
wallet owner authorized the binding. Currently supports EOA wallets
via EIP-712 typed data signatures; the `proof` field is an open union
to allow future signature methods (e.g. ERC-1271, ERC-6492).

```typescript
import { LINK_EVM_NSID } from "@hypercerts-org/lexicon";

const evmLinkRecord = {
  $type: LINK_EVM_NSID,
  address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  proof: {
    $type: "app.certified.link.evm#eip712Proof",
    signature: "0xabc123...", // truncated for readability; real signatures are 130-132 hex chars
    message: {
      $type: "app.certified.link.evm#eip712Message",
      did: "did:plc:alice",
      evmAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      chainId: "1",
      timestamp: "1709500000",
      nonce: "0",
    },
  },
  createdAt: new Date().toISOString(),
};
```

**Key fields:**

- `address` (required): 0x-prefixed EVM wallet address (EIP-55
  checksummed, 42 chars)
- `proof` (required): Open union containing the cryptographic proof of
  wallet ownership. Each variant bundles its signature with the
  corresponding message format. Currently the only variant is
  `#eip712Proof` for EOA wallets.
- `createdAt` (required): Timestamp when the record was created

## License

MIT
