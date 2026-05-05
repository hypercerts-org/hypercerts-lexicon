---
name: building-with-hypercerts-lexicons
description: Guide for building downstream applications on top of the @hypercerts-org/lexicon package. Use when creating apps that read/write Hypercerts records on the AT Protocol network.
---

# Building with Hypercerts Lexicons

Guide for consuming `@hypercerts-org/lexicon` in downstream
applications that read and write Hypercerts data on AT Protocol.

## Important: Use Published Releases

**Do NOT depend on the `main` or development branches of the
`hypercerts-lexicon` git repository unless you have a very specific
need to do so, because they cannot provide any stability guarantees.**

Instead consume published, versioned releases:

- **For TypeScript / JavaScript projects** — install the npm package:
  ```bash
  npm install @hypercerts-org/lexicon
  ```
- **For projects in other languages** — use [tagged GitHub
  releases](https://github.com/hypercerts-org/hypercerts-lexicon/releases).

Both npm releases and git tags follow [SemVer](https://semver.org/).
For npm, you can depend on a version range to receive compatible
updates automatically. For GitHub releases/tags, pin a specific tag
or upgrade manually to a newer compatible SemVer release.

Raw lexicons published on ATProto can also be consumed directly, but
they lack TypeScript types, SemVer guarantees, changelogs, and other
tooling provided by the packaged releases.

## Package Entry Points

The package exposes two entry points:

| Import path                        | What you get                                                                                                        | When to use                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `@hypercerts-org/lexicon`          | Full package: TS types, NSID constants, JSON lexicons, LexiconDoc objects, semantic mappings, validation, utilities | Application code that needs type safety  |
| `@hypercerts-org/lexicon/lexicons` | Lightweight: schemas, `validate()`, `ids` only — no TS types                                                        | Runtime-only validation, smaller bundles |

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
const result = validate(record, ACTIVITY_NSID, "main");
if (!result.success) throw new Error(String(result.error));

// Write to the network
await agent.api.com.atproto.repo.createRecord({
  repo: agent.session?.did,
  collection: ACTIVITY_NSID,
  record,
});
```

## Accessing NSIDs

NSIDs (Namespaced Identifiers) are the string keys that identify each
lexicon type on the AT Protocol network.

**Individual constants** (recommended — tree-shakeable):

```typescript
import {
  ACTIVITY_NSID,
  HYPERCERTS_COLLECTION_NSID,
  CONTEXT_ATTACHMENT_NSID,
  FUNDING_RECEIPT_NSID,
} from "@hypercerts-org/lexicon";
```

**Semantic mapping object** (all NSIDs in one object):

```typescript
import { HYPERCERTS_NSIDS } from "@hypercerts-org/lexicon";
const id = HYPERCERTS_NSIDS.ACTIVITY;
```

**Type-based mapping** (keys match generated type names):

```typescript
import { HYPERCERTS_NSIDS_BY_TYPE } from "@hypercerts-org/lexicon";
const id = HYPERCERTS_NSIDS_BY_TYPE.OrgHypercertsClaimActivity;
```

## TypeScript Types

Every lexicon has a corresponding TypeScript namespace with a `Main`
interface and validation helpers:

```typescript
import { OrgHypercertsClaimActivity } from "@hypercerts-org/lexicon";

const activity: OrgHypercertsClaimActivity.Main = {
  $type: "org.hypercerts.claim.activity",
  title: "My Impact Work",
  shortDescription: "...",
  createdAt: new Date().toISOString(),
};
```

Sub-types (defs) are also exported within each namespace, e.g.
`OrgHypercertsClaimActivity.Contributor`,
`OrgHypercertsClaimActivity.WorkScopeString`.

## Lexicon Documents (JSON and Typed)

Access raw or typed lexicon definitions for runtime introspection:

```typescript
import {
  ACTIVITY_LEXICON_JSON, // raw JSON object (untyped)
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

## Validation

### Using the Generic `validate()` Function

```typescript
import { validate, ACTIVITY_NSID } from "@hypercerts-org/lexicon";

const result = validate(record, ACTIVITY_NSID, "main");
if (!result.success) {
  console.error(result.error);
}
```

### Using Per-Lexicon `validateMain()` (Typed Results)

For type-safe validation results, use `validateMain` from the
per-lexicon namespace export. This requires `$type` to be present on
the input:

```typescript
import {
  OrgHypercertsClaimActivity,
  ACTIVITY_NSID,
} from "@hypercerts-org/lexicon";

const record = {
  $type: ACTIVITY_NSID,
  title: "Open-source climate modeling",
  shortDescription: "Built ML models for regional climate prediction",
  createdAt: new Date().toISOString(),
};

// validateMain returns a typed ValidationResult
// where result.value has all lexicon-specific fields
const result = OrgHypercertsClaimActivity.validateMain(record);
if (result.success) {
  console.log(result.value.title); // type-safe access
} else {
  console.error(result.error);
}
```

## Lexicon Overview

### Claims — the core impact record

| Lexicon                     | NSID                                          | Purpose                                                                                                |
| --------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Activity**                | `org.hypercerts.claim.activity`               | The main hypercert record — title, description, contributors, work scope, timeframe, locations, rights |
| **Contribution**            | `org.hypercerts.claim.contribution`           | Details about a specific contribution: role, description, timeframe                                    |
| **Contributor Information** | `org.hypercerts.claim.contributorInformation` | Identity record: DID or URI identifier, display name, image                                            |
| **Rights**                  | `org.hypercerts.claim.rights`                 | Licensing terms (e.g. "CC BY-SA 4.0") attached to an activity                                          |

### Collections

| Lexicon        | NSID                        | Purpose                                                                                                                                       |
| -------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Collection** | `org.hypercerts.collection` | Named, weighted group of activities and/or other collections. Supports recursive nesting. Used for projects, portfolios, funding rounds, etc. |

### Context — evidence, data, social verification

| Lexicon             | NSID                                     | Purpose                                                                 |
| ------------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| **Attachment**      | `org.hypercerts.context.attachment`      | Documents, reports, evidence, or other files linked to a record         |
| **Measurement**     | `org.hypercerts.context.measurement`     | Quantitative data point (metric + unit + value) linked to records       |
| **Evaluation**      | `org.hypercerts.context.evaluation`      | Assessment with evaluators, summary, score, and supporting measurements |
| **Acknowledgement** | `org.hypercerts.context.acknowledgement` | Bidirectional link: confirms or rejects inclusion in another context    |

### Work Scope

| Lexicon            | NSID                           | Purpose                                                                                     |
| ------------------ | ------------------------------ | ------------------------------------------------------------------------------------------- |
| **Tag**            | `org.hypercerts.workscope.tag` | Reusable scope atom with taxonomy support, aliases, linked ontologies                       |
| **CEL Expression** | `org.hypercerts.workscope.cel` | Structured work scope using [CEL](https://github.com/google/cel-spec) expressions over tags |

### Funding

| Lexicon     | NSID                             | Purpose                                                                                                           |
| ----------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Receipt** | `org.hypercerts.funding.receipt` | Payment record: amount, currency, payment rail, optional transaction ID. Sender is optional for anonymous funders |

### Hyperboards — visual display layer

| Lexicon             | NSID                             | Purpose                                                                                    |
| ------------------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| **Board**           | `org.hyperboards.board`          | Visual wrapper around activity/collection with background, colors, per-contributor styling |
| **Display Profile** | `org.hyperboards.displayProfile` | Per-user visual defaults (avatar, hover image, video, URL). Singleton (`literal:self`)     |

### Certified — shared lexicons

| Lexicon              | NSID                               | Purpose                                                                                                                      |
| -------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Location**         | `app.certified.location`           | Geographic reference via [Location Protocol](https://spec.decentralizedgeo.org)                                              |
| **Profile**          | `app.certified.actor.profile`      | User profile: display name, bio, avatar, banner                                                                              |
| **Organization**     | `app.certified.actor.organization` | Organization metadata: legal structure, URLs, location, founding date, optional long description, discoverability visibility |
| **Badge Definition** | `app.certified.badge.definition`   | Defines a badge with type, title, icon, optional issuer allowlist                                                            |
| **Badge Award**      | `app.certified.badge.award`        | Awards a badge to a user, project, or activity                                                                               |
| **Badge Response**   | `app.certified.badge.response`     | Recipient accepts or rejects a badge award                                                                                   |
| **EVM Link**         | `app.certified.link.evm`           | Verifiable ATProto DID to EVM wallet link via EIP-712 signature                                                              |
| **Follow**           | `app.certified.graph.follow`       | Social-graph follow: declares the author follows another account by DID. Schema-compatible with `app.bsky.graph.follow`      |

## Relationship Map

```text
CLAIMS
  activity ──────────┬──> collection <──┐  (recursive nesting)
  (the hypercert)    │       │          │
                     │       v          │
                     ├──> contribution          (role, timeframe)
                     ├──> contributorInformation (identity, image)
                     ├──> rights                (licensing terms)
                     └──> workScope
                            ├── cel ──> tag     (CEL expression referencing tags)
                            └── string          (free-form scope)

CONTEXT
  attachment ────────────> any record (activity, evaluation, …)
  measurement ───────────> any record (activity, …)
  evaluation ────────────> any record (activity, measurement, …)
                  └──────> measurement
  acknowledgement ───────> any record  (bidirectional)

FUNDING
  receipt ───────────────> activity    (from funder -> to recipient)

HYPERBOARDS
  board ─────────────────> activity / collection
    └── contributorConfig > contributorInformation
  displayProfile           (per-user visual defaults)

CERTIFIED
  location                 (geo coordinates, GeoJSON, H3, …)
  link/evm                 (ATProto DID <-> EVM wallet link)
  actor/profile            (user profile)
  actor/organization       (org metadata)
  badge/response ──> badge/award ──> badge/definition
  graph/follow ───────────> account DID (social follow)
```

Every arrow is a `strongRef` or union reference stored on AT Protocol.

## Common Patterns

### Creating an Activity (Hypercert)

```typescript
import { ACTIVITY_NSID } from "@hypercerts-org/lexicon";

const activity = {
  $type: ACTIVITY_NSID,
  title: "Mangrove Restoration in Mombasa",
  shortDescription: "Restored 3 hectares of mangrove forest",
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

### Creating a Collection

```typescript
import { HYPERCERTS_COLLECTION_NSID } from "@hypercerts-org/lexicon";

const project = {
  $type: HYPERCERTS_COLLECTION_NSID,
  type: "project",
  title: "Carbon Offset Initiative",
  shortDescription: "Activities focused on carbon reduction",
  items: [
    {
      itemIdentifier: {
        uri: "at://did:plc:alice/org.hypercerts.claim.activity/3k2abc",
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

### Creating an Acknowledgement

```typescript
import { CONTEXT_ACKNOWLEDGEMENT_NSID } from "@hypercerts-org/lexicon";

const ack = {
  $type: CONTEXT_ACKNOWLEDGEMENT_NSID,
  subject: {
    uri: "at://did:plc:bob/org.hypercerts.claim.activity/3k2abc",
    cid: "bafy...",
  },
  // context is a union — use $type to specify the variant
  context: {
    $type: "com.atproto.repo.strongRef",
    uri: "at://did:plc:alice/org.hypercerts.collection/7x9def",
    cid: "bafy...",
  },
  acknowledged: true, // false to reject
  createdAt: new Date().toISOString(),
};
```

### Creating a Location Record

```typescript
import { LOCATION_NSID } from "@hypercerts-org/lexicon";

const location = {
  $type: LOCATION_NSID,
  lpVersion: "1.0",
  srs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
  locationType: "coordinate-decimal",
  location: {
    $type: "app.certified.location#string",
    string: "-3.4653, -62.2159",
  },
  name: "Amazon Research Station",
  createdAt: new Date().toISOString(),
};
```

### Following another account

```typescript
import { GRAPH_FOLLOW_NSID } from "@hypercerts-org/lexicon";

const follow = {
  $type: GRAPH_FOLLOW_NSID,
  subject: "did:plc:bob", // DID of the account being followed
  createdAt: new Date().toISOString(),
};
```

`app.certified.graph.follow` mirrors `app.bsky.graph.follow` (same
key strategy and fields including the optional `via` strongRef), so
feed-builders and view services can index it with the same logic
they already use for Bluesky follows.

### Linking an EVM Wallet

```typescript
import { LINK_EVM_NSID } from "@hypercerts-org/lexicon";

const evmLink = {
  $type: LINK_EVM_NSID,
  address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  proof: {
    $type: "app.certified.link.evm#eip712Proof",
    signature: "0xabc123...",
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

### Creating an Attachment

```typescript
import { CONTEXT_ATTACHMENT_NSID } from "@hypercerts-org/lexicon";

const attachment = {
  $type: CONTEXT_ATTACHMENT_NSID,
  title: "Field Survey Report",
  contentType: "report",
  subjects: [
    {
      uri: "at://did:plc:alice/org.hypercerts.claim.activity/abc123",
      cid: "...",
    },
  ],
  // content items are a union — use $type to specify the variant
  content: [
    {
      $type: "org.hypercerts.defs#uri",
      uri: "https://example.com/reports/survey-2024.pdf",
    },
    { $type: "org.hypercerts.defs#uri", uri: "ipfs://Qm..." },
  ],
  shortDescription: "Quarterly field survey documenting project progress",
  createdAt: new Date().toISOString(),
};
```

### Recording a Funding Receipt

```typescript
import { FUNDING_RECEIPT_NSID } from "@hypercerts-org/lexicon";

const receipt = {
  $type: FUNDING_RECEIPT_NSID,
  to: "did:plc:recipient",
  amount: "1000.00",
  currency: "USD",
  paymentRail: "ethereum",
  transactionId: "0xabc...",
  for: "at://did:plc:alice/org.hypercerts.claim.activity/abc123",
  occurredAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};
```

## Key Concepts

### strongRef

References between records use AT Protocol's `strongRef` type — a
`{ uri, cid }` pair where:

- `uri` is an `at://` URI pointing to the record
- `cid` is the Content Identifier (hash) of the referenced version

This ensures immutable, verifiable links between records.

### Record Keys

Each lexicon specifies a `key` strategy:

- `"tid"` — auto-generated time-based ID (most records)
- `"literal:self"` — singleton record per user (e.g. `displayProfile`)

### Timestamps

All `createdAt` fields use ISO 8601 format with timezone
(`datetime` type in ATProto). Generate with `new Date().toISOString()`.

### $type Field

Every record written to AT Protocol must include a `$type` field
matching the collection NSID. Use the exported `*_NSID` constants to
avoid typos.

## Further Reading

- [SCHEMAS.md](https://github.com/hypercerts-org/hypercerts-lexicon/blob/main/SCHEMAS.md) — full property-level documentation for every lexicon
- [CHANGELOG.md](https://github.com/hypercerts-org/hypercerts-lexicon/blob/main/CHANGELOG.md) — version history and migration guides
- [ATProto Lexicon Guide](https://atproto.com/guides/lexicon) — AT Protocol lexicon fundamentals
- [ATProto Lexicon Style Guide](https://atproto.com/guides/lexicon-style-guide) — schema design conventions
- [Hypercerts website](https://hypercerts.org) — project overview
