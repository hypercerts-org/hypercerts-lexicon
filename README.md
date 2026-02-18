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
  // workScope can be:
  // 1. A strongRef to a workScopeExpr (flat boolean expression):
  workScope: {
    uri: "at://did:plc:alice/org.hypercerts.helper.workScopeExpr/abc123",
    cid: "...",
  },
  // 2. A strongRef to an ops record (nested logic tree):
  //    { uri: "at://did:plc:alice/org.hypercerts.helper.ops/abc123", cid: "..." }
  // 3. A simple string:
  //    "Environmental conservation",
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

### Creating Location Records

Location records (`app.certified.location`) specify where work was performed
using geographic coordinates or other location formats. They can be referenced
by activities, collections, attachments, measurements, and evaluations.

```typescript
import { LOCATION_NSID } from "@hypercerts-org/lexicon";

const locationRecord = {
  $type: LOCATION_NSID,
  lpVersion: "1.0", // Location Protocol version
  srs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84", // Spatial Reference System
  locationType: "coordinate-decimal", // or "geojson-point", "geojson", "h3", "geohash", "wkt", "address", etc.
  location: {
    uri: "https://example.com/location-data.geojson",
  },
  // Optional fields
  name: "Project Site A",
  description: "Primary research facility in the Amazon rainforest",
  createdAt: new Date().toISOString(),
};
```

