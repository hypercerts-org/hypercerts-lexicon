# Schema Reference

> This file is auto-generated from lexicon definitions.
> Do not edit manually.

## Hypercerts Lexicons

Hypercerts-specific lexicons for tracking impact work and claims.

### `org.hypercerts.claim.activity`

**Description:** A hypercert record tracking impact work.

**Key:** `any`

#### Properties

| Property                 | Type     | Required | Description                                                                                                                                             | Comments                             |
| ------------------------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `title`                  | `string` | ✅       | Title of the hypercert.                                                                                                                                 | maxLength: 256                       |
| `shortDescription`       | `string` | ✅       | Short summary of this activity claim, suitable for previews and list views. Rich text annotations may be provided via `shortDescriptionFacets`.         | maxLength: 3000, maxGraphemes: 300   |
| `shortDescriptionFacets` | `ref`    | ❌       | Rich text annotations for `shortDescription` (mentions, URLs, hashtags, etc).                                                                           |                                      |
| `description`            | `string` | ❌       | Optional longer description of this activity claim, including context or interpretation. Rich text annotations may be provided via `descriptionFacets`. | maxLength: 30000, maxGraphemes: 3000 |
| `descriptionFacets`      | `ref`    | ❌       | Rich text annotations for `description` (mentions, URLs, hashtags, etc).                                                                                |                                      |
| `image`                  | `union`  | ❌       | The hypercert visual representation as a URI or image blob.                                                                                             |                                      |
| `workScope`              | `ref`    | ❌       | A strong reference to a record defining the scope of work. The record referenced should describe the logical scope using label-based conditions.        |                                      |
| `startDate`              | `string` | ❌       | When the work began                                                                                                                                     |                                      |
| `endDate`                | `string` | ❌       | When the work ended                                                                                                                                     |                                      |
| `contributors`           | `ref`    | ❌       | An array of contributor objects, each containing contributor information, weight, and contribution details.                                             |                                      |
| `rights`                 | `ref`    | ❌       | A strong reference to the rights that this hypercert has. The record referenced must conform with the lexicon org.hypercerts.claim.rights.              |                                      |
| `locations`              | `ref`    | ❌       | An array of strong references to the location where activity was performed. The record referenced must conform with the lexicon app.certified.location. |                                      |
| `createdAt`              | `string` | ✅       | Client-declared timestamp when this record was originally created                                                                                       |                                      |

#### Defs

##### contributor

| Property                 | Type     | Required | Description                                                                                                                                                                                                                                                        |
| ------------------------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `contributorInformation` | `union`  | ✅       | Contributor information as a string (DID or identifier) or strong reference to for instance org.hypercerts.claim.contributorInformation#main.                                                                                                                      |
| `weight`                 | `string` | ❌       | The relative weight/importance of this contribution (stored as a string to avoid float precision issues). Must be a positive numeric value. Weights do not need to sum to a specific total; normalization can be performed by the consuming application as needed. |
| `contributionDetails`    | `union`  | ❌       | Contribution details as a string or strong reference to org.hypercerts.claim.contributionDetails#main.                                                                                                                                                             |

---

### `org.hypercerts.claim.evaluation`

**Description:** An evaluation of a hypercert record (e.g. an activity and its impact).

**Key:** `tid`

#### Properties

| Property       | Type     | Required | Description                                                                                                                                                          | Comments                            |
| -------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `subject`      | `ref`    | ❌       | A strong reference to what is being evaluated. (e.g activity, measurement, contribution, etc.)                                                                       |                                     |
| `evaluators`   | `ref`    | ✅       | DIDs of the evaluators                                                                                                                                               | maxLength: 1000                     |
| `content`      | `union`  | ❌       | Evaluation data (URIs or blobs) containing detailed reports or methodology                                                                                           | maxLength: 100                      |
| `measurements` | `ref`    | ❌       | Optional references to the measurements that contributed to this evaluation. The record(s) referenced must conform with the lexicon org.hypercerts.claim.measurement | maxLength: 100                      |
| `summary`      | `string` | ✅       | Brief evaluation summary                                                                                                                                             | maxLength: 5000, maxGraphemes: 1000 |
| `score`        | `ref`    | ❌       | Overall score for an evaluation on a numeric scale.                                                                                                                  |                                     |
| `location`     | `ref`    | ❌       | An optional reference for georeferenced evaluations. The record referenced must conform with the lexicon app.certified.location.                                     |                                     |
| `createdAt`    | `string` | ✅       | Client-declared timestamp when this record was originally created                                                                                                    |                                     |

