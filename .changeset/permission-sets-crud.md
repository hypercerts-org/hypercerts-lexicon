---
"@hypercerts-org/lexicon": minor
---

Add three permission-set lexicons — `org.hypercerts.authWrite`, `org.hyperboards.authWrite`, and `app.certified.authWrite` — each granting create/update/delete over every record collection in its namespace.

A [permission set](https://atproto.com/specs/permission#permission-sets) lets any AT Protocol app request a whole bundle of `repo:` scopes with a single `include:<nsid>` OAuth scope, instead of enumerating each collection by hand. The user's PDS resolves and expands the set during the OAuth grant; the same published set can also be consumed by services (e.g. the Certified group service) when expanding API-key scopes.

There are **three** sets rather than one because the spec requires it: a permission set "is limited to expressing permissions that reference resources under the same NSID namespace as the set itself" and "can not address 'sibling groups' or 'parents'". `org.hypercerts`, `org.hyperboards`, and `app.certified` are separate namespace authorities, so they cannot be combined in a single set — an app needing more than one requests each `include:` scope.

Permission sets are published as-is (they are the source of truth for what gets published to AT Protocol) but have no TypeScript shape — `lex gen-api` cannot generate code for `permission-set` defs. They are therefore excluded from the codegen globs (`gen-api`/`gen-md`/`gen-ts`) and from `generated/exports.ts`, while still shipping as raw lexicon JSON.

Collection lists are enumerated explicitly because the spec forbids wildcards inside a permission set; they must be kept in sync as record types are added. See `docs/design/permission-sets.md`.
