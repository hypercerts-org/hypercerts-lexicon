# Schema Reference

> This file is auto-generated from lexicon definitions.
> Do not edit manually.

## Hypercerts Lexicons

Hypercerts-specific lexicons for tracking impact work and claims.

### `org.hypercerts.claim.activity`

**Description:** A hypercert record tracking impact work.

**Key:** `any`

#### Properties

| Property                 | Type     | Required | Description                                                                                                                                             | Comments                           |
| ------------------------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `title`                  | `string` | ✅       | Display title summarizing the impact work (e.g. 'Reforestation in Amazon Basin 2024')                                                                   | maxLength: 256                     |
| `shortDescription`       | `string` | ✅       | Short summary of this activity claim, suitable for previews and list views. Rich text annotations may be provided via `shortDescriptionFacets`.         | maxLength: 3000, maxGraphemes: 300 |
| `shortDescriptionFacets` | `ref[]`  | ❌       | Rich text annotations for `shortDescription` (mentions, URLs, hashtags, etc).                                                                           |                                    |
| `description`            | `ref`    | ❌       | Rich-text description, represented as a Leaflet linear document.                                                                                        |                                    |
| `image`                  | `union`  | ❌       | The hypercert visual representation as a URI or image blob.                                                                                             |                                    |
| `contributors`           | `ref[]`  | ❌       | An array of contributor objects, each containing contributor information, weight, and contribution details.                                             | maxLength: 1000                    |
| `workScope`              | `union`  | ❌       | Work scope definition. A CEL expression for structured, machine-evaluable scopes or a free-form string for simple and legacy scopes.                    |                                    |
| `startDate`              | `string` | ❌       | When the work began                                                                                                                                     |                                    |
| `endDate`                | `string` | ❌       | When the work ended                                                                                                                                     |                                    |
| `locations`              | `ref[]`  | ❌       | An array of strong references to the location where activity was performed. The record referenced must conform with the lexicon app.certified.location. | maxLength: 1000                    |
| `rights`                 | `ref`    | ❌       | A strong reference to the rights that this hypercert has. The record referenced must conform with the lexicon org.hypercerts.claim.rights.              |                                    |
| `createdAt`              | `string` | ✅       | Client-declared timestamp when this record was originally created                                                                                       |                                    |

#### Defs

##### `org.hypercerts.claim.activity#contributor`

| Property              | Type     | Required | Description                                                                                                                                                                                                                                                                                       |
| --------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contributorIdentity` | `union`  | ✅       | Inline contributor identity object with an identity string (DID or identifier) via org.hypercerts.claim.activity#contributorIdentity, or a strong reference to a contributor information record. The record referenced must conform with the lexicon org.hypercerts.claim.contributorInformation. |
| `contributionWeight`  | `string` | ❌       | The relative weight/importance of this contribution (stored as a string to avoid float precision issues). Must be a positive numeric value. Weights do not need to sum to a specific total; normalization can be performed by the consuming application as needed.                                |
| `contributionDetails` | `union`  | ❌       | Inline contribution role object with a role string via org.hypercerts.claim.activity#contributorRole, or a strong reference to a contribution details record. The record referenced must conform with the lexicon org.hypercerts.claim.contribution.                                              |

##### `org.hypercerts.claim.activity#contributorIdentity`

| Property   | Type     | Required | Description                                          |
| ---------- | -------- | -------- | ---------------------------------------------------- |
| `identity` | `string` | ✅       | The contributor identity string (DID or identifier). |

##### `org.hypercerts.claim.activity#contributorRole`

| Property | Type     | Required | Description                       |
| -------- | -------- | -------- | --------------------------------- |
| `role`   | `string` | ✅       | The contribution role or details. |

##### `org.hypercerts.claim.activity#workScopeString`

| Property | Type     | Required | Description                        |
| -------- | -------- | -------- | ---------------------------------- |
| `scope`  | `string` | ✅       | The work scope description string. |

---

### `org.hypercerts.claim.contribution`

**Description:** Details about a specific contribution including role, description, and timeframe.

**Key:** `tid`

#### Properties

| Property                  | Type     | Required | Description                                                                           | Comments                             |
| ------------------------- | -------- | -------- | ------------------------------------------------------------------------------------- | ------------------------------------ |
| `role`                    | `string` | ❌       | Role or title of the contributor.                                                     | maxLength: 100                       |
| `contributionDescription` | `string` | ❌       | Description of what the contribution concretely involved.                             | maxLength: 10000, maxGraphemes: 1000 |
| `startDate`               | `string` | ❌       | When this contribution started. Should fall within the parent hypercert's timeframe.  |                                      |
| `endDate`                 | `string` | ❌       | When this contribution finished. Should fall within the parent hypercert's timeframe. |                                      |
| `createdAt`               | `string` | ✅       | Client-declared timestamp when this record was originally created.                    |                                      |

---

