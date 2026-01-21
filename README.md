# Hypercerts Lexicon Documentation

This repository contains ATProto lexicon definitions for the
Hypercerts protocol. Each lexicon defines a record type that can be
stored on the ATProto network.

## Entity Relationship Diagram

The following diagrams show the relationship between:

- data classes represented by ATProto lexicons, which model the data
  sets relating to hypercerts

- contributors to activity records (modelled/identified by ATProto
  DIDs rather than lexicons)

- hypercerts protocol tokens which are onchain representations of
  activity records in ATProto

Note that contributors and tokens do not require lexicons.

To distinguish these in the diagrams, each class has one of the
following icons:

- "D" means "data class"
- "E" means "entity"
- "P" means "protocol"

![Hypercert ERD](ERD.svg)

<details>
<summary>View ERD with field details</summary>

![Hypercert ERD with fields](ERD-with-fields.svg)

</details>

## Installation

```bash
npm install @hypercerts-org/lexicon
```

## Usage

### Basic Import

```typescript
import {
  HYPERCERTS_SCHEMAS,
  ACTIVITY_NSID,
  validate,
} from "@hypercerts-org/lexicon";

// Use with AT Protocol Agent
import { Agent } from "@atproto/api";

const agent = new Agent({ service: "https://bsky.social" });

// Register lexicons with the agent
agent.api.lex.add(...HYPERCERTS_SCHEMAS);

// Create a record
const activityRecord = {
  $type: ACTIVITY_NSID,
  title: "My Impact Work",
  shortDescription: "Description here",
  workScope: {
    uri: "at://did:plc:alice/org.hypercerts.claim.workscope/abc123",
    cid: "...",
  },
  startDate: "2023-01-01T00:00:00Z",
  endDate: "2023-12-31T23:59:59Z",
  createdAt: new Date().toISOString(),
};

// Validate before creating
const validation = validate(ACTIVITY_NSID, activityRecord);
if (!validation.valid) {
  console.error("Validation failed:", validation.errors);
}

await agent.api.com.atproto.repo.createRecord({
  repo: agent.session?.did,
  collection: ACTIVITY_NSID,
  record: activityRecord,
});
```

### Accessing NSIDs (Lexicon IDs)

**Recommended**: Use individual NSID constants for cleaner, more readable code:

```typescript
import { ACTIVITY_NSID, COLLECTION_NSID } from "@hypercerts-org/lexicon";

// Clean and explicit
const record = {
  $type: ACTIVITY_NSID,
  // ...
};
```

**Alternative**: Use the semantic NSID object when you need multiple NSIDs:

```typescript
import { HYPERCERTS_NSIDS } from "@hypercerts-org/lexicon";

// Access via semantic keys
const activityId = HYPERCERTS_NSIDS.ACTIVITY;
const collectionId = HYPERCERTS_NSIDS.COLLECTION;
const rightsId = HYPERCERTS_NSIDS.RIGHTS;
```

**Type-based mapping**: If you need to map TypeScript type namespaces to NSIDs:

```typescript
import { HYPERCERTS_NSIDS_BY_TYPE } from "@hypercerts-org/lexicon";

// Access via type namespace names
const activityId = HYPERCERTS_NSIDS_BY_TYPE.OrgHypercertsClaimActivity;
const collectionId = HYPERCERTS_NSIDS_BY_TYPE.OrgHypercertsClaimCollection;
```

**Lightweight Bundle**: Import from `/lexicons` for runtime validation without TypeScript types (smaller bundle size):

```typescript
import { schemas, validate, ids } from "@hypercerts-org/lexicon/lexicons";

// Lighter bundle, type-based namespace access
const result = validate(ids.OrgHypercertsClaimActivity, record);
```

**Note**: Individual constants (e.g., `ACTIVITY_NSID`) are the recommended approach for most use cases as they provide the best developer experience with clear, concise naming.

### TypeScript Types

All lexicon types are exported as namespaces:

```typescript
import { OrgHypercertsClaimActivity } from "@hypercerts-org/lexicon";

// Use the Main type
const activity: OrgHypercertsClaimActivity.Main = {
  $type: "org.hypercerts.claim.activity",
  title: "My Impact Work",
  // ... other fields
};
```

