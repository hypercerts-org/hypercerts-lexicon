---
"@hypercerts-org/lexicon": minor
---

Add `@hypercerts-org/lexicon/records`: lex-compatible record schemas and TypeScript types for the modern `@atproto/lex` client, generated from the lexicons. Each record type is a named export (`activity` and `Activity`, `badgeAward` and `BadgeAward`, named after the existing NSID constants) that works with `Client.create` and validates records; every lexicon except permission sets is also available as a namespace and as a per-lexicon module, `@hypercerts-org/lexicon/records/<nsid path>.defs`. The subpath is published as ESM and needs `@atproto/lex` ^0.4.2, now an optional peer dependency; the range follows the `@atproto/lex` version the schemas are generated with. The root and `/lexicons` entry points are unchanged.