### `org.hypercerts.claim.contributorInformation`

**Description:** Contributor information including identifier, display name, and image.

**Key:** `tid`

#### Properties

| Property      | Type     | Required | Description                                                        | Comments        |
| ------------- | -------- | -------- | ------------------------------------------------------------------ | --------------- |
| `identifier`  | `string` | ❌       | DID (did:plc:...) or URI to a social profile of the contributor.   | maxLength: 2048 |
| `displayName` | `string` | ❌       | Human-readable name for the contributor as it should appear in UI. | maxLength: 100  |
| `image`       | `union`  | ❌       | The contributor visual representation as a URI or image blob.      |                 |
| `createdAt`   | `string` | ✅       | Client-declared timestamp when this record was originally created. |                 |

---

### `org.hypercerts.claim.rights`

**Description:** Describes the rights that a contributor and/or an owner has, such as whether the hypercert can be sold, transferred, and under what conditions.

**Key:** `tid`

#### Properties

| Property            | Type     | Required | Description                                                                                            | Comments                             |
| ------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| `rightsName`        | `string` | ✅       | Human-readable name for these rights (e.g. 'All Rights Reserved', 'CC BY-SA 4.0')                      | maxLength: 100                       |
| `rightsType`        | `string` | ✅       | Short identifier code for this rights type (e.g. 'ARR', 'CC-BY-SA') to facilitate filtering and search | maxLength: 10                        |
| `rightsDescription` | `string` | ✅       | Detailed explanation of the rights holders' permissions, restrictions, and conditions                  | maxLength: 10000, maxGraphemes: 1000 |
| `attachment`        | `union`  | ❌       | An attachment to define the rights further, e.g. a legal document.                                     |                                      |
| `createdAt`         | `string` | ✅       | Client-declared timestamp when this record was originally created                                      |                                      |

---

### `org.hypercerts.collection`

**Description:** A collection/group of items (activities and/or other collections). Collections support recursive nesting.

**Key:** `tid`

#### Properties

| Property           | Type     | Required | Description                                                                                                                                                       | Comments                                                                    |
| ------------------ | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `type`             | `string` | ❌       | The type of this collection. Values beyond the known set are permitted.                                                                                           | maxLength: 64, Known values: `favorites`, `project`, `portfolio`, `program` |
| `title`            | `string` | ✅       | Display name for this collection (e.g. 'Q1 2025 Impact Projects')                                                                                                 | maxLength: 800, maxGraphemes: 80                                            |
| `shortDescription` | `string` | ❌       | Short summary of this collection, suitable for previews and list views                                                                                            | maxLength: 3000, maxGraphemes: 300                                          |
| `description`      | `ref`    | ❌       | Rich-text description, represented as a Leaflet linear document.                                                                                                  |                                                                             |
| `avatar`           | `union`  | ❌       | The collection's avatar/profile image as a URI or image blob.                                                                                                     |                                                                             |
| `banner`           | `union`  | ❌       | Larger horizontal image to display behind the collection view.                                                                                                    |                                                                             |
| `items`            | `ref[]`  | ❌       | Array of items in this collection with optional weights.                                                                                                          | maxLength: 1000                                                             |
| `location`         | `ref`    | ❌       | A strong reference to the location where this collection's activities were performed. The record referenced must conform with the lexicon app.certified.location. |                                                                             |
| `createdAt`        | `string` | ✅       | Client-declared timestamp when this record was originally created                                                                                                 |                                                                             |

#### Defs

##### `org.hypercerts.collection#item`

| Property         | Type     | Required | Description                                                                                                                                                                                     |
| ---------------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `itemIdentifier` | `ref`    | ✅       | Strong reference to an item in this collection. Items can be activities (org.hypercerts.claim.activity) and/or other collections (org.hypercerts.collection).                                   |
| `itemWeight`     | `string` | ❌       | Optional weight for this item (positive numeric value stored as string). Weights do not need to sum to a specific total; normalization can be performed by the consuming application as needed. |

---

### `org.hypercerts.context.acknowledgement`

**Description:** Acknowledges a record (subject) or its relationship in a context. Created in the acknowledging actor's repo to form a bidirectional link. Examples: a contributor acknowledging inclusion in an activity, an activity owner acknowledging inclusion in a collection, or a record owner acknowledging an evaluation.

**Key:** `tid`

#### Properties

| Property       | Type      | Required | Description                                                                                                                                                                                                          | Comments                             |
| -------------- | --------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `subject`      | `ref`     | ✅       | The record being acknowledged (e.g. an activity, a contributor information record, an evaluation).                                                                                                                   |                                      |
| `context`      | `union`   | ❌       | Context for the acknowledgement (e.g. the collection that includes an activity, or the activity that includes a contributor). A URI for a lightweight reference or a strong reference for content-hash verification. |                                      |
| `acknowledged` | `boolean` | ✅       | Whether the relationship is acknowledged (true) or rejected (false).                                                                                                                                                 |                                      |
| `comment`      | `string`  | ❌       | Optional plain-text comment providing additional context or reasoning.                                                                                                                                               | maxLength: 10000, maxGraphemes: 1000 |
| `createdAt`    | `string`  | ✅       | Client-declared timestamp when this record was originally created.                                                                                                                                                   |                                      |