### Individual Lexicon Imports

Each lexicon is available in two forms as individual constants:

```typescript
import {
  // Raw JSON (untyped) - direct import from JSON files
  ACTIVITY_LEXICON_JSON,
  RIGHTS_LEXICON_JSON,

  // Typed LexiconDoc - from lexicons.get() at module initialization
  ACTIVITY_LEXICON_DOC,
  RIGHTS_LEXICON_DOC,
} from "@hypercerts-org/lexicon";
```

| Suffix  | Type                 | Source                    | Use Case                       |
| ------- | -------------------- | ------------------------- | ------------------------------ |
| `_JSON` | Untyped JSON         | Direct JSON import        | Raw schema data                |
| `_DOC`  | `LexiconDoc` (typed) | `lexicons.get()` instance | Type-safe lexicon manipulation |

Or access all lexicons via semantic mapping objects:

```typescript
import {
  HYPERCERTS_LEXICON_JSON,
  HYPERCERTS_LEXICON_DOC,
} from "@hypercerts-org/lexicon";

// Access via semantic keys (same keys as HYPERCERTS_NSIDS)
const activityJSON = HYPERCERTS_LEXICON_JSON.ACTIVITY;
const activityDoc = HYPERCERTS_LEXICON_DOC.ACTIVITY;
const rightsJSON = HYPERCERTS_LEXICON_JSON.RIGHTS;
const rightsDoc = HYPERCERTS_LEXICON_DOC.RIGHTS;
```

## Schema Documentation

For complete schema documentation with all lexicon definitions and
property tables, see [SCHEMAS.md](SCHEMAS.md).

## Examples

### Creating a Collection with Nested Items

```typescript
import { TID } from "@atproto/common";

const collectionRecord = {
  $type: "org.hypercerts.claim.collection",
  title: "Climate Action Projects",
  shortDescription:
    "A collection of climate-related activities and sub-collections",
  items: [
    // Reference to an activity
    {
      uri: "at://did:plc:alice/org.hypercerts.claim.activity/3k2abc",
      cid: "...",
    },
    // Reference to another activity
    {
      uri: "at://did:plc:bob/org.hypercerts.claim.activity/7x9def",
      cid: "...",
    },
    // Reference to another collection (recursive!)
    {
      uri: "at://did:plc:carol/org.hypercerts.claim.collection/4m5ghi",
      cid: "...",
    },
  ],
  createdAt: new Date().toISOString(),
};
```

### Creating a Project

Projects are collections with a `type` field set to "project" and can
include rich-text descriptions:

```typescript
const projectRecord = {
  $type: "org.hypercerts.claim.collection",
  type: "project",
  title: "Carbon Offset Initiative",
  shortDescription: "A project focused on carbon reduction and reforestation",
  description: {
    uri: "at://did:plc:alice/pub.leaflet.pages.linearDocument/abc123",
    cid: "...",
  },
  items: [
    {
      uri: "at://did:plc:alice/org.hypercerts.claim.activity/3k2abc",
      cid: "...",
    },
    {
      uri: "at://did:plc:bob/org.hypercerts.claim.activity/7x9def",
      cid: "...",
    },
  ],
  createdAt: new Date().toISOString(),
};
```

**Note**: The `type` field is optional and can be set to "project",
"favorites", or any other collection type. The `description` field
supports rich-text via Leaflet linear documents.

### Adding Visual Representation to Collections

Collections can include `avatar` and `coverImage` fields for visual representation:

```typescript
import { COLLECTION_NSID } from "@hypercerts-org/lexicon";

const collectionRecord = {
  $type: COLLECTION_NSID,
  title: "Climate Action Projects",
  avatar: {
    image: blobRef, // or { uri: "https://..." }
  },
  coverImage: {
    image: largeBlobRef, // or { uri: "https://..." }
  },
  items: [
    // ... collection items
  ],
  createdAt: new Date().toISOString(),
};
```

**Note**: Both `avatar` (up to 5MB) and `coverImage` (up to 10MB) fields
are optional and support either embedded image blobs or URI references to
external images.
