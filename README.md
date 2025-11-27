# Hypercerts Lexicon Documentation

This repository contains ATProto lexicon definitions for the
Hypercerts protocol. Each lexicon defines a record type that can be
stored on the ATProto network.

## Installation

```
npm i @hypercerts-org/lexicon
```

## Usage

```typescript
import { AtpBaseClient } from '@hypercerts-org/lexicon'
import type { HypercertClaim } from '@hypercerts-org/lexicon'

const client = new AtpBaseClient({
  service: 'https://bsky.social',
  headers: { Authorization: `Bearer ${token}` }
})

const hypercert: HypercertClaim = {
  $type: 'org.hypercerts.claim.impact',
  title: 'My Impact Work',
  shortDescription: 'Description here',
  workScope: 'Scope of work',
  workTimeFrameFrom: '2023-01-01T00:00:00Z',
  workTimeFrameTo: '2023-12-31T23:59:59Z',
  createdAt: new Date().toISOString()
}

await client.org.hypercerts.claim.impact.create(
  { repo: 'did:plc:example' },
  hypercert
)
```

## Certified Lexicons

Certified lexicons are common/shared lexicons that can be used across multiple protocols.

### Common Definitions

**Lexicon ID:** `org.hypercerts.defs`

**Description:** Common type definitions used across all certified protocols.

#### Defs

| Def          | Type     | Description                        | Comments |
| ------------ | -------- | ---------------------------------- | -------- |
| `uri`        | `string` | URI to external data               |          |
| `smallBlob`  | `blob`   | Data stored in a PDS (up to 10MB)  |          |
| `largeBlob`  | `blob`   | Data stored in a PDS (up to 100MB) |          |
| `smallImage` | `blob`   | Image stored in a PDS (up to 5MB)  |          |
| `largeImage` | `blob`   | Image stored in a PDS (up to 10MB) |          |

---

### Location Lexicon

**Lexicon ID:** `app.certified.location`

**Description:** A location reference for use across certified protocols. For more information about

**Key:** `any`

#### Properties