---

### `org.hypercerts.context.attachment`

**Description:** An attachment providing commentary, context, evidence, or documentary material related to a hypercert record (e.g. an activity, project, claim, or evaluation).

**Key:** `tid`

#### Properties

| Property                 | Type      | Required | Description                                                                                                                                                                                                                               | Comments                                                                                 |
| ------------------------ | --------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `subjects`               | `ref[]`   | ❌       | References to the subject(s) the attachment is connected to—this may be an activity claim, outcome claim, measurement, evaluation, or even another attachment. This is optional as the attachment can exist before the claim is recorded. | maxLength: 100                                                                           |
| `contentType`            | `string`  | ❌       | The type of attachment. Values beyond the known set are permitted.                                                                                                                                                                        | maxLength: 64, Known values: `report`, `audit`, `evidence`, `testimonial`, `methodology` |
| `content`                | `union[]` | ❌       | The files, documents, or external references included in this attachment record.                                                                                                                                                          | maxLength: 100                                                                           |
| `title`                  | `string`  | ✅       | Display title for this attachment (e.g. 'Impact Assessment Report', 'Audit Findings')                                                                                                                                                     | maxLength: 256                                                                           |
| `shortDescription`       | `string`  | ❌       | Short summary of this attachment, suitable for previews and list views. Rich text annotations may be provided via `shortDescriptionFacets`.                                                                                               | maxLength: 3000, maxGraphemes: 300                                                       |
| `shortDescriptionFacets` | `ref[]`   | ❌       | Rich text annotations for `shortDescription` (mentions, URLs, hashtags, etc).                                                                                                                                                             |                                                                                          |
| `description`            | `ref`     | ❌       | Rich-text description, represented as a Leaflet linear document.                                                                                                                                                                          |                                                                                          |
| `location`               | `ref`     | ❌       | A strong reference to the location where this attachment's subject matter occurred. The record referenced must conform with the lexicon app.certified.location.                                                                           |                                                                                          |
| `createdAt`              | `string`  | ✅       | Client-declared timestamp when this record was originally created.                                                                                                                                                                        |                                                                                          |

---

### `org.hypercerts.context.evaluation`

**Description:** An evaluation of a hypercert record (e.g. an activity and its impact).

**Key:** `tid`

#### Properties

| Property       | Type      | Required | Description                                                                                                                                                            | Comments                            |
| -------------- | --------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `subject`      | `ref`     | ❌       | A strong reference to what is being evaluated (e.g. activity, measurement, contribution, etc.)                                                                         |                                     |
| `evaluators`   | `ref[]`   | ✅       | DIDs of the evaluators                                                                                                                                                 | maxLength: 1000                     |
| `content`      | `union[]` | ❌       | Evaluation data (URIs or blobs) containing detailed reports or methodology                                                                                             | maxLength: 100                      |
| `measurements` | `ref[]`   | ❌       | Optional references to the measurements that contributed to this evaluation. The record(s) referenced must conform with the lexicon org.hypercerts.context.measurement | maxLength: 100                      |
| `summary`      | `string`  | ✅       | Brief evaluation summary                                                                                                                                               | maxLength: 5000, maxGraphemes: 1000 |
| `score`        | `ref`     | ❌       | Overall score for an evaluation on a numeric scale.                                                                                                                    |                                     |
| `location`     | `ref`     | ❌       | An optional reference for georeferenced evaluations. The record referenced must conform with the lexicon app.certified.location.                                       |                                     |
| `createdAt`    | `string`  | ✅       | Client-declared timestamp when this record was originally created                                                                                                      |                                     |

#### Defs

##### `org.hypercerts.context.evaluation#score`

| Property | Type      | Required | Description                                  |
| -------- | --------- | -------- | -------------------------------------------- |
| `min`    | `integer` | ✅       | Minimum value of the scale, e.g. 0 or 1.     |
| `max`    | `integer` | ✅       | Maximum value of the scale, e.g. 5 or 10.    |
| `value`  | `integer` | ✅       | Score within the inclusive range [min, max]. |

---

### `org.hypercerts.context.measurement`

**Description:** Measurement data related to one or more records (e.g. activities, projects, etc.).

**Key:** `tid`

#### Properties

