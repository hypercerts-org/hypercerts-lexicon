# Badge extensions

Badge definitions declare what a badge means. Badge awards record individual
issuances. Publisher-defined extensions let integrating projects attach typed
data without adding project-specific fields to the shared Certified lexicons.

## Good Market Approved: a predictable custom payload

Consider Good Market Approved, with custom data containing exactly two fields:

```ts
type ApprovalMetadata = {
  sectors: string[];
  focus: string[];
};
```

The examples below are illustrative. `org.example.goodmarket.*` is a
placeholder namespace, not a published Good Market lexicon. DIDs, record
URIs, CIDs, and classification values are example values, not live records
or an agreed Good Market vocabulary.

Good Market defines an inline object in its own lexicon:

```json
{
  "lexicon": 1,
  "id": "org.example.goodmarket.defs",
  "defs": {
    "approvalMetadata": {
      "type": "object",
      "description": "Good Market's classifications for an approved enterprise.",
      "required": ["sectors", "focus"],
      "properties": {
        "sectors": {
          "type": "array",
          "description": "Good Market sector classifications.",
          "maxLength": 100,
          "items": { "type": "string", "maxLength": 256 }
        },
        "focus": {
          "type": "array",
          "description": "Good Market focus classifications.",
          "maxLength": 100,
          "items": { "type": "string", "maxLength": 256 }
        }
      }
    }
  }
}
```

The bounds above are illustrative producer choices, not imposed by Certified.
The normal AT Protocol `$type` discriminator identifies the object; it is not
a third business field in the extension schema.

### Define the badge and its extension types once

```json
{
  "$type": "app.certified.badge.definition",
  "badgeType": "certification",
  "title": "Good Market Approved",
  "allowedIssuers": [{ "did": "did:plc:ewvi7nxzyoun6zhxrhs64oiz" }],
  "extensionTypes": [
    {
      "type": "org.example.goodmarket.defs#approvalMetadata",
      "required": true
    }
  ],
  "createdAt": "2026-10-02T12:00:00Z"
}
```

Every Good Market Approved award must carry the sector and focus metadata,
so the entry is marked `required`. An award without it is not a valid Good
Market Approved award.

### Issue an award with inline data

```json
{
  "$type": "app.certified.badge.award",
  "badge": {
    "uri": "at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/app.certified.badge.definition/3k2abc",
    "cid": "bafyreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy"
  },
  "subject": {
    "$type": "app.certified.defs#did",
    "did": "did:plc:klldzjf4rzhskytomj64nvil"
  },
  "extensions": [
    {
      "$type": "org.example.goodmarket.defs#approvalMetadata",
      "sectors": ["Agriculture", "Food"],
      "focus": ["Regenerative Agriculture", "Fair Trade"]
    }
  ],
  "createdAt": "2026-10-02T12:05:00Z"
}
```

Small custom payloads can travel with the award. They need no separate
extension-record write, permissions, or fetch.

### Or reference a separately stored payload

A definition that uses separately stored records lists the record NSID
instead: `{ "type": "org.example.goodmarket.approvalMetadata", "required": true }`.
This variant requires its own `type: "record"` lexicon with the two array
properties on `defs.main.record`. A required entry names one form, so a
definition should list only the form its issuers use.

Replace the award's `extensions` value with:

```json
[
  {
    "$type": "com.atproto.repo.strongRef",
    "uri": "at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/org.example.goodmarket.approvalMetadata/3k2def",
    "cid": "bafyreie5737gdxlw5i64vngml6xvqeatqy3a4erphoqtso54z2eooh4zae"
  }
]
```

The referenced record contains:

```json
{
  "$type": "org.example.goodmarket.approvalMetadata",
  "sectors": ["Agriculture", "Food"],
  "focus": ["Regenerative Agriculture", "Fair Trade"]
}
```