| Property       | Type     | Required | Description                                                                                                               | Comments |
| -------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------- | -------- |
| `lpVersion`    | `string` | ✅       | The version of the Location Protocol                                                                                      |          |
| `srs`          | `string` | ✅       | The Spatial Reference System URI (e.g., http://www.opengis.net/def/crs/OGC/1.3/CRS84) that defines the coordinate system. |          |
| `locationType` | `string` | ✅       | An identifier for the format of the location data (e.g., coordinate-decimal, geojson-point)                               |          |
| `location`     | `union`  | ✅       | The location of where the work was performed as a URI or blob.                                                            |          |
| `name`         | `string` | ❌       | Optional name for this location                                                                                           |          |
| `description`  | `string` | ❌       | Optional description for this location                                                                                    |          |
| `createdAt`    | `string` | ✅       | Client-declared timestamp when this record was originally created                                                         |          |

---

## Hypercerts Lexicons

Hypercerts-specific lexicons for tracking impact work and claims.

### Hypercerts Impact Claim

**Lexicon ID:** `org.hypercerts.claim.impact`

**Description:** The main lexicon where everything is connected to. This is the hypercert record that tracks impact work.

**Key:** `any`

#### Properties

| Property            | Type     | Required | Description                                                                         | Comments                                                          |
| ------------------- | -------- | -------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `title`             | `string` | ✅       | Title of the hypercert                                                              |                                                                   |
| `shortDescription`  | `string` | ✅       | Short blurb of the impact work done.                                                |                                                                   |
| `description`       | `string` | ❌       | Optional longer description of the impact work done.                                |                                                                   |
| `image`             | `union`  | ❌       | The hypercert visual representation as a URI or image blob                          |                                                                   |
| `workScope`         | `string` | ✅       | Scope of the work performed                                                         |                                                                   |
| `workTimeFrameFrom` | `string` | ✅       | When the work began                                                                 |                                                                   |
| `workTimeFrameTo`   | `string` | ✅       | When the work ended                                                                 |                                                                   |
| `evidence`          | `array`  | ❌       | Supporting evidence, documentation, or external data URIs                           | References must conform to `org.hypercerts.claim.evidence`        |
| `contributions`     | `array`  | ❌       | A strong reference to the contributions done to create the impact in the hypercerts | References must conform to `org.hypercerts.claim.contribution`    |
| `rights`            | `ref`    | ❌       | A strong reference to the rights that this hypercert has                            | References must conform to `org.hypercerts.claim.rights`          |
| `location`          | `ref`    | ❌       | A strong reference to the location where the work for done hypercert was located    | References must conform to `app.certified.location`               |
| `createdAt`         | `string` | ✅       | Client-declared timestamp when this record was originally created                   |                                                                   |

---

### Hypercerts Contributor

**Lexicon ID:** `org.hypercerts.claim.contribution`

**Description:** A contribution made toward a hypercert's impact.

**Key:** `any`

#### Properties

| Property            | Type     | Required | Description                                                                                                                                                             | Comments                                                                          |
| ------------------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `hypercert`         | `ref`    | ✅       | A strong reference to the hypercert this contribution is for                                                                                                            | The record referenced must conform with the lexicon `org.hypercerts.claim.impact` |
| `role`              | `string` | ❌       | Role or title of the contributor(s).                                                                                                                                    |                                                                                   |
| `contributors`      | `array`  | ✅       | List of the contributors (names, pseudonyms, or DIDs). If multiple contributors are stored in the same hypercertContribution, then they would have the exact same role. |                                                                                   |
| `description`       | `string` | ❌       | What the contribution concretely achieved                                                                                                                               |                                                                                   |
| `workTimeframeFrom` | `string` | ❌       | When this contribution started. This should be a subset of the hypercert timeframe.                                                                                     |                                                                                   |
| `workTimeframeTo`   | `string` | ❌       | When this contribution finished. This should be a subset of the hypercert timeframe.                                                                                    |                                                                                   |
| `createdAt`         | `string` | ✅       | Client-declared timestamp when this record was originally created                                                                                                       |                                                                                   |

---

### Hypercerts Evaluation

**Lexicon ID:** `org.hypercerts.claim.evaluation`

**Description:** An evaluation of a hypercert or other claim

**Key:** `tid`

#### Properties

| Property      | Type     | Required | Description                                                                | Comments                                        |
| ------------- | -------- | -------- | -------------------------------------------------------------------------- | ----------------------------------------------- |
| `subject`     | `ref`    | ✅       | A strong reference to the evaluated claim                                  | (e.g measurement, hypercert, contribution, etc) |
| `evaluators`  | `array`  | ✅       | DIDs of the evaluators                                                     |                                                 |
| `evaluations` | `array`  | ❌       | Evaluation data (URIs or blobs) containing detailed reports or methodology |                                                 |
| `summary`     | `string` | ✅       | Brief evaluation summary                                                   |                                                 |
| `createdAt`   | `string` | ✅       | Client-declared timestamp when this record was originally created          |                                                 |

---

### Hypercerts Evidence

**Lexicon ID:** `org.hypercerts.claim.evidence`

**Description:** A piece of evidence supporting a hypercert claim

**Key:** `any`

#### Properties

| Property           | Type     | Required | Description                                                                | Comments |
| ------------------ | -------- | -------- | -------------------------------------------------------------------------- | -------- |
| `content`          | `union`  | ✅       | A piece of evidence (URI or blobs) supporting a hypercert claim            |          |
| `title`            | `string` | ❌       | Optional title to describe the nature of the evidence                      |          |
| `shortDescription` | `string` | ✅       | Short description explaining what this evidence demonstrates or proves     |          |
| `description`      | `string` | ❌       | Optional longer description describing the impact claim evidence.          |          |
| `createdAt`        | `string` | ✅       | Client-declared timestamp when this hypercert claim was originally created |          |

---

### org.hypercerts.claim.measurement

**Lexicon ID:** `org.hypercerts.claim.measurement`

**Description:** External measurement data supporting a hypercert claim

**Key:** `tid`

#### Properties

| Property               | Type     | Required | Description                                                                   | Comments                                                                          |
| ---------------------- | -------- | -------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `hypercert`            | `ref`    | ✅       | A strong reference to the hypercert that this measurement is for              | The record referenced must conform with the lexicon `org.hypercerts.claim.impact` |
| `measurers`            | `array`  | ✅       | DIDs of the entity (or entities) that measured this data                      |                                                                                   |
| `metric`               | `string` | ✅       | The metric being measured                                                     |                                                                                   |
| `value`                | `string` | ✅       | The measured value                                                            |                                                                                   |
| `measurementMethodURI` | `string` | ❌       | URI to methodology documentation, standard protocol, or measurement procedure |                                                                                   |
| `evidenceURI`          | `array`  | ❌       | URIs to supporting evidence or data                                           |                                                                                   |
| `createdAt`            | `string` | ✅       | Client-declared timestamp when this record was originally created             |                                                                                   |

---

### org.hypercerts.collection

**Lexicon ID:** `org.hypercerts.collection`

**Description:** A collection/group of hypercerts that have a specific property.

**Key:** `tid`

#### Properties

| Property           | Type     | Required | Description                                                             | Comments                          |
| ------------------ | -------- | -------- | ----------------------------------------------------------------------- | --------------------------------- |
| `title`            | `string` | ✅       | The title of this collection                                            |                                   |
| `shortDescription` | `string` | ❌       | A short description of this collection                                  |                                   |
| `coverPhoto`       | `union`  | ❌       | The cover photo of this collection (either in URI format or in a blob). |                                   |
| `claims`           | `array`  | ✅       | Array of claims with their associated weights in this collection        | Each item references `#claimItem` |
| `createdAt`        | `string` | ✅       | Client-declared timestamp when this record was originally created       |                                   |

#### Defs

##### claimItem

| Property | Type     | Required | Description                                                                                                                                                                                  | Comments |
| -------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `claim`  | `ref`    | ✅       | A strong reference to a hypercert claim record. This claim must conform to the lexicon org.hypercerts.claim.impact                                                                           |          |
| `weight` | `string` | ✅       | The weight/importance of this hypercert claim in the collection (a percentage from 0-100, stored as a string to avoid float precision issues). The total claim weights should add up to 100. |          |

---

### org.hypercerts.claim.rights

**Lexicon ID:** `org.hypercerts.claim.rights`

**Description:** Describes the rights that a user has with a hypercert, such as whether it can be sold, transferred, and under what conditions.

**Key:** `any`

#### Properties

| Property            | Type     | Required | Description                                                       | Comments |
| ------------------- | -------- | -------- | ----------------------------------------------------------------- | -------- |
| `rightsName`        | `string` | ✅       | Full name of the rights                                           |          |
| `rightsType`        | `string` | ✅       | Short rights identifier for easier search                         |          |
| `rightsDescription` | `string` | ✅       | Description of the rights of this hypercert                       |          |
| `createdAt`         | `string` | ✅       | Client-declared timestamp when this record was originally created |          |

---

## Notes

- All timestamps use the `datetime` format (ISO 8601)
- Strong references (`com.atproto.repo.strongRef`) include both the URI and CID of the referenced record
- Union types allow multiple possible formats (e.g., URI or blob)
- Array items may have constraints like `maxLength` to limit the number of elements
- String fields may have both `maxLength` (bytes) and `maxGraphemes` (Unicode grapheme clusters) constraints
