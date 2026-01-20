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
  workScope: "Scope of work",
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

## Certified Lexicons

Certified lexicons are common/shared lexicons that can be used across multiple protocols.

### Common Definitions

**Lexicon ID:** `org.hypercerts.defs`

**Description:** Common type definitions used across all certified protocols.

#### Defs

| Def          | Type     | Description                               | Comments                                |
| ------------ | -------- | ----------------------------------------- | --------------------------------------- |
| `uri`        | `object` | Object containing a URI to external data  | Has `uri` property (string, format uri) |
| `smallBlob`  | `object` | Object containing a blob to external data | Has `blob` property (blob, up to 10MB)  |
| `largeBlob`  | `object` | Object containing a blob to external data | Has `blob` property (blob, up to 100MB) |
| `smallImage` | `object` | Object containing a small image           | Has `image` property (blob, up to 5MB)  |
| `largeImage` | `object` | Object containing a large image           | Has `image` property (blob, up to 10MB) |

---

### Location Lexicon

**Lexicon ID:** `app.certified.location`

**Description:** A location reference for use across certified protocols. For more information about

**Key:** `tid`

#### Properties

| Property       | Type     | Required | Description                                                                                                               |
| -------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `lpVersion`    | `string` | ✅       | The version of the Location Protocol                                                                                      |
| `srs`          | `string` | ✅       | The Spatial Reference System URI (e.g., http://www.opengis.net/def/crs/OGC/1.3/CRS84) that defines the coordinate system. |
| `locationType` | `string` | ✅       | An identifier for the format of the location data (e.g., coordinate-decimal, geojson-point)                               |
| `location`     | `union`  | ✅       | The location of where the work was performed as a URI or blob.                                                            |
| `name`         | `string` | ❌       | Optional name for this location                                                                                           |
| `description`  | `string` | ❌       | Optional description for this location                                                                                    |
| `createdAt`    | `string` | ✅       | Client-declared timestamp when this record was originally created                                                         |

### Badges Lexicon

**Lexicon IDs:** `app.certified.badge.definition`, `app.certified.badge.award`, `app.certified.badge.response`

**Description:** Defines badge metadata, award records, and recipient responses for certified badges that can be used across protocols.

#### Badge Definition

**Lexicon ID:** `app.certified.badge.definition`

**Key:** `tid`

| Property         | Type     | Required | Description                                                            |
| ---------------- | -------- | -------- | ---------------------------------------------------------------------- |
| `badgeType`      | `string` | ✅       | Category of the badge (e.g., endorsement, participation, affiliation). |
| `title`          | `string` | ✅       | Human-readable title of the badge.                                     |
| `icon`           | `blob`   | ✅       | Icon representing the badge (accepted `image/*` types, maxSize 1MB).   |
| `description`    | `string` | ❌       | Optional short statement describing the badge.                         |
| `allowedIssuers` | `array`  | ❌       | Optional allowlist of DIDs allowed to issue this badge.                |
| `createdAt`      | `string` | ✅       | Client-declared timestamp when this record was originally created.     |

#### Badge Award

**Lexicon ID:** `app.certified.badge.award`

**Key:** `tid`

| Property    | Type     | Required | Description                                                                          |
| ----------- | -------- | -------- | ------------------------------------------------------------------------------------ |
| `badge`     | `ref`    | ✅       | Reference to the badge definition for this award (`app.certified.badge.definition`). |
| `subject`   | `union`  | ✅       | Entity the badge award is for (either a DID or a specific AT Protocol record).       |
| `note`      | `string` | ❌       | Optional explanation for the award.                                                  |
| `createdAt` | `string` | ✅       | Client-declared timestamp when this record was originally created.                   |

#### Badge Response

**Lexicon ID:** `app.certified.badge.response`

**Key:** `tid`

| Property     | Type     | Required | Description                                                            |
| ------------ | -------- | -------- | ---------------------------------------------------------------------- |
| `badgeAward` | `ref`    | ✅       | Reference to the badge award (`app.certified.badge.award`).            |
| `response`   | `string` | ✅       | Enum: `accepted` or `rejected`.                                        |
| `weight`     | `string` | ❌       | Optional relative weight assigned by the recipient (stored as string). |
| `createdAt`  | `string` | ✅       | Client-declared timestamp when this record was originally created.     |

---

## Hypercerts Lexicons

Hypercerts-specific lexicons for tracking impact work and claims.

### Hypercerts Activity Claim

**Lexicon ID:** `org.hypercerts.claim.activity`

**Description:** The main lexicon where everything is connected to. This is the hypercert record that tracks impact work.

**Key:** `any`

#### Properties

| Property           | Type     | Required | Description                                                                                  | Comments                                                                  |
| ------------------ | -------- | -------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `title`            | `string` | ✅       | Title of the hypercert                                                                       |                                                                           |
| `shortDescription` | `string` | ✅       | Short blurb of the impact work done.                                                         |                                                                           |
| `description`      | `string` | ❌       | Optional longer description of the impact work done.                                         |                                                                           |
| `image`            | `union`  | ❌       | The hypercert visual representation as a URI or image blob                                   |                                                                           |
| `workScope`        | `object` | ❌       | Logical scope of the work using label-based conditions                                       | Object with `withinAllOf`, `withinAnyOf`, `withinNoneOf` arrays of labels |
| `startDate`        | `string` | ❌       | When the work began                                                                          |                                                                           |
| `endDate`          | `string` | ❌       | When the work ended                                                                          |                                                                           |
| `contributions`    | `array`  | ❌       | A strong reference to the contributions done to create the impact in the hypercerts          | References must conform to `org.hypercerts.claim.contribution`            |
| `rights`           | `ref`    | ❌       | A strong reference to the rights that this hypercert has                                     | References must conform to `org.hypercerts.claim.rights`                  |
| `locations`        | `ref`    | ❌       | An array of strong references to the locations where the work for done hypercert was located | References must conform to `app.certified.location`                       |
| `createdAt`        | `string` | ✅       | Client-declared timestamp when this record was originally created                            |                                                                           |

#### Defs

##### activityWeight

| Property   | Type     | Required | Description                                                                                                                                                                                                                                                                   |
| ---------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activity` | `ref`    | ✅       | A strong reference to a hypercert activity record. This activity must conform to the lexicon org.hypercerts.claim.activity                                                                                                                                                    |
| `weight`   | `string` | ✅       | The relative weight/importance of this hypercert activity (stored as a string to avoid float precision issues). Weights can be any positive numeric values and do not need to sum to a specific total; normalization can be performed by the consuming application as needed. |

---

### Hypercerts Contribution

**Lexicon ID:** `org.hypercerts.claim.contribution`

**Description:** A contribution made toward a hypercert's impact.

**Key:** `tid`

#### Properties

| Property       | Type     | Required | Description                                                                                                                                                             |
| -------------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `role`         | `string` | ❌       | Role or title of the contributor(s).                                                                                                                                    |
| `contributors` | `array`  | ✅       | List of the contributors (names, pseudonyms, or DIDs). If multiple contributors are stored in the same hypercertContribution, then they would have the exact same role. |
| `description`  | `string` | ❌       | What the contribution concretely achieved                                                                                                                               |
| `startDate`    | `string` | ❌       | When this contribution started. This should be a subset of the hypercert timeframe.                                                                                     |
| `endDate`      | `string` | ❌       | When this contribution finished. This should be a subset of the hypercert timeframe.                                                                                    |
| `createdAt`    | `string` | ✅       | Client-declared timestamp when this record was originally created                                                                                                       |

---

### Hypercerts Evaluation

**Lexicon ID:** `org.hypercerts.claim.evaluation`

**Description:** An evaluation of a hypercert record (e.g. an activity and its impact).

**Key:** `tid`

#### Properties

| Property       | Type     | Required | Description                                                                 | Comments                                                      |
| -------------- | -------- | -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `subject`      | `ref`    | ❌       | A strong reference to what is being evaluated                               | (e.g activity, measurement, contribution, etc.)               |
| `evaluators`   | `array`  | ✅       | DIDs of the evaluators                                                      |                                                               |
| `content`      | `array`  | ❌       | Evaluation data (URIs or blobs) containing detailed reports or methodology  |                                                               |
| `measurements` | `array`  | ❌       | Optional references to the measurements that contributed to this evaluation | References must conform to `org.hypercerts.claim.measurement` |
| `summary`      | `string` | ✅       | Brief evaluation summary                                                    |                                                               |
| `score`        | `object` | ❌       | Optional overall score for this evaluation on a numeric scale               | Object with `min`, `max`, and `value` (integers)              |
| `location`     | `ref`    | ❌       | An optional reference for georeferenced evaluations                         | References must conform to `app.certified.location`           |
| `createdAt`    | `string` | ✅       | Client-declared timestamp when this record was originally created           |                                                               |

---

### Hypercerts Evidence

**Lexicon ID:** `org.hypercerts.claim.evidence`

**Description:** A piece of evidence related to a hypercert record (e.g. an activity, project, claim, or evaluation). Evidence may support, clarify, or challenge the referenced subject.

**Key:** `tid`

#### Properties

| Property           | Type     | Required | Description                                                       | Comments                                             |
| ------------------ | -------- | -------- | ----------------------------------------------------------------- | ---------------------------------------------------- |
| `subject`          | `ref`    | ❌       | A strong reference to the record this evidence relates to         | (e.g. an activity, project, claim, or evaluation)    |
| `content`          | `union`  | ✅       | A piece of evidence (URI or blob) related to the subject record   | May support, clarify, or challenge a hypercert claim |
| `title`            | `string` | ✅       | Title to describe the nature of the evidence                      |                                                      |
| `shortDescription` | `string` | ❌       | Short description explaining what this evidence shows             |                                                      |
| `description`      | `string` | ❌       | Longer description describing the evidence in more detail         |                                                      |
| `relationType`     | `string` | ❌       | How this evidence relates to the subject                          | Known values: `supports`, `challenges`, `clarifies`  |
| `createdAt`        | `string` | ✅       | Client-declared timestamp when this record was originally created |                                                      |

---

### org.hypercerts.claim.measurement

**Lexicon ID:** `org.hypercerts.claim.measurement`

**Description:** Measurement data related to a hypercert record (e.g. an activity and its impact).

**Key:** `tid`

#### Properties

| Property      | Type     | Required | Description                                                                   | Comments                                                     |
| ------------- | -------- | -------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `subject`     | `ref`    | ❌       | A strong reference to the record this measurement refers to                   | (e.g. an activity, project, or claim)                        |
| `measurers`   | `array`  | ✅       | DIDs of the entity (or entities) that measured this data                      |                                                              |
| `metric`      | `string` | ✅       | The metric being measured                                                     |                                                              |
| `value`       | `string` | ✅       | The measured value                                                            |                                                              |
| `methodType`  | `string` | ❌       | Short identifier for the measurement methodology                              |                                                              |
| `methodURI`   | `string` | ❌       | URI to methodology documentation, standard protocol, or measurement procedure |                                                              |
| `evidenceURI` | `array`  | ❌       | URIs to related evidence or underlying data                                   | (e.g. org.hypercerts.claim.evidence records or raw datasets) |
| `location`    | `ref`    | ❌       | A strong reference to the location where the measurement was taken            | References must conform to `app.certified.location`          |
| `createdAt`   | `string` | ✅       | Client-declared timestamp when this record was originally created             |                                                              |

---

### org.hypercerts.claim.collection

**Lexicon ID:** `org.hypercerts.claim.collection`

**Description:** A collection/group of items (activities and/or other collections). Collections support recursive nesting, allowing collections to contain other collections. Use app.certified.location as a sidecar (same TID) for location metadata.

**Key:** `tid`

#### Properties

| Property           | Type     | Required | Description                                                            | Comments                                                                                                                                           |
| ------------------ | -------- | -------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`             | `string` | ❌       | The type of this collection (e.g., 'favorites', 'project')             |                                                                                                                                                    |
| `title`            | `string` | ✅       | The title of this collection                                           | maxLength: 800, maxGraphemes: 80                                                                                                                   |
| `shortDescription` | `string` | ❌       | Short summary of this collection, suitable for previews and list views | maxLength: 3000, maxGraphemes: 300                                                                                                                 |
| `description`      | `ref`    | ❌       | Rich-text description, represented as a Leaflet linear document        | References must conform to `pub.leaflet.pages.linearDocument#main`                                                                                 |
| `items`            | `array`  | ✅       | Array of strong references to items in this collection                 | Items can be activities (`org.hypercerts.claim.activity`) and/or other collections (`org.hypercerts.claim.collection`). Enables recursive nesting. |
| `createdAt`        | `string` | ✅       | Client-declared timestamp when this record was originally created      |                                                                                                                                                    |

#### Example: Creating a Collection with Nested Items

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

---

### org.hypercerts.claim.collection.project

**Lexicon ID:** `org.hypercerts.claim.collection.project`

**Description:** Project-specific metadata for a collection. Uses the sidecar pattern with the same record key (TID) as the collection record. This allows collections to represent projects by adding rich-text descriptions and visual assets.

**Key:** `tid` (same as the collection record)

#### Properties

| Property                  | Type     | Required | Description                                                                     | Comments                                                                                     |
| ------------------------- | -------- | -------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `projectTitle`            | `string` | ❌       | The title of this collection                                                    | maxLength: 800, maxGraphemes: 80                                                             |
| `shortProjectDescription` | `string` | ❌       | Short summary of this project, suitable for previews and list views             | maxLength: 3000, maxGraphemes: 300                                                           |
| `projectDescription`      | `ref`    | ✅       | Rich-text description of this project, represented as a Leaflet linear document | References must conform to `pub.leaflet.pages.linearDocument#main`                           |
| `avatar`                  | `blob`   | ❌       | Primary avatar image representing this project across apps and views            | Typically a square logo or project identity image; image/png or image/jpeg, maxSize: 1000000 |
| `coverPhoto`              | `blob`   | ❌       | The cover photo of this project                                                 | image/png or image/jpeg, maxSize: 1000000                                                    |
| `createdAt`               | `string` | ✅       | Client-declared timestamp when this project metadata was created                |                                                                                              |

#### Example: Creating a Project (Collection + Project Sidecar)

```typescript
import { TID } from "@atproto/common";

const tid = TID.nextStr(); // Same TID for both records

// Base collection record
const collectionRecord = {
  $type: "org.hypercerts.claim.collection",
  title: "Carbon Offset Initiative",
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

// Project sidecar with rich-text description and assets
const projectSidecar = {
  $type: "org.hypercerts.claim.collection.project",
  projectTitle: "Carbon Offset Initiative",
  shortProjectDescription: "A project focused on carbon reduction",
  projectDescription: {
    uri: "at://did:plc:alice/pub.leaflet.pages.linearDocument/abc123",
    cid: "...",
  },
  avatar: avatarBlob,
  coverPhoto: coverPhotoBlob,
  createdAt: new Date().toISOString(),
};

// Create both with same TID
await createRecord({
  collection: "org.hypercerts.claim.collection",
  rkey: tid,
  record: collectionRecord,
});
await createRecord({
  collection: "org.hypercerts.claim.collection.project",
  rkey: tid,
  record: projectSidecar,
});
```

**Note**: The project sidecar is optional. Collections without this sidecar are simple groupings; collections with it are "projects" with rich documentation.

---

### org.hypercerts.claim.rights

**Lexicon ID:** `org.hypercerts.claim.rights`

**Description:** Describes the rights that a contributor and/or an owner has, such as whether the hypercert can be sold, transferred, and under what conditions.

**Key:** `tid`

#### Properties

| Property            | Type     | Required | Description                                                       | Comments    |
| ------------------- | -------- | -------- | ----------------------------------------------------------------- | ----------- |
| `rightsName`        | `string` | ✅       | Full name of the rights                                           |             |
| `rightsType`        | `string` | ✅       | Short rights identifier for easier search                         |             |
| `rightsDescription` | `string` | ✅       | Description of the rights of this hypercert                       |             |
| `attachment`        | `union`  | ❌       | An attachment to define the rights further, e.g. a legal document | URI or blob |
| `createdAt`         | `string` | ✅       | Client-declared timestamp when this record was originally created |             |

---

### org.hypercerts.funding.receipt

**Lexicon ID:** `org.hypercerts.funding.receipt`

**Description:** Records a funding receipt for a payment from one user to another user. It may be recorded by the recipient, by the sender, or by a third party. The sender may remain anonymous.

**Key:** `tid`

#### Properties

| Property         | Type     | Required | Description                                                                                                                 | Comments                                                    |
| ---------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `from`           | `string` | ✅       | DID of the sender who transferred the funds. If sender wants to stay anonymous, mark this explicitly.                       | Format: did                                                 |
| `to`             | `string` | ✅       | The recipient of the funds, who can be identified by DID or a clear-text name.                                              |                                                             |
| `amount`         | `string` | ✅       | Amount of funding received.                                                                                                 |                                                             |
| `currency`       | `string` | ✅       | Currency of the payment (e.g. EUR, USD, ETH).                                                                               |                                                             |
| `paymentRail`    | `string` | ❌       | How the funds were transferred (e.g. bank_transfer, credit_card, onchain, cash, check, payment_processor).                  |                                                             |
| `paymentNetwork` | `string` | ❌       | Optional network within the payment rail (e.g. arbitrum, ethereum, sepa, visa, paypal).                                     |                                                             |
| `transactionId`  | `string` | ❌       | Identifier of the underlying payment transaction (e.g. bank reference, onchain transaction hash, or processor-specific ID). | Use paymentNetwork to specify the network where applicable. |
| `for`            | `string` | ❌       | Optional reference to the activity, project, or organization this funding relates to.                                       | Format: at-uri                                              |
| `notes`          | `string` | ❌       | Optional notes or additional context for this funding receipt.                                                              | maxLength: 500                                              |
| `occurredAt`     | `string` | ❌       | Timestamp when the payment occurred.                                                                                        | Format: datetime                                            |
| `createdAt`      | `string` | ✅       | Client-declared timestamp when this receipt record was created.                                                             | Format: datetime                                            |

---

## Notes

- All timestamps use the `datetime` format (ISO 8601)
- Strong references (`com.atproto.repo.strongRef`) include both the URI and CID of the referenced record
- Union types allow multiple possible formats (e.g., URI or blob)
- Array items may have constraints like `maxLength` to limit the number of elements
- String fields may have both `maxLength` (bytes) and `maxGraphemes` (Unicode grapheme clusters) constraints