| Property        | Type       | Required | Description                                                                                                                                             | Comments                           |
| --------------- | ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `subjects`      | `ref[]`    | ❌       | Strong references to the records this measurement refers to (e.g. activities, projects, or claims).                                                     | maxLength: 100                     |
| `metric`        | `string`   | ✅       | The metric being measured, e.g. forest area restored, number of users, etc.                                                                             | maxLength: 500                     |
| `unit`          | `string`   | ✅       | The unit of the measured value (e.g. kg CO₂e, hectares, %, index score).                                                                                | maxLength: 50                      |
| `value`         | `string`   | ✅       | The measured value as a numeric string (e.g. '1234.56')                                                                                                 | maxLength: 500                     |
| `startDate`     | `string`   | ❌       | The start date and time when the measurement began.                                                                                                     |                                    |
| `endDate`       | `string`   | ❌       | The end date and time when the measurement ended. For one-time measurements, this should equal the start date.                                          |                                    |
| `locations`     | `ref[]`    | ❌       | Optional geographic references related to where the measurement was taken. Each referenced record must conform with the app.certified.location lexicon. | maxLength: 100                     |
| `methodType`    | `string`   | ❌       | Short identifier for the measurement methodology                                                                                                        | maxLength: 30                      |
| `methodURI`     | `string`   | ❌       | URI to methodology documentation, standard protocol, or measurement procedure                                                                           |                                    |
| `evidenceURI`   | `string[]` | ❌       | URIs to related evidence or underlying data (e.g. org.hypercerts.claim.evidence records or raw datasets)                                                | maxLength: 50                      |
| `measurers`     | `ref[]`    | ❌       | DIDs of the entities that performed this measurement                                                                                                    | maxLength: 100                     |
| `comment`       | `string`   | ❌       | Short comment of this measurement, suitable for previews and list views. Rich text annotations may be provided via `commentFacets`.                     | maxLength: 3000, maxGraphemes: 300 |
| `commentFacets` | `ref[]`    | ❌       | Rich text annotations for `comment` (mentions, URLs, hashtags, etc).                                                                                    |                                    |
| `createdAt`     | `string`   | ✅       | Client-declared timestamp when this record was originally created                                                                                       |                                    |

---

### `org.hypercerts.funding.receipt`

**Description:** Records a funding receipt for a payment from one user to another user. It may be recorded by the recipient, by the sender, or by a third party. The sender may remain anonymous.

**Key:** `tid`

#### Properties

| Property         | Type     | Required | Description                                                                                                                                                                             | Comments        |
| ---------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `from`           | `ref`    | ❌       | DID of the sender who transferred the funds. This field is optional, and can be left undefined to represent anonymity.                                                                  |                 |
| `to`             | `string` | ✅       | The recipient of the funds. Can be identified by DID or a clear-text name.                                                                                                              | maxLength: 2048 |
| `amount`         | `string` | ✅       | Amount of funding received as a numeric string (e.g. '1000.50').                                                                                                                        | maxLength: 50   |
| `currency`       | `string` | ✅       | Currency of the payment (e.g. EUR, USD, ETH).                                                                                                                                           | maxLength: 10   |
| `paymentRail`    | `string` | ❌       | How the funds were transferred (e.g. bank_transfer, credit_card, onchain, cash, check, payment_processor).                                                                              | maxLength: 50   |
| `paymentNetwork` | `string` | ❌       | Optional network within the payment rail (e.g. arbitrum, ethereum, sepa, visa, paypal).                                                                                                 | maxLength: 50   |
| `transactionId`  | `string` | ❌       | Identifier of the underlying payment transaction (e.g. bank reference, onchain transaction hash, or processor-specific ID). Use paymentNetwork to specify the network where applicable. | maxLength: 256  |
| `for`            | `string` | ❌       | Optional reference to the activity, project, or organization this funding relates to.                                                                                                   |                 |
| `notes`          | `string` | ❌       | Optional notes or additional context for this funding receipt.                                                                                                                          | maxLength: 500  |
| `occurredAt`     | `string` | ❌       | Timestamp when the payment occurred.                                                                                                                                                    |                 |
| `createdAt`      | `string` | ✅       | Client-declared timestamp when this receipt record was created.                                                                                                                         |                 |

---

### `org.hypercerts.workscope.cel`

**Description:** A structured, machine-evaluable work scope definition using CEL (Common Expression Language). Tags referenced in the expression correspond to org.hypercerts.workscope.tag keys. See https://github.com/google/cel-spec. Note: this is intentionally type 'object' (not 'record') so it can be directly embedded inline in union types (e.g., activity.workScope) without requiring a separate collection or strongRef indirection.

#### Properties

| Property     | Type     | Required | Description                                                                                                                                                                         | Comments                             |
| ------------ | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `expression` | `string` | ✅       | A CEL expression encoding the work scope conditions. Example: scope.hasAll(['mangrove_restoration', 'environmental_education']) && location.country == 'KE'                         | maxLength: 10000, maxGraphemes: 5000 |
| `usedTags`   | `ref[]`  | ✅       | Strong references to org.hypercerts.workscope.tag records used in the expression. Enables fast indexing by AT-URI and provides referential integrity to the underlying tag records. | maxLength: 100                       |
| `version`    | `string` | ✅       | CEL context schema version.                                                                                                                                                         | maxLength: 16, Known values: `v1`    |
| `createdAt`  | `string` | ✅       | Client-declared timestamp when this expression was originally created.                                                                                                              |                                      |