The URI and CID identify a particular record version. Updating that record
does not retarget the award automatically; update the reference to use the new
version. A strong reference is not a guarantee that historical content remains
retrievable from the PDS. Do not silently substitute a newer version.

Both approaches need a project-owned schema. For network discovery, publish
the schema in an AT Protocol repository and use DNS TXT records to identify
the namespace authority's DID. The schema is not stored in DNS, and DNS setup
is per authority, not per award. Network publication is currently strongly
recommended rather than universally required by AT Protocol. Separately stored
records also require write authorization for the project's collection; the
Certified permission set does not grant access to third-party collections.

## Why put `extensionTypes` on the definition?

A badge definition is the type of its awards. Every Good Market Approved
award shares the definition's title, icon, description, and allowed issuers.
Extension data belongs to that type in the same way: if the badge carries
sector and focus classifications, that is a property of the badge, not of one
issuance.

Open unions such as post embeds are open by design, because the author of
each post decides what to attach. A badge is different: the definition author
decides what the badge is, and issuers only instantiate it. Without a
declaration, two awards of the same badge could carry unrelated payloads, and
a consumer could only learn the badge's data shape by sampling awards.

With `extensionTypes`, issuing tools know what data to collect and consumers
know what to expect and render, before any award exists. This does not put
Good Market's fields into the common protocol or require other projects to
use Good Market's vocabulary.

## Contract and validation

Two rules define the contract. Apply them with the definition version
identified by `award.badge`, not an unverified latest definition.

1. **An award that lacks a required extension is invalid.** It is not a valid
   award of the badge and should not be presented as one.
2. **An extension whose type is not listed is outside the contract.** The
   award stays valid. Consumers may ignore the extension or render it, but
   should not present it as data defined by the badge.

| Definition declares | Award carries     | Award   | Extension                 |
| ------------------- | ----------------- | ------- | ------------------------- |
| Nothing             | Some extension    | Valid   | Outside the contract      |
| X, optional         | Nothing           | Valid   | n/a                       |
| X, optional         | X                 | Valid   | Part of the badge         |
| X, optional         | Y                 | Valid   | Y is outside the contract |
| X, required         | X                 | Valid   | Part of the badge         |
| X, required         | X and Y           | Valid   | Y is outside the contract |
| X, required         | Nothing or only Y | Invalid | n/a                       |

Details:

- Both fields are optional, so existing records remain valid. Omitting
  `extensionTypes` or leaving it empty declares no extensions.
- `extensions` contains at most 20 entries. Each is a typed inline object or
  a strongRef object; references in this union require their `$type` wrapper.
- `extensionTypes` contains at most 20 `{ type, required }` entries. `type`
  is at most 512 bytes and identifies a record NSID or a full inline Lexicon
  reference including its named definition fragment. `required` defaults to
  false. Matching is exact, with no prefixes or wildcards, and a main
  definition is written as the bare NSID without `#main`.
- An inline payload matches by its `$type`. A strong reference matches by the
  collection NSID in its AT-URI, not the wrapper's type.
- A required payload that is present but does not conform to its own schema
  counts as missing. A consumer without that schema can only check presence
  by type and should treat the content as unchecked.
- A required referenced record that cannot be retrieved is unverified, not
  invalid: the issuer supplied what the definition asked for. Verify the CID
  when the record is available, and do not silently substitute a newer
  version.
- Check issuer authorization separately. A matching type is not proof of an
  authorized issuer, trusted extension publisher, or accurate data.
  Cross-repo references do not inherit trust merely by matching a schema.
- The generic badge validator checks the carrier structure only. It does not
  validate third-party fields, enforce required extensions, or resolve strong
  references. Applications and indexers enforce the contract.
- Consumers should retain unknown fields when forwarding or storing the
  original record.

This follows the existing inline-or-reference pattern used for descriptions,
contributor details, and signatures. A same-repository, same-key sidecar remains
an alternative for independently mutable companion data, but this field is an
explicit, discoverable inclusion in an award's payload.