#### Defs

##### score

| Property | Type      | Required | Description                                  |
| -------- | --------- | -------- | -------------------------------------------- |
| `min`    | `integer` | ✅       | Minimum value of the scale, e.g. 0 or 1.     |
| `max`    | `integer` | ✅       | Maximum value of the scale, e.g. 5 or 10.    |
| `value`  | `integer` | ✅       | Score within the inclusive range [min, max]. |

---

### `org.hypercerts.claim.evidence`

**Description:** A piece of evidence related to a hypercert record (e.g. an activity, project, claim, or evaluation). Evidence may support, clarify, or challenge the referenced subject.

**Key:** `tid`

#### Properties

| Property           | Type     | Required | Description                                                                                                               | Comments                                            |
| ------------------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `subject`          | `ref`    | ❌       | A strong reference to the record this evidence relates to (e.g. an activity, project, claim, or evaluation).              |                                                     |
| `content`          | `union`  | ✅       | A piece of evidence (URI or blob) related to the subject record; it may support, clarify, or challenge a hypercert claim. |                                                     |
| `title`            | `string` | ✅       | Title to describe the nature of the evidence.                                                                             | maxLength: 256                                      |
| `shortDescription` | `string` | ❌       | Short description explaining what this evidence shows.                                                                    | maxLength: 3000, maxGraphemes: 300                  |
| `description`      | `string` | ❌       | Longer description describing the evidence in more detail.                                                                | maxLength: 30000, maxGraphemes: 3000                |
| `relationType`     | `string` | ❌       | How this evidence relates to the subject.                                                                                 | Known values: `supports`, `challenges`, `clarifies` |
| `createdAt`        | `string` | ✅       | Client-declared timestamp when this record was originally created                                                         |                                                     |

---

### `org.hypercerts.claim.measurement`

**Description:** Measurement data related to a hypercert record (e.g. an activity and its impact).

**Key:** `tid`

#### Properties

| Property      | Type     | Required | Description                                                                                                                                    | Comments       |
| ------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `subject`     | `ref`    | ❌       | A strong reference to the record this measurement refers to (e.g. an activity, project, or claim).                                             |                |
| `measurers`   | `ref`    | ✅       | DIDs of the entity (or entities) that measured this data                                                                                       | maxLength: 100 |
| `metric`      | `string` | ✅       | The metric being measured                                                                                                                      | maxLength: 500 |
| `value`       | `string` | ✅       | The measured value                                                                                                                             | maxLength: 500 |
| `methodType`  | `string` | ❌       | Short identifier for the measurement methodology                                                                                               | maxLength: 30  |
| `methodURI`   | `string` | ❌       | URI to methodology documentation, standard protocol, or measurement procedure                                                                  |                |
| `evidenceURI` | `string` | ❌       | URIs to related evidence or underlying data (e.g. org.hypercerts.claim.evidence records or raw datasets)                                       | maxLength: 50  |
| `location`    | `ref`    | ❌       | A strong reference to the location where the measurement was taken. The record referenced must conform with the lexicon app.certified.location |                |
| `createdAt`   | `string` | ✅       | Client-declared timestamp when this record was originally created                                                                              |                |

---

### `org.hypercerts.claim.collection`

**Description:** A collection/group of items (activities and/or other collections). Collections support recursive nesting. Use app.certified.location as a sidecar (same TID) for location metadata.

**Key:** `tid`

#### Properties

