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

### Define the badge and its allowed payload types once

```json
{
  "$type": "app.certified.badge.definition",
  "badgeType": "certification",
  "title": "Good Market Approved",
  "allowedIssuers": [{ "did": "did:plc:ewvi7nxzyoun6zhxrhs64oiz" }],
  "extensionTypes": [
    "org.example.goodmarket.defs#approvalMetadata",
    "org.example.goodmarket.approvalMetadata"
  ],
  "createdAt": "2026-10-02T12:00:00Z"
}
```

This example declares both inline and separately stored representations of the
same data. A project that uses only one representation can list only that type.
The referenced variant requires its own `type: "record"` lexicon with these
two array properties on `defs.main.record`.

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

An award's `$type` tells us what one payload claims to be. It does not tell us
what the badge definition permits across all awards.

Without a declaration, a consumer must find an award for each definition,
check the publishing DID against `allowedIssuers` when present, then inspect
an inline payload or fetch a referenced one. Unauthorized candidates and
awards without extensions may require more requests. A sample is still only
an observation: another award may contain an entirely different payload, and
a definition with no awards has no discoverable payload contract.

With `extensionTypes`, consumers can discover the expected types directly
from the definitions and choose a renderer or retrieve the corresponding
schemas before loading individual awards. For 100 definitions that fit in
one listing response, that discovery needs one request rather than per-badge
award sampling. Rendering actual awards and validating their data still
requires award reads and, where applicable, extension reads.

Good Market Approved can therefore mean "this badge allows the Good Market
sector/focus schema", rather than "inspect whichever payload an award happens
to contain". This does not put Good Market's fields into the common protocol
or require other projects to use Good Market's vocabulary.

## Contract and validation

- Both fields are optional, so existing records remain valid.
- `extensions` contains at most 20 entries. Each is a typed inline object or
  a strongRef object; references in this union require their `$type` wrapper.
- `extensionTypes` contains at most 20 strings, each at most 512 bytes. Each
  identifies a record NSID or a full inline Lexicon reference including its
  named definition fragment. Identifiers must be fully qualified and use
  exact matching, not prefixes or wildcards. The carrier schema bounds the
  strings; consumers must also check that each resolves to an appropriate
  record or object schema, not an API method or another unrelated schema kind.
- Omitted `extensionTypes` declares no type restriction. An empty array allows
  no extension payloads. Listing a type does not require an award to contain it.
- Use the definition version identified by `award.badge`, not an unverified
  latest definition. For strongRef extensions, resolve the URI, verify the
  CID, and compare the referenced record's `$type`, not the wrapper's type.
- Check issuer authorization separately. An allowed type is not proof of an
  authorized issuer, trusted extension publisher, or accurate data. Cross-repo
  references do not inherit trust merely by matching a schema.
- Validate each supported payload against its own schema. The open union
  deliberately admits unknown third-party types. It does not validate their
  fields, even if their schema is registered in the same validator registry.
- The generic badge validator cannot enforce a definition's allowlist or
  resolve strong references. Applications and indexers enforce that contract.
- Unknown, unavailable, or nonconforming extensions must not hide the base
  award. Ignore or flag them separately, and do not render unchecked custom
  data as though it satisfied the declared contract. Consumers should retain
  unknown fields when forwarding or storing the original record.

This follows the existing inline-or-reference pattern used for descriptions,
contributor details, and signatures. A same-repository, same-key sidecar remains
an alternative for independently mutable companion data, but this field is an
explicit, discoverable inclusion in an award's payload.
