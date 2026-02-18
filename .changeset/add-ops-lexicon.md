---
"@hypercerts-org/lexicon": minor
---

Add work scope logic lexicons (ops and workScopeExpr)

**New Features:**

- **New lexicon (`org.hypercerts.helper.ops`):**
  - Operator node record type for work scope logic expressions
  - Supports nested boolean logic operations (AND, OR, NOT)
  - Fields:
    - `op` (required): Operator identifier with knownValues `'all'`, `'any'`, `'not'`
    - `args` (required): Array of strongRefs pointing to `org.hypercerts.helper.workScopeTag` (leaf atoms) or other `org.hypercerts.helper.ops` records (nested expressions)
    - `createdAt` (required): Client-declared timestamp
  - Enables complex work scope logic by allowing operators to reference other operators or scope tags recursively
  - Operator semantics are defined by consuming applications

- **New lexicon (`org.hypercerts.helper.workScopeExpr`):**
  - A flat boolean expression for simple work-scope definitions: (ALL allOf) AND (ANY anyOf) AND (NONE noneOf)
  - Covers the majority of practical scope definitions without recursion
  - Fields:
    - `version` (required): Schema version integer (start with 1)
    - `label`: Optional short human-readable label for UI display
    - `description`: Optional longer explanation of scope intent
    - `allOf`: Array of strongRefs — all must match for in-scope
    - `anyOf`: Array of strongRefs — at least one must match
    - `noneOf`: Array of strongRefs — none may match (exclusion)
    - `createdAt` (required): Client-declared timestamp
  - An empty expression (all arrays absent/empty) represents an unconstrained scope

**Usage:**

The `org.hypercerts.helper.ops` and `org.hypercerts.helper.workScopeExpr` lexicons work together with `org.hypercerts.helper.workScopeTag` to define work scope logic. Use `workScopeExpr` for simple flat include/exclude/require patterns, and `ops` for full nested boolean logic. Both can be referenced via strongRefs in activity records' `workScope` field.