| Property           | Type     | Required | Description                                                                                                  | Comments                           |
| ------------------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `type`             | `string` | ❌       | The type of this collection. Possible fields can be 'favorites', 'project', or any other type of collection. |                                    |
| `title`            | `string` | ✅       | The title of this collection                                                                                 | maxLength: 800, maxGraphemes: 80   |
| `shortDescription` | `string` | ❌       | Short summary of this collection, suitable for previews and list views                                       | maxLength: 3000, maxGraphemes: 300 |
| `description`      | `ref`    | ❌       | Rich-text description, represented as a Leaflet linear document.                                             |                                    |
| `avatar`           | `union`  | ❌       | The collection's avatar/profile image as a URI or image blob.                                                |                                    |
| `banner`           | `union`  | ❌       | Larger horizontal image to display behind the collection view.                                               |                                    |
| `items`            | `ref`    | ✅       | Array of items in this collection with optional weights.                                                     |                                    |
| `createdAt`        | `string` | ✅       | Client-declared timestamp when this record was originally created                                            |                                    |

#### Defs

##### item

| Property         | Type     | Required | Description                                                                                                                                                                                     |
| ---------------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `itemIdentifier` | `ref`    | ✅       | Strong reference to an item in this collection. Items can be activities (org.hypercerts.claim.activity) and/or other collections (org.hypercerts.claim.collection).                             |
| `itemWeight`     | `string` | ❌       | Optional weight for this item (positive numeric value stored as string). Weights do not need to sum to a specific total; normalization can be performed by the consuming application as needed. |

---

### `org.hypercerts.claim.rights`

**Description:** Describes the rights that a contributor and/or an owner has, such as whether the hypercert can be sold, transferred, and under what conditions.

**Key:** `tid`

#### Properties

| Property            | Type     | Required | Description                                                        | Comments       |
| ------------------- | -------- | -------- | ------------------------------------------------------------------ | -------------- |
| `rightsName`        | `string` | ✅       | Full name of the rights                                            | maxLength: 100 |
| `rightsType`        | `string` | ✅       | Short rights identifier for easier search                          | maxLength: 10  |
| `rightsDescription` | `string` | ✅       | Description of the rights of this hypercert                        |                |
| `attachment`        | `union`  | ❌       | An attachment to define the rights further, e.g. a legal document. |                |
| `createdAt`         | `string` | ✅       | Client-declared timestamp when this record was originally created  |                |

---

### `org.hypercerts.funding.receipt`

**Description:** Records a funding receipt for a payment from one user to another user. It may be recorded by the recipient, by the sender, or by a third party. The sender may remain anonymous.

**Key:** `tid`

#### Properties

| Property         | Type     | Required | Description                                                                                                                                                                             | Comments       |
| ---------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `from`           | `ref`    | ✅       | DID of the sender who transferred the funds. Leave empty if sender wants to stay anonymous.                                                                                             |                |
| `to`             | `string` | ✅       | The recipient of the funds. Can be identified by DID or a clear-text name.                                                                                                              |                |
| `amount`         | `string` | ✅       | Amount of funding received.                                                                                                                                                             |                |
| `currency`       | `string` | ✅       | Currency of the payment (e.g. EUR, USD, ETH).                                                                                                                                           |                |
| `paymentRail`    | `string` | ❌       | How the funds were transferred (e.g. bank_transfer, credit_card, onchain, cash, check, payment_processor).                                                                              |                |
| `paymentNetwork` | `string` | ❌       | Optional network within the payment rail (e.g. arbitrum, ethereum, sepa, visa, paypal).                                                                                                 |                |
| `transactionId`  | `string` | ❌       | Identifier of the underlying payment transaction (e.g. bank reference, onchain transaction hash, or processor-specific ID). Use paymentNetwork to specify the network where applicable. |                |
| `for`            | `string` | ❌       | Optional reference to the activity, project, or organization this funding relates to.                                                                                                   |                |
| `notes`          | `string` | ❌       | Optional notes or additional context for this funding receipt.                                                                                                                          | maxLength: 500 |
| `occurredAt`     | `string` | ❌       | Timestamp when the payment occurred.                                                                                                                                                    |                |
| `createdAt`      | `string` | ✅       | Client-declared timestamp when this receipt record was created.                                                                                                                         |                |

---

## Certified Lexicons

