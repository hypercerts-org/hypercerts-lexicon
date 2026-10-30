---
"@hypercerts-org/lexicon": minor
---

Add `@hypercerts-org/lexicon/records`: lex-compatible record schemas and TypeScript types for the modern `@atproto/lex` client, generated from the lexicons. Each record type is a named export (`activity` and `Activity`, `badgeAward` and `BadgeAward`, named after the existing NSID constants) that works with `Client.create` and validates records; every lexicon is also available as a namespace and as a per-lexicon module under `@hypercerts-org/lexicon/records/*`. The subpath is ESM only and needs `@atproto/lex` ^0.4.2, now an optional peer dependency. The root and `/lexicons` entry points are unchanged.
