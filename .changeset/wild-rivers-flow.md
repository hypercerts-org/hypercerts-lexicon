---
"@hypercerts-org/lexicon": minor
---

Remove `project` field from `activity` claim schema.

Reasoning:
- **Separation of Concerns & Flexibility**: We decided to remove the `project` field to keep the activity claim as small as possible and free of redundant information.
- **Lexicon Strategy**: Instead of a direct field, we will use a `collection` lexicon that can encompass project-related data. This allows for collections of collections, enabling more complex structures.
- **Developer Control**: This approach allows app developers to decide whether to enforce a 1-1 or 1-many relationship between projects and activities, rather than enforcing it at the schema level.