Certified lexicons are common/shared lexicons that can be used across multiple protocols.

### `org.hypercerts.defs`

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

### `app.certified.location`

**Description:** A location reference

**Key:** `tid`

#### Properties

| Property       | Type     | Required | Description                                                                                                               | Comments                                                           |
| -------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `lpVersion`    | `string` | ✅       | The version of the Location Protocol                                                                                      | maxLength: 10                                                      |
| `srs`          | `string` | ✅       | The Spatial Reference System URI (e.g., http://www.opengis.net/def/crs/OGC/1.3/CRS84) that defines the coordinate system. | maxLength: 100                                                     |
| `locationType` | `string` | ✅       | An identifier for the format of the location data (e.g., coordinate-decimal, geojson-point)                               | maxLength: 20, Known values: `coordinate-decimal`, `geojson-point` |
| `location`     | `union`  | ✅       | The location of where the work was performed as a URI or blob.                                                            |                                                                    |
| `name`         | `string` | ❌       | Optional name for this location                                                                                           | maxLength: 1000, maxGraphemes: 100                                 |
| `description`  | `string` | ❌       | Optional description for this location                                                                                    | maxLength: 2000, maxGraphemes: 500                                 |
| `createdAt`    | `string` | ✅       | Client-declared timestamp when this record was originally created                                                         |                                                                    |

---

### `app.certified.badge.definition`

**Description:** Defines a badge that can be awarded via badge award records to users, projects, or activity claims.

**Key:** `tid`

#### Properties

| Property         | Type     | Required | Description                                                                              | Comments                                                                    |
| ---------------- | -------- | -------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `badgeType`      | `string` | ✅       | Category of the badge (e.g. endorsement, participation, affiliation).                    |                                                                             |
| `title`          | `string` | ✅       | Human-readable title of the badge.                                                       |                                                                             |
| `icon`           | `blob`   | ✅       | Icon representing the badge, stored as a blob for compact visual display.                | maxSize: 1048576, accepts: image/png, image/jpeg, image/webp, image/svg+xml |
| `description`    | `string` | ❌       | Optional short statement describing what the badge represents.                           |                                                                             |
| `allowedIssuers` | `ref`    | ❌       | Optional allowlist of DIDs allowed to issue this badge. If omitted, anyone may issue it. |                                                                             |
| `createdAt`      | `string` | ✅       | Client-declared timestamp when this record was originally created                        |                                                                             |

---

### `app.certified.badge.award`

**Description:** Records a badge award to a user, project, or activity claim.

**Key:** `tid`

#### Properties

| Property    | Type     | Required | Description                                                                                                                                     |
| ----------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `badge`     | `ref`    | ✅       | Reference to the badge definition for this award.                                                                                               |
| `subject`   | `union`  | ✅       | Entity the badge award is for (either an account DID or any specific AT Protocol record), e.g. a user, a project, or a specific activity claim. |
| `note`      | `string` | ❌       | Optional statement explaining the reason for this badge award.                                                                                  |
| `createdAt` | `string` | ✅       | Client-declared timestamp when this record was originally created                                                                               |

---

### `app.certified.badge.response`

**Description:** Recipient response to a badge award.

**Key:** `tid`

#### Properties

| Property     | Type     | Required | Description                                                              |
| ------------ | -------- | -------- | ------------------------------------------------------------------------ |
| `badgeAward` | `ref`    | ✅       | Reference to the badge award.                                            |
| `response`   | `string` | ✅       | The recipient’s response for the badge (accepted or rejected).           |
| `weight`     | `string` | ❌       | Optional relative weight for accepted badges, assigned by the recipient. |
| `createdAt`  | `string` | ✅       | Client-declared timestamp when this record was originally created        |

---

## Notes

- All timestamps use the `datetime` format (ISO 8601)
- Strong references (`com.atproto.repo.strongRef`) include both the URI and CID of the referenced record
- Union types allow multiple possible formats (e.g., URI or blob)
- Array items may have constraints like `maxLength` to limit the number of elements
- String fields may have both `maxLength` (bytes) and `maxGraphemes` (Unicode grapheme clusters) constraints
