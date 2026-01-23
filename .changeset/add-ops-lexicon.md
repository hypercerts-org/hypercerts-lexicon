---
"@hypercerts-org/lexicon": minor
---

Add ops lexicon for work scope logic operator nodes

**New Features:**

- **New lexicon (`org.hypercerts.helper.ops`):**
  - Operator node record type for work scope logic expressions
  - Supports nested boolean logic operations (AND, OR, NOT)
  - Fields:
    - `op` (required): Operator identifier (e.g., 'all', 'any', 'not')
    - `args` (required): Array of strongRefs pointing to `org.hypercerts.helper.workScopeTag` (leaf atoms) or other `org.hypercerts.helper.ops` records (nested expressions)
    - `createdAt` (required): Client-declared timestamp
  - Enables complex work scope logic by allowing operators to reference other operators or scope tags recursively
  - Operator semantics are defined by consuming applications

**Usage:**

The `org.hypercerts.helper.ops` lexicon works together with `org.hypercerts.helper.workScopeTag` to create nested boolean logic expressions for work scope definitions. Operators can be referenced via strongRefs in activity records' `workScope` field.

**Example:**

```json
{
  "$type": "org.hypercerts.helper.ops",
  "op": "all",
  "args": [
    { "uri": "at://.../workScopeTag/ipfs", "cid": "..." },
    { "uri": "at://.../workScopeTag/go", "cid": "..." }
  ],
  "createdAt": "2024-01-01T00:00:00Z"
}
```