- `lpVersion` (required): Version of the Location Protocol specification
- `srs` (required): Spatial Reference System URI defining the coordinate system
- `locationType` (required): Format identifier (e.g., "coordinate-decimal", "geojson-point", "geojson", "h3", "geohash", "wkt", "address", "scaledCoordinates"). See the [Location Protocol spec](https://spec.decentralizedgeo.org/specification/location-types/#location-type-registry) for the full registry.
- `location` (required): Location data as URI, blob, or string
- `name` (optional): Human-readable name for the location
- `description` (optional): Additional context about the location
- `createdAt` (required): Timestamp when the record was created

**Location data formats:**

The `location` field accepts three formats:

1. **URI reference**: `{ uri: "https://..." }` - Link to external location data
2. **Small blob**: Embedded location data (up to 10MB)
3. **Location string**: Inline string wrapped in an object, containing coordinates or GeoJSON

```typescript
// Example with embedded blob
const locationWithBlob = {
  $type: LOCATION_NSID,
  lpVersion: "1.0",
  srs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
  locationType: "geojson-point",
  location: {
    blob: {
      $type: "blob",
      ref: {
        $link: "bafyrei...", // CID of the uploaded blob
      },
      mimeType: "application/geo+json",
      size: 123,
    },
  },
  name: "Amazon Research Station",
  createdAt: new Date().toISOString(),
};

// Example with inline string (coordinates)
const locationWithCoordinates = {
  $type: LOCATION_NSID,
  lpVersion: "1.0",
  srs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
  locationType: "coordinate-decimal",
  location: {
    string: "-3.4653, -62.2159", // lat, lon
  },
  name: "Amazon Research Site",
  description: "Field station coordinates",
  createdAt: new Date().toISOString(),
};

// Example with inline GeoJSON string
const locationWithGeoJSON = {
  $type: LOCATION_NSID,
  lpVersion: "1.0",
  srs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
  locationType: "geojson-point",
  location: {
    string: '{"type":"Point","coordinates":[-62.2159,-3.4653]}',
  },
  name: "Research Station Alpha",
  createdAt: new Date().toISOString(),
};
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

Collections can include `avatar` and `banner` fields for visual representation:

```typescript
import { COLLECTION_NSID } from "@hypercerts-org/lexicon";

const collectionRecord = {
  $type: COLLECTION_NSID,
  title: "Climate Action Projects",
  avatar: {
    image: blobRef, // or { uri: "https://..." }
  },
  banner: {
    image: largeBlobRef, // or { uri: "https://..." }
  },
  items: [
    // ... collection items
  ],
  createdAt: new Date().toISOString(),
};
```

**Note**: Both `avatar` (up to 5MB) and `banner` (up to 10MB) fields
are optional and support either embedded image blobs or URI references to
external images.

### Acknowledging Inclusion

The `org.hypercerts.acknowledgement` record enables bidirectional
linking between records that live in different PDS repositories. When
one user includes another user's record (e.g. adding an activity to a
collection), the owner of the included record can create an
acknowledgement to confirm or reject the inclusion. This forms a
two-way link that an AppView can verify.

Each acknowledgement uses `com.atproto.repo.strongRef` fields to
reference both the **subject** (the record being included) and the
**context** (the record it's being included in).

See [SCHEMAS.md](SCHEMAS.md) for the full property reference.

#### Use Case: Activity Included in a Collection

A project organizer (Alice) creates a collection and adds Bob's
activity to it via a `strongRef` in the collection's `items[]` array.
Bob then creates an acknowledgement in his own repo to confirm:

```typescript
import { ACKNOWLEDGEMENT_NSID } from "@hypercerts-org/lexicon";

// Bob acknowledges that his activity is included in Alice's collection
const ack = {
  $type: ACKNOWLEDGEMENT_NSID,
  subject: {
    uri: "at://did:plc:bob/org.hypercerts.claim.activity/3k2abc",
    cid: "bafy...",
  },
  context: {
    uri: "at://did:plc:alice/org.hypercerts.claim.collection/7x9def",
    cid: "bafy...",
  },
  acknowledged: true,
  createdAt: new Date().toISOString(),
};
```

#### Use Case: Contributor Included in an Activity

Alice creates an activity that lists Bob as a contributor. Bob creates
an acknowledgement in his own repo to confirm his participation:

```typescript
const ack = {
  $type: ACKNOWLEDGEMENT_NSID,
  subject: {
    // Bob's contributor information record
    uri: "at://did:plc:bob/org.hypercerts.claim.contributorInformation/abc123",
    cid: "bafy...",
  },
  context: {
    // Alice's activity that lists Bob as contributor
    uri: "at://did:plc:alice/org.hypercerts.claim.activity/3k2abc",
    cid: "bafy...",
  },
  acknowledged: true,
  comment: "Confirming my contribution to this reforestation project",
  createdAt: new Date().toISOString(),
};
```

Setting `acknowledged: false` explicitly rejects inclusion, which an
AppView can use to flag disputed associations.

### Adding Locations to Activities

The `locations` field in activity records is an array of strong references
(`com.atproto.repo.strongRef`) pointing to `app.certified.location` records.
Each strong reference contains two required fields:

- `uri`: The ATProto URI of the location record (e.g., `at://did:plc:alice/app.certified.location/abc123`)
- `cid`: The content identifier (CID) of the location record, ensuring referential integrity

**Validation and Expectations**:

- All location records referenced in the `locations` array must conform to the
  `app.certified.location` lexicon schema
- The `uri` field must be a valid ATProto URI pointing to an existing location record
- The `cid` field must match the current CID of the referenced location record
- The `locations` field is optional; activities can be created without location data

### Adding Location to Collections

Collections can include an optional `location` field to specify where the collection's activities were performed:

```typescript
const collectionRecord = {
  $type: "org.hypercerts.claim.collection",
  title: "Climate Action Projects",
  shortDescription: "A collection of climate-related activities",
  location: {
    uri: "at://did:plc:alice/app.certified.location/xyz789",
    cid: "...",
  },
  items: [
    // ... collection items
  ],
  createdAt: new Date().toISOString(),
};
```

The `location` field is a strong reference to an `app.certified.location` record containing the same `uri` and `cid` fields as described above for activities.

### Creating Attachments

Attachments provide commentary, context, evidence, or documentary material
related to hypercert records. They can be linked to activities, evaluations,
measurements, or even other attachments:

```typescript
import { ATTACHMENT_NSID } from "@hypercerts-org/lexicon";

const attachmentRecord = {
  $type: ATTACHMENT_NSID,
  title: "Field Survey Report",
  subjects: [
    {
      uri: "at://did:plc:alice/org.hypercerts.claim.activity/abc123",
      cid: "...",
    },
  ],
  contentType: "report",
  content: [
    { uri: "https://example.com/reports/survey-2024.pdf" },
    { uri: "ipfs://Qm..." },
  ],
  shortDescription: "Quarterly field survey documenting project progress",
  createdAt: new Date().toISOString(),
};
```

**Key fields:**

- `title` (required): String title for the attachment
- `shortDescription`/`description`: Support rich text via facet annotations
- `subjects` (optional): Array of strong references to records this attachment relates to
- `contentType` (optional): Type descriptor (e.g., "report", "audit", "evidence", "testimonial")
- `content` (required): Array of URIs or blobs containing the attachment files
- `location` (optional): Strong reference to an `app.certified.location` record
- `createdAt` (required): Timestamp when the attachment was created

**Adding Location to Attachments:**

```typescript
const attachmentWithLocation = {
  $type: ATTACHMENT_NSID,
  title: "Site Inspection Photos",
  content: [{ uri: "https://..." }],
  location: {
    uri: "at://did:plc:alice/app.certified.location/loc123",
    cid: "...",
  },
  createdAt: new Date().toISOString(),
};
```