---

### `org.hypercerts.workscope.tag`

**Description:** A reusable scope atom for work scope logic expressions. Scopes can represent topics, languages, domains, deliverables, methods, regions, tags, or other categorical labels. Tags are composed into structured expressions via CEL (Common Expression Language) on activity records.

**Key:** `tid`

#### Properties

| Property            | Type       | Required | Description                                                                                                                                                                            | Comments                                                             |
| ------------------- | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `key`               | `string`   | ✅       | Lowercase, underscore-separated machine-readable key for this scope (e.g., 'mangrove_restoration', 'biodiversity_monitoring'). Used as the canonical identifier in CEL expressions.    | maxLength: 120                                                       |
| `name`              | `string`   | ✅       | Human-readable name for this scope.                                                                                                                                                    | maxLength: 200                                                       |
| `category`          | `string`   | ❌       | Category type of this scope.                                                                                                                                                           | maxLength: 50, Known values: `topic`, `language`, `domain`, `method` |
| `description`       | `string`   | ❌       | Optional longer description of this scope.                                                                                                                                             | maxLength: 10000, maxGraphemes: 1000                                 |
| `parent`            | `ref`      | ❌       | Optional strong reference to a parent work scope tag record for taxonomy/hierarchy support. The record referenced must conform with the lexicon org.hypercerts.workscope.tag.          |                                                                      |
| `status`            | `string`   | ❌       | Lifecycle status of this tag. Communities propose tags, curators accept them, deprecated tags point to replacements via supersededBy.                                                  | maxLength: 20, Known values: `proposed`, `accepted`, `deprecated`    |
| `supersededBy`      | `ref`      | ❌       | When status is 'deprecated', points to the replacement work scope tag record. The record referenced must conform with the lexicon org.hypercerts.workscope.tag.                        |                                                                      |
| `aliases`           | `string[]` | ❌       | Alternative human-readable names for this scope (e.g., translations, abbreviations, or common synonyms). Unlike sameAs, these are plain-text labels, not links to external ontologies. | maxLength: 50                                                        |
| `sameAs`            | `string[]` | ❌       | URIs to semantically equivalent concepts in external ontologies or taxonomies (e.g., Wikidata QIDs, ENVO terms, SDG targets). Used for interoperability, not as documentation.         | maxLength: 20                                                        |
| `referenceDocument` | `union`    | ❌       | Link to a governance or reference document where this work scope tag is defined and further explained.                                                                                 |                                                                      |
| `createdAt`         | `string`   | ✅       | Client-declared timestamp when this record was originally created.                                                                                                                     |                                                                      |

---

## Certified Lexicons

Certified lexicons are common/shared lexicons that can be used across multiple protocols.

### `app.certified.location`

**Description:** A location reference

**Key:** `tid`

#### Properties

