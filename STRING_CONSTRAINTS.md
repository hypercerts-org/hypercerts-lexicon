# String & Array Constraint Rationale

This document records the reasoning behind every `maxLength`, `maxGraphemes`, and array `maxLength` value in the Hypercerts lexicon suite.

## Guiding Principles

References: [ATProto Lexicon Style Guide](https://atproto.com/guides/lexicon-style-guide), [Lexicon Spec](https://atproto.com/specs/lexicon)

### When to use `maxLength` (UTF-8 byte limit)

Every string property without a `format` or `enum`/`knownValues` **must** declare `maxLength`. This is the baseline constraint for all unconstrained strings. It limits the raw byte size of the stored value.

### When to add `maxGraphemes` (Unicode Grapheme Cluster limit)

Add `maxGraphemes` **in addition to** `maxLength` when the field contains **human-readable text that a person would read or write** — descriptions, titles shown in UI, free-form prose. Grapheme limits protect against strings that are short in bytes but visually overwhelming (e.g. a single emoji is 1 grapheme but up to 28 bytes).

Do **not** add `maxGraphemes` to:

- **Machine-oriented strings**: identifiers, DIDs, URIs, hashes, numeric values, type tags, currency codes. These are never displayed as prose and their length is naturally bounded by their format.
- **Short labels/names** where the byte limit already provides a tight enough bound (e.g. `badgeType` at 100 bytes — even in CJK this is ~33 characters, which is reasonable for a category tag).

### Byte-to-grapheme ratio

When both are used, the style guide recommends a **10–20:1 ratio** for `maxLength:maxGraphemes` to accommodate multi-byte scripts (CJK characters are 3-4 bytes, emoji sequences up to 28 bytes).

### When to use neither

- **Format-typed fields** (`datetime`, `at-uri`, `uri`, `did`, `cid`, etc.) do **not** get `maxLength`/`maxGraphemes` — the format itself constrains the value. The style guide explicitly says: _"Don't redundantly specify both a format and length limits."_
- **`knownValues`/`enum` fields** do not need length constraints; the allowed values are already defined.
- **Array `maxLength`** limits the number of items, not byte size. Used to prevent unbounded arrays.

---

## Activity Claim (`org.hypercerts.claim.activity`)

| Field                            | Constraint      | maxLength | maxGraphemes | Why this constraint type                                                      | Why this value                                   |
| -------------------------------- | --------------- | --------- | ------------ | ----------------------------------------------------------------------------- | ------------------------------------------------ |
| `title`                          | maxLength only  | 256       | —            | Short label; byte limit is tight enough that grapheme limit adds little value | 256 bytes; generous for titles in any script     |
| `shortDescription`               | both            | 3000      | 300          | Human-readable preview text displayed in UI; needs grapheme limit             | 300 graphemes × 10:1 ratio = 3000 bytes          |
| `description`                    | both            | 30000     | 3000         | Long-form human-readable prose; needs grapheme limit                          | 3000 graphemes × 10:1 ratio = 30000 bytes        |
| `contributors` (array)           | array maxLength | 1000      | —            | Array item count limit; not a string                                          | Practical upper bound; prevents unbounded arrays |
| `locations` (array)              | array maxLength | 1000      | —            | Array item count limit; not a string                                          | Practical upper bound; prevents unbounded arrays |
| `contributor.contributionWeight` | maxLength only  | 100       | —            | Machine-oriented numeric string (e.g. "0.5", "100"); never displayed as prose | 100 bytes; far more than any numeric value needs |
| `contributorIdentity.identity`   | both            | 1000      | 100          | Can be a human-readable identifier (not just a DID); may be displayed in UI   | 100 graphemes × 10:1 ratio = 1000 bytes          |
| `contributorRole.role`           | both            | 1000      | 100          | Human-readable role description displayed in UI                               | 100 graphemes × 10:1 ratio = 1000 bytes          |
| `workScopeString.scope`          | both            | 1000      | 100          | Free-form human-readable scope description                                    | 100 graphemes × 10:1 ratio = 1000 bytes          |

## Rights (`org.hypercerts.claim.rights`)

| Field               | Constraint     | maxLength | maxGraphemes | Why this constraint type                              | Why this value                                                                        |
| ------------------- | -------------- | --------- | ------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `rightsName`        | maxLength only | 100       | —            | Short label/name; byte limit is tight enough          | 100 bytes; generous for license names like "CC-BY-4.0"                                |
| `rightsType`        | maxLength only | 10        | —            | Machine-oriented short code; never displayed as prose | 10 bytes; covers all known type codes                                                 |
| `rightsDescription` | both           | 10000     | 1000         | Human-readable rich text description displayed in UI  | 1000 graphemes × 10:1 ratio = 10000 bytes. Longest observed: 151 bytes (66× headroom) |

## Collection (`org.hypercerts.collection`)

| Field              | Constraint      | maxLength | maxGraphemes | Why this constraint type                                  | Why this value                                            |
| ------------------ | --------------- | --------- | ------------ | --------------------------------------------------------- | --------------------------------------------------------- |
| `type`             | maxLength only  | 64        | —            | Machine-oriented type tag; not displayed as prose         | 64 bytes; covers all known types ("favorites", "project") |
| `title`            | both            | 800       | 80           | Human-readable title displayed in UI                      | 80 graphemes × 10:1 ratio = 800 bytes                     |
| `shortDescription` | both            | 3000      | 300          | Human-readable preview text displayed in UI               | 300 graphemes × 10:1 ratio = 3000 bytes; matches activity |
| `items` (array)    | array maxLength | 1000      | —            | Array item count limit; not a string                      | Practical upper bound; prevents unbounded arrays          |
| `item.itemWeight`  | maxLength only  | 100       | —            | Machine-oriented numeric string; never displayed as prose | 100 bytes; far more than any numeric value needs          |

## Contributor Information (`org.hypercerts.claim.contributorInformation`)

| Field         | Constraint     | maxLength | maxGraphemes | Why this constraint type                                  | Why this value                                       |
| ------------- | -------------- | --------- | ------------ | --------------------------------------------------------- | ---------------------------------------------------- |
| `identifier`  | maxLength only | 2048      | —            | Machine-oriented (DID or URI); not human-readable prose   | 2048 bytes; matches practical URI/DID length limit   |
| `displayName` | maxLength only | 100       | —            | Short label; byte limit is tight enough for display names | 100 bytes; standard for display names across ATProto |

## Funding Receipt (`org.hypercerts.funding.receipt`)

| Field            | Constraint     | maxLength | maxGraphemes | Why this constraint type                                                          | Why this value                                                   |
| ---------------- | -------------- | --------- | ------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `to`             | maxLength only | 2048      | —            | Machine-oriented identifier (DID or name used for lookup, not displayed as prose) | 2048 bytes; accommodates DIDs (up to 2048 per ATProto spec)      |
| `amount`         | maxLength only | 50        | —            | Machine-oriented numeric string; never displayed as prose                         | 50 bytes; covers any reasonable numeric amount                   |
| `currency`       | maxLength only | 10        | —            | Machine-oriented code (ISO 4217 or token symbol); not prose                       | 10 bytes; ISO codes are 3 chars, allows custom tokens            |
| `paymentRail`    | maxLength only | 50        | —            | Machine-oriented enumerable identifier; not prose                                 | 50 bytes; covers all known rail identifiers                      |
| `paymentNetwork` | maxLength only | 50        | —            | Machine-oriented enumerable identifier; not prose                                 | 50 bytes; covers all known network identifiers                   |
| `transactionId`  | maxLength only | 256       | —            | Machine-oriented hash/reference; not prose                                        | 256 bytes; covers hex hashes (64 chars) and bank reference codes |
| `notes`          | maxLength only | 500       | —            | Short free-text, but not a primary display field; byte limit suffices             | 500 bytes; brief contextual notes (already shipped on develop)   |

## Badge Definition (`app.certified.badge.definition`)

| Field                    | Constraint      | maxLength | maxGraphemes | Why this constraint type                                         | Why this value                                          |
| ------------------------ | --------------- | --------- | ------------ | ---------------------------------------------------------------- | ------------------------------------------------------- |
| `badgeType`              | maxLength only  | 100       | —            | Machine-oriented category tag; not displayed as prose            | 100 bytes; covers compound types like "endorsement"     |
| `title`                  | maxLength only  | 256       | —            | Short label; byte limit is tight enough for badge titles         | 256 bytes; matches activity title convention            |
| `description`            | both            | 5000      | 500          | Human-readable description displayed in UI; needs grapheme limit | 500 graphemes × 10:1 ratio = 5000 bytes                 |
| `allowedIssuers` (array) | array maxLength | 100       | —            | Array item count limit; not a string                             | 100 items; generous upper bound for an issuer allowlist |

## Badge Award (`app.certified.badge.award`)

| Field  | Constraint     | maxLength | maxGraphemes | Why this constraint type                                           | Why this value                     |
| ------ | -------------- | --------- | ------------ | ------------------------------------------------------------------ | ---------------------------------- |
| `note` | maxLength only | 500       | —            | Short annotation; not a primary display field, byte limit suffices | 500 bytes; brief award explanation |

## Badge Response (`app.certified.badge.response`)

| Field    | Constraint     | maxLength | maxGraphemes | Why this constraint type                                  | Why this value                       |
| -------- | -------------- | --------- | ------------ | --------------------------------------------------------- | ------------------------------------ |
| `weight` | maxLength only | 50        | —            | Machine-oriented numeric string; never displayed as prose | 50 bytes; generous for weight values |

## Fields Without Length Constraints (by design)

The following string fields use `format` and therefore do **not** receive `maxLength`/`maxGraphemes` per the style guide:

- All `"format": "uri"` fields (`defs.uri.uri`, `location.srs`, `measurement.methodURI`)
- All `"format": "datetime"` fields (`createdAt`, `startDate`, `endDate`, `occurredAt`)
- All `"format": "at-uri"` fields (`receipt.for`)
- All `"format": "did"` fields

The `response` field in `badge/response.json` uses `knownValues` (open enum) and does not need length constraints.
