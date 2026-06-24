# Design: Permission Sets for Hypercerts, Hyperboards & Certified data

Status: **Implemented** — the sets described here are published as lexicon
files in this repository (`lexicons/org/hypercerts/authWrite.json`,
`lexicons/org/hyperboards/authWrite.json`,
`lexicons/app/certified/authWrite.json`). This document records the design and
the rationale behind it.

This document designs **permission sets** for the `org.hypercerts.*`,
`org.hyperboards.*`, and `app.certified.*` record collections defined in this
repository — published, reusable bundles of AT Protocol OAuth scopes that any
application can request with a single `include:<nsid>` scope, instead of
enumerating every underlying `repo:` scope by hand.

## Background: what a permission set is

AT Protocol clients act on a user's data with **OAuth scopes**. Writing records
of a given collection requires a `repo:<collection>?action=…` scope; calling a
service method requires an `rpc:<lxm>?aud=…` scope. (See the
[AT Protocol permission spec](https://atproto.com/specs/permission).)

A **permission set** ([spec](https://atproto.com/specs/permission#permission-sets))
is a named, published Lexicon schema that bundles several such scopes under one
NSID. A client requests the whole bundle with one scope string —
`include:<nsid>` — and the user's Authorization Server (their PDS) resolves the
set and expands it into the underlying scopes when granting access. Per the
spec, permission sets are _"published publicly and can be used by any client
developer"_, and _"Authorization Servers resolve, authenticate, and process
permission-sets dynamically."_

The motivation is plain: an application that does CRUD over a family of
collections — say, all the records that make up a hypercert — would otherwise
have to list every `repo:org.hypercerts.…?action=…` scope itself, keep that list
correct, and re-derive it independently from every other integrator. A published
set replaces that with one curated, versioned name.

## Who uses these sets

These are general AT Protocol artifacts, not specific to any one service. The
expected consumers, in rough order of generality:

1. **Any atproto app working with Hypercerts / Hyperboards / Certified data
   directly.** An OAuth client requests `include:org.hypercerts.authWrite`
   (and/or the `org.hyperboards.*` or `app.certified.*` set) in its
   authorization request; the user's PDS expands it and the app reads/writes
   those collections in the user's own repo. No intermediary is involved. This
   is the broadest case.
2. **The Certified group service (CGS), via OAuth.** CGS is used as a standard
   OAuth resource (reached through AT Protocol service proxying). A client
   calling CGS on a user's behalf requests the same sets; the user's PDS expands
   them the same way. CGS is a likely-popular consumer, but it consumes the sets
   like any other client — it does not own them.
3. **CGS API keys.** CGS also issues long-lived API keys whose scopes can be
   specified as `include:<nsid>`; CGS resolves the **same** published set and
   expands it to concrete scopes on the key. (Detailed in CGS's own design doc;
   summarised under _Consumption by CGS_ below.)

The common thread: the **published Lexicon record is the single source of
truth.** Whatever resolves a set — a PDS during an OAuth grant, or CGS at
key-creation — reads the same published definition.

## The sets

We define three **record-collection write** sets — one per data namespace in
this repo. Each grants the three `repo:` write actions — create, update, delete —
over all of that namespace's record collections.

| Set NSID                    | Grants write (create/update/delete) on     |
| --------------------------- | ------------------------------------------ |
| `org.hypercerts.authWrite`  | all `org.hypercerts.*` record collections  |
| `org.hyperboards.authWrite` | all `org.hyperboards.*` record collections |
| `app.certified.authWrite`   | all `app.certified.*` record collections   |

All three are authored and published from **this repository**, which is the
namespace authority for all of them — see _Namespace authority_ below.

> **Write only — no read action.** The leaf is `authWrite` because a `repo:`
> permission has only three actions — `create`, `update`, `delete` (there is no
> `read` action in the scope grammar). Reading records needs **no permission at
> all**: atproto repo records are public and world-readable via
> `com.atproto.repo.getRecord` / `listRecords`, with no scope required. So these
> sets cover the only repo operations that _are_ permissioned — the writes — and
> "read" is implicitly available to everyone. The user-facing `title` / `detail`
> (the authorization-dialog consent copy) say "Manage your … data" / "Create,
> edit, and delete …" accordingly.

> **Naming — and why the NSID is a single segment under the namespace root.**
> Two constraints, one of them hard:
>
> 1. **The set NSID's authority must parent the collections it grants** (the
>    namespace-authority rule below). `NSID.authority` is the reversed domain of
>    _all but the last segment_, so a set named `org.hypercerts.permissions.crud`
>    has authority `permissions.hypercerts.org`, which does **not** parent
>    `org.hypercerts.claim.*` — `IncludeScope.toScopes` would silently return an
>    empty list. The set NSID must therefore be a **single leaf directly under the
>    namespace root** (`org.hypercerts.<leaf>`), whose authority is `hypercerts.org`.
> 2. **Convention follows real precedent.** Bluesky publishes its own permission
>    sets exactly this way — single segment under the namespace, `auth`-prefixed
>    capability leaf: `app.bsky.authViewAll`, `app.bsky.authCreatePosts`,
>    `app.bsky.authDeleteContent`, `app.bsky.authFullApp`. The spec's illustrative
>    examples (`com.example.authFull`, `com.example.authBasicFeatures`) match. So
>    `authWrite` mirrors that style: `auth`-prefixed, names the capability.

### `org.hypercerts.authWrite`

Enumerates every `type: "record"` collection under `org.hypercerts.*`:

```jsonc
{
  "lexicon": 1,
  "id": "org.hypercerts.authWrite",
  "defs": {
    "main": {
      "type": "permission-set",
      "description": "Permission set granting create, update, and delete on every Hypercerts (org.hypercerts) record collection.",
      "title": "Manage your Hypercerts data",
      "detail": "Create, edit, and delete your Hypercerts records (impact claims, evaluations, funding, and related data).",
      "permissions": [
        {
          "type": "permission",
          "resource": "repo",
          "collection": [
            "org.hypercerts.claim.activity",
            "org.hypercerts.claim.contribution",
            "org.hypercerts.claim.contributorInformation",
            "org.hypercerts.claim.rights",
            "org.hypercerts.collection",
            "org.hypercerts.context.acknowledgement",
            "org.hypercerts.context.attachment",
            "org.hypercerts.context.evaluation",
            "org.hypercerts.context.measurement",
            "org.hypercerts.funding.receipt",
            "org.hypercerts.workscope.tag",
          ],
          "action": ["create", "update", "delete"],
        },
      ],
    },
  },
}
```

### `org.hyperboards.authWrite`

Enumerates every `type: "record"` collection under `org.hyperboards.*`:

```jsonc
{
  "lexicon": 1,
  "id": "org.hyperboards.authWrite",
  "defs": {
    "main": {
      "type": "permission-set",
      "description": "Permission set granting create, update, and delete on every Hyperboards (org.hyperboards) record collection.",
      "title": "Manage your Hyperboards data",
      "detail": "Create, edit, and delete your Hyperboards records (board configurations and display profiles).",
      "permissions": [
        {
          "type": "permission",
          "resource": "repo",
          "collection": [
            "org.hyperboards.board",
            "org.hyperboards.displayProfile",
          ],
          "action": ["create", "update", "delete"],
        },
      ],
    },
  },
}
```

### `app.certified.authWrite`

Enumerates every `type: "record"` collection under `app.certified.*`:

```jsonc
{
  "lexicon": 1,
  "id": "app.certified.authWrite",
  "defs": {
    "main": {
      "type": "permission-set",
      "description": "Permission set granting create, update, and delete on every Certified (app.certified) record collection.",
      "title": "Manage your Certified data",
      "detail": "Create, edit, and delete your Certified records (profile, badges, follows, wallet links, and related data).",
      "permissions": [
        {
          "type": "permission",
          "resource": "repo",
          "collection": [
            "app.certified.actor.organization",
            "app.certified.actor.profile",
            "app.certified.badge.award",
            "app.certified.badge.definition",
            "app.certified.badge.response",
            "app.certified.graph.follow",
            "app.certified.link.evm",
            "app.certified.location",
          ],
          "action": ["create", "update", "delete"],
        },
      ],
    },
  },
}
```

> The collection lists are derived from this repo's `lexicons/org/hypercerts/`,
> `lexicons/org/hyperboards/`, and `lexicons/app/certified/` (`type: "record"`
> defs at time of writing). They must be **kept in sync** as record types are
> added — see _Maintenance_.

## Design rules these sets follow

### Namespace authority

A permission set may only contain permissions under its **own** namespace
authority. Spec, verbatim: _"Permission sets are limited to expressing
permissions that reference resources under the same NSID namespace as the set
itself"_ — it may address its own NSID group and children, never siblings or
parents. The rule applies uniformly to `repo:` permissions (by collection NSID)
and `rpc:` permissions (by lxm NSID).

Consequences here:

- A set under `org.hypercerts.*` may grant `repo:org.hypercerts.*` collections,
  and **only** those — it cannot reference `org.hyperboards.*` or
  `app.certified.*` collections, or any third party's, or any service's `rpc:`
  methods. Likewise each of the `org.hyperboards.*` and `app.certified.*` sets
  is confined to its own namespace.
- This is why there are **three** sets rather than one combined set: the three
  namespaces have distinct authorities (`hypercerts.org`, `hyperboards.org`,
  `certified.app`) and cannot legally be mixed in a single set. An app that
  needs more than one requests each `include:` scope.
- The authority confinement is also what makes a published set **safe for any
  client to resolve**: an `include:` can only ever widen access to the set's own
  namespace, never smuggle in foreign permissions.

### Collections are enumerated, never wildcarded

Inside a permission set, a `repo:` permission names collections by **exact
NSID**. Spec, verbatim: _"Wildcards are not supported in permissions within a
permission set."_ So a CRUD set cannot say "all `org.hypercerts.*` collections" —
it lists each one. The enumerated list **is** the grant, and is the security
boundary: a newly-added collection is not covered until it is added to the set
and the set is re-published. (Contrast a standalone scope outside a set, where
`repo:*` is permitted — but that is "all collections", not "a namespace", and is
not what these sets are for.)

### `repo:` permissions carry no `aud`

A `repo:` scope targets the **user's own repo**, so it has no audience. All
three sets here are `repo:`-only, so an `include:` for them is requested
**without** any `?aud=` parameter. Each set expands to a **single combined
`repo:` scope** that
lists every collection — `IncludeScope.toScopes` coalesces the permission's
collection array into one scope string
(`repo:?collection=<a>&collection=<b>&…&action=create&action=update&action=delete`),
rather than emitting one scope per collection.

(For completeness: an `rpc:` permission _does_ take an `aud` naming the target
service, and a set can let the `include:`'s `?aud=` flow into `rpc:` permissions
marked `inheritAud: true`. Neither CRUD set uses `rpc:`, so this does not apply —
it is noted only because a future Hypercerts/Certified _service-method_ set
would.)

## Publication and resolution

All three sets are published like any other Lexicon schema in this repo (see
[`PUBLISHING.md`](../PUBLISHING.md)) and resolved at runtime via the standard
**Lexicon resolution system**, to which the permission spec defers:
_"Permission sets are Lexicon schemas and are published and fetched using the
Lexicon resolution system, which includes cryptographic authentication."_

The resolution chain a consumer follows (per
[`/specs/lexicon`](https://atproto.com/specs/lexicon), core protocol):

1. **NSID → authority DID via DNS.** Reverse the NSID's authority portion (all
   but the final name), prepend `_lexicon.`, query that domain for a `TXT` record
   `did=<DID>`.
2. **DID → PDS endpoint** via standard DID resolution.
3. **Fetch the schema record**: `com.atproto.repo.getRecord` with
   `repo=<authority-DID>`, `collection=com.atproto.lexicon.schema`,
   `rkey=<full-NSID>` (the rkey **is** the NSID).
4. Validate the record's `main` def is `type: "permission-set"`, then expand.

For a direct OAuth client this is done by the **user's PDS** during the grant.
The publication of the `_lexicon` DNS records and schema records for these
namespaces is a maintenance responsibility of this repo's operators.

## Consumption by CGS

CGS is expected to be a prominent consumer, in two ways. Neither changes the
sets — they are recorded here so the sets are designed with these uses in mind;
full detail lives in the CGS design doc
([`api-key-permission-sets.md`](https://github.com/hypercerts-org/certified-group-service/blob/main/docs/design/api-key-permission-sets.md)).

- **Via OAuth + service proxying.** A client calls CGS on a user's behalf; the
  user's PDS has already expanded the requested `include:` set into the grant.
  CGS sees ordinary `repo:` scopes. Identical to any other OAuth resource.
- **Via CGS API keys.** CGS lets an owner specify an API key's scopes as
  `include:<nsid>`. CGS resolves the published set (same chain as above) and
  expands it to concrete scopes stored on the key, **once at key-creation time**
  (a snapshot — a later change to the set does not retroactively alter issued
  keys until they are re-issued). CGS then gates its own write methods
  (`app.certified.group.repo.*`, which proxy to the group's PDS) by matching the
  request's collection against those `repo:` scopes.

The point for _this_ repo: the sets must be **self-contained and
deployment-agnostic** — no CGS-specific assumptions baked into the definitions.
All three CRUD sets satisfy this trivially (pure `repo:` collection grants).

## Maintenance

The enumerated `collection` lists are the one ongoing obligation. Whenever a
`type: "record"` lexicon is added to or removed from `org.hypercerts.*`,
`org.hyperboards.*`, or `app.certified.*`, the corresponding set must be updated
and re-published, or the new collection will be silently uncovered by the set.
The `AGENTS.md` "Adding / modifying a lexicon" checklist calls this out. Worth a
check in the release process too (and ideally an automated test asserting each
set lists exactly the `type: "record"` defs in its namespace).

> **Known pending update.** PR
> [#219](https://github.com/hypercerts-org/hypercerts-lexicon/pull/219)
> (`feat/signature-support-v2`, HYPER-181) adds the `app.certified.signature.proof`
> record lexicon, which does **not** exist on `main` yet and so is **not** in
> `app.certified.authWrite` here. When #219 merges,
> `app.certified.signature.proof` must be added to the set's `collection` list
> (and re-published). The two PRs touch different files, so neither blocks the
> other — this is just a follow-up to land after both.

## References

- AT Protocol permission spec — permission sets:
  https://atproto.com/specs/permission#permission-sets
- AT Protocol lexicon resolution: https://atproto.com/specs/lexicon
- CGS consumption design:
  https://github.com/hypercerts-org/certified-group-service/blob/main/docs/design/api-key-permission-sets.md