| Property       | Type     | Required | Description                                                                                                                                                                                                                               | Comments                                                                                                                              |
| -------------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `lpVersion`    | `string` | ✅       | The version of the Location Protocol                                                                                                                                                                                                      | maxLength: 10                                                                                                                         |
| `srs`          | `string` | ✅       | The Spatial Reference System URI (e.g., http://www.opengis.net/def/crs/OGC/1.3/CRS84) that defines the coordinate system.                                                                                                                 | maxLength: 100                                                                                                                        |
| `locationType` | `string` | ✅       | An identifier for the format of the location data (e.g., coordinate-decimal, geojson-point). See the Location Protocol spec for the full registry: https://spec.decentralizedgeo.org/specification/location-types/#location-type-registry | maxLength: 20, Known values: `coordinate-decimal`, `geojson-point`, `geojson`, `h3`, `geohash`, `wkt`, `address`, `scaledCoordinates` |
| `location`     | `union`  | ✅       | The location of where the work was performed as a URI, blob, or inline string.                                                                                                                                                            |                                                                                                                                       |
| `name`         | `string` | ❌       | Human-readable name for this location (e.g. 'Golden Gate Park', 'San Francisco Bay Area')                                                                                                                                                 | maxLength: 1000, maxGraphemes: 100                                                                                                    |
| `description`  | `string` | ❌       | Additional context about this location, such as its significance to the work or specific boundaries                                                                                                                                       | maxLength: 2000, maxGraphemes: 500                                                                                                    |
| `createdAt`    | `string` | ✅       | Client-declared timestamp when this record was originally created                                                                                                                                                                         |                                                                                                                                       |

#### Defs

##### `app.certified.location#string`

| Property | Type     | Required | Description               |
| -------- | -------- | -------- | ------------------------- |
| `string` | `string` | ✅       | The location string value |

---

### `app.certified.badge.definition`

**Description:** Defines a badge that can be awarded via badge award records to users, projects, or activity claims.

**Key:** `tid`

#### Properties

| Property         | Type     | Required | Description                                                                              | Comments                                                                    |
| ---------------- | -------- | -------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `badgeType`      | `string` | ✅       | Category of the badge (e.g. endorsement, participation, affiliation).                    | maxLength: 100                                                              |
| `title`          | `string` | ✅       | Human-readable title of the badge.                                                       | maxLength: 256                                                              |
| `icon`           | `blob`   | ❌       | Icon representing the badge, stored as a blob for compact visual display.                | maxSize: 1048576, accepts: image/png, image/jpeg, image/webp, image/svg+xml |
| `description`    | `string` | ❌       | Optional short statement describing what the badge represents.                           | maxLength: 5000, maxGraphemes: 500                                          |
| `allowedIssuers` | `ref[]`  | ❌       | Optional allowlist of DIDs allowed to issue this badge. If omitted, anyone may issue it. | maxLength: 100                                                              |
| `createdAt`      | `string` | ✅       | Client-declared timestamp when this record was originally created                        |                                                                             |

---

### `app.certified.badge.award`

**Description:** Records a badge award to a user, project, or activity claim.

**Key:** `tid`

#### Properties

| Property    | Type     | Required | Description                                                                                                                                     | Comments        |
| ----------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `badge`     | `ref`    | ✅       | Reference to the badge definition for this award.                                                                                               |                 |
| `subject`   | `union`  | ✅       | Entity the badge award is for (either an account DID or any specific AT Protocol record), e.g. a user, a project, or a specific activity claim. |                 |
| `note`      | `string` | ❌       | Optional statement explaining the reason for this badge award.                                                                                  | maxLength: 500  |
| `url`       | `string` | ❌       | Optional URL the badge award links to.                                                                                                          | maxLength: 2048 |
| `createdAt` | `string` | ✅       | Client-declared timestamp when this record was originally created                                                                               |                 |

---

### `app.certified.badge.response`

**Description:** Recipient response to a badge award.

**Key:** `tid`

#### Properties

| Property     | Type     | Required | Description                                                              | Comments                             |
| ------------ | -------- | -------- | ------------------------------------------------------------------------ | ------------------------------------ |
| `badgeAward` | `ref`    | ✅       | Reference to the badge award.                                            |                                      |
| `response`   | `string` | ✅       | The recipient’s response for the badge (accepted or rejected).           | Known values: `accepted`, `rejected` |
| `weight`     | `string` | ❌       | Optional relative weight for accepted badges, assigned by the recipient. | maxLength: 50                        |
| `createdAt`  | `string` | ✅       | Client-declared timestamp when this record was originally created        |                                      |

---

### `app.certified.actor.organization`

**Description:** Extended metadata for an organization actor. Complements the base actor profile with organization-specific fields like legal structure and reference links.

**Key:** `literal:self`

#### Properties

| Property           | Type       | Required | Description                                                                                                                                                                                                                                    | Comments      |
| ------------------ | ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `organizationType` | `string[]` | ❌       | Legal or operational structures of the organization (e.g. 'nonprofit', 'ngo', 'government', 'social-enterprise', 'cooperative').                                                                                                               | maxLength: 10 |
| `urls`             | `ref[]`    | ❌       | Additional reference URLs (social media profiles, contact pages, donation links, etc.) with a display label for each URL.                                                                                                                      |               |
| `location`         | `ref`      | ❌       | A strong reference to the location where the organization is based. The record referenced must conform with the lexicon app.certified.location.                                                                                                |               |
| `foundedDate`      | `string`   | ❌       | When the organization was established. Stored as datetime per ATProto conventions (no date-only format exists). Clients should use midnight UTC (e.g., '2005-01-01T00:00:00.000Z'); consumers should treat only the date portion as canonical. |               |
| `createdAt`        | `string`   | ✅       | Client-declared timestamp when this record was originally created.                                                                                                                                                                             |               |

#### Defs

##### `app.certified.actor.organization#urlItem`

| Property | Type     | Required | Description                                                                        |
| -------- | -------- | -------- | ---------------------------------------------------------------------------------- |
| `url`    | `string` | ✅       | The URL.                                                                           |
| `label`  | `string` | ❌       | Optional human-readable label for this URL (e.g. 'Support page', 'Donation page'). |

---

### `app.certified.actor.profile`

**Description:** A declaration of a Certified account profile.

**Key:** `literal:self`

#### Properties

| Property      | Type     | Required | Description                                                                    | Comments                           |
| ------------- | -------- | -------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| `displayName` | `string` | ❌       | Display name for the account                                                   | maxLength: 640, maxGraphemes: 64   |
| `description` | `string` | ❌       | Free-form profile description text.                                            | maxLength: 2560, maxGraphemes: 256 |
| `pronouns`    | `string` | ❌       | Free-form pronouns text.                                                       | maxLength: 200, maxGraphemes: 20   |
| `website`     | `string` | ❌       | Account website URL                                                            |                                    |
| `avatar`      | `union`  | ❌       | Small image to be displayed next to posts from account. AKA, 'profile picture' |                                    |
| `banner`      | `union`  | ❌       | Larger horizontal image to display behind profile view.                        |                                    |
| `createdAt`   | `string` | ✅       | Client-declared timestamp when this record was originally created              |                                    |

---

### `app.certified.link.evm`

**Description:** A verifiable link between an ATProto DID and an EVM wallet address, proven via a cryptographic signature. Currently supports EOA wallets via EIP-712 typed data signatures; the proof field is an open union to allow future signature methods.

**Key:** `any`

#### Properties

| Property    | Type     | Required | Description                                                                                                                                                                                   | Comments      |
| ----------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `address`   | `string` | ✅       | EVM wallet address (0x-prefixed, with EIP-55 checksum recommended).                                                                                                                           | maxLength: 42 |
| `proof`     | `union`  | ✅       | Cryptographic proof of wallet ownership. The union is open to allow future proof methods (e.g. ERC-1271, ERC-6492). Each variant bundles its signature with the corresponding message format. |               |
| `createdAt` | `string` | ✅       | Client-declared timestamp when this record was originally created.                                                                                                                            |               |

#### Defs

##### `app.certified.link.evm#eip712Proof`

| Property    | Type     | Required | Description                                                                                                                                     |
| ----------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `signature` | `string` | ✅       | ECDSA signature over the EIP-712 hash (hex-encoded with 0x prefix, 64 or 65 bytes).                                                             |
| `message`   | `ref`    | ✅       | The EIP-712 typed data message that was signed by the wallet. Contains the fields binding an ATProto DID to an EVM address on a specific chain. |

##### `app.certified.link.evm#eip712Message`

| Property     | Type     | Required | Description                                                                                                                                                          |
| ------------ | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `did`        | `string` | ✅       | The ATProto DID being linked to the EVM address.                                                                                                                     |
| `evmAddress` | `string` | ✅       | The EVM wallet address (must match the top-level address field).                                                                                                     |
| `chainId`    | `string` | ✅       | EVM chain ID as string (bigint serialized). Identifies which chain was used for signing; for EOA wallets the identity link applies across all EVM-compatible chains. |
| `timestamp`  | `string` | ✅       | Unix timestamp when the attestation was created (bigint serialized).                                                                                                 |
| `nonce`      | `string` | ✅       | Replay-protection nonce (bigint serialized).                                                                                                                         |

---

## Type Definitions

Common type definitions used across all protocols.

### `app.certified.defs`

**Description:** Common type definitions used across certified protocols.

#### Defs

##### `app.certified.defs#did`

| Property | Type     | Required | Description           |
| -------- | -------- | -------- | --------------------- |
| `did`    | `string` | ✅       | The DID string value. |

---

### `org.hypercerts.defs`

**Description:** Common type definitions used across all Hypercerts protocols.

#### Defs

##### `org.hypercerts.defs#uri`

| Property | Type     | Required | Description          |
| -------- | -------- | -------- | -------------------- |
| `uri`    | `string` | ✅       | URI to external data |

##### `org.hypercerts.defs#smallBlob`

| Property | Type   | Required | Description                        |
| -------- | ------ | -------- | ---------------------------------- |
| `blob`   | `blob` | ✅       | Blob to external data (up to 10MB) |

##### `org.hypercerts.defs#largeBlob`

| Property | Type   | Required | Description                         |
| -------- | ------ | -------- | ----------------------------------- |
| `blob`   | `blob` | ✅       | Blob to external data (up to 100MB) |

##### `org.hypercerts.defs#smallImage`

| Property | Type   | Required | Description       |
| -------- | ------ | -------- | ----------------- |
| `image`  | `blob` | ✅       | Image (up to 5MB) |

##### `org.hypercerts.defs#smallVideo`

| Property | Type   | Required | Description        |
| -------- | ------ | -------- | ------------------ |
| `video`  | `blob` | ✅       | Video (up to 20MB) |

##### `org.hypercerts.defs#largeImage`

| Property | Type   | Required | Description        |
| -------- | ------ | -------- | ------------------ |
| `image`  | `blob` | ✅       | Image (up to 10MB) |

---

## External Lexicons

External lexicons from other protocols and systems.

### `com.atproto.repo.strongRef`

#### Properties

| Property | Type     | Required | Description |
| -------- | -------- | -------- | ----------- |
| `uri`    | `string` | ✅       |             |
| `cid`    | `string` | ✅       |             |

---

### `org.hyperboards.board`

**Description:** Configuration record for a hyperboard, wrapping an underlying activity or collection with visual presentation settings. Stored in the creator's PDS.

**Key:** `tid`

#### Properties

| Property             | Type     | Required | Description                                                                                              | Comments        |
| -------------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------- | --------------- |
| `subject`            | `ref`    | ✅       | Reference to the org.hypercerts.claim.activity or org.hypercerts.claim.collection this board visualizes. |                 |
| `config`             | `ref`    | ❌       | Visual configuration for a hyperboard's background, colors, and layout.                                  |                 |
| `contributorConfigs` | `ref[]`  | ❌       | Per-contributor configuration entries for this board.                                                    | maxLength: 1000 |
| `createdAt`          | `string` | ✅       | Client-declared timestamp when this record was originally created.                                       |                 |

#### Defs

##### `org.hyperboards.board#boardConfig`

| Property              | Type      | Required | Description                                                           |
| --------------------- | --------- | -------- | --------------------------------------------------------------------- |
| `backgroundType`      | `string`  | ❌       | Type of background content.                                           |
| `backgroundImage`     | `union`   | ❌       | Background image as a URI or image blob.                              |
| `backgroundIframeUrl` | `string`  | ❌       | URI of the background iframe.                                         |
| `backgroundGrayscale` | `boolean` | ❌       | Whether the background is rendered in grayscale. Default: true.       |
| `backgroundOpacity`   | `integer` | ❌       | Background opacity as a percentage (0–100).                           |
| `backgroundColor`     | `string`  | ❌       | Background color as a hex string (e.g. '#ffffff').                    |
| `borderColor`         | `string`  | ❌       | Border color as a hex string (e.g. '#000000').                        |
| `grayscaleImages`     | `boolean` | ❌       | Whether contributor images are rendered in grayscale. Default: false. |
| `imageShape`          | `string`  | ❌       | Shape used to crop contributor images on this board.                  |
| `aspectRatio`         | `string`  | ❌       | Display aspect ratio of the board.                                    |

##### `org.hyperboards.board#contributorConfig`

| Property         | Type      | Required | Description                                                                                                                                                                                                            |
| ---------------- | --------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contributor`    | `union`   | ✅       | Identifies the contributor being styled. A strong reference to an org.hypercerts.claim.contributorInformation record, or a contributorIdentity (DID or identifier string) for contributors without a dedicated record. |
| `override`       | `boolean` | ❌       | When true, these values take precedence over the contributor's own profile and display settings. When false or omitted, they are only used as fallbacks if the contributor has not set their own settings.             |
| `displayName`    | `string`  | ❌       | Display name for this contributor on this board.                                                                                                                                                                       |
| `image`          | `union`   | ❌       | Avatar or face image for this contributor on this board, as a URI or image blob.                                                                                                                                       |
| `video`          | `union`   | ❌       | Video for this contributor, as a URI (embed/direct link) or uploaded video blob.                                                                                                                                       |
| `hoverImage`     | `union`   | ❌       | Image overlay shown when hovering over this contributor, as a URI or image blob.                                                                                                                                       |
| `hoverIframeUrl` | `string`  | ❌       | Iframe overlay shown when hovering over this contributor.                                                                                                                                                              |
| `url`            | `string`  | ❌       | Click-through link URL for this contributor.                                                                                                                                                                           |

---

### `org.hyperboards.displayProfile`

**Description:** User-declared visual presentation defaults for how a contributor appears on hyperboards. Stored in the contributor's own PDS and reusable across multiple boards.

**Key:** `literal:self`

#### Properties

| Property         | Type     | Required | Description                                                                                     | Comments                         |
| ---------------- | -------- | -------- | ----------------------------------------------------------------------------------------------- | -------------------------------- |
| `displayName`    | `string` | ❌       | Display name override for this user on hyperboards.                                             | maxLength: 640, maxGraphemes: 64 |
| `image`          | `union`  | ❌       | Avatar or face image override for this user on hyperboards, as a URI or image blob.             |                                  |
| `video`          | `union`  | ❌       | Default video for this user across boards, as a URI (embed/direct link) or uploaded video blob. |                                  |
| `hoverImage`     | `union`  | ❌       | Default hover image for this user across boards, as a URI or image blob.                        |                                  |
| `hoverIframeUrl` | `string` | ❌       | Default hover iframe URL for this user across boards.                                           | maxLength: 2048                  |
| `url`            | `string` | ❌       | Default click-through link URL for this user across boards.                                     | maxLength: 2048                  |
| `createdAt`      | `string` | ✅       | Client-declared timestamp when this record was originally created.                              |                                  |

---

## Notes

- All timestamps use the `datetime` format (ISO 8601)
- Strong references (`com.atproto.repo.strongRef`) include both the URI and CID of the referenced record
- Union types allow multiple possible formats (e.g., URI or blob)
- Array items may have constraints like `maxLength` to limit the number of elements
- String fields may have both `maxLength` (bytes) and `maxGraphemes` (Unicode grapheme clusters) constraints
