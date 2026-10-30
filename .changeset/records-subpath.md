---
"@hypercerts-org/lexicon": minor
---

Add `@hypercerts-org/lexicon/records`: lex-compatible schemas and TypeScript types for the modern `@atproto/lex` client, generated from the lexicons in lex's own layout. It exports the NSID namespace tree (`app`, `com`, `org`, `pub`), so records are used as in the `@atproto/lex` documentation: `client.create(org.hypercerts.claim.activity, …)`, with the type `org.hypercerts.claim.activity.Main`. Every lexicon except permission sets is also available as a module at `@hypercerts-org/lexicon/records/<nsid path>`. The subpath is published as ESM and needs `@atproto/lex` ^0.4.2, now an optional peer dependency; the range follows the `@atproto/lex` version the schemas are generated with. The `@atproto/xrpc` peer dependency is removed: the published entry points do not import it. The root and `/lexicons` entry points are unchanged.
