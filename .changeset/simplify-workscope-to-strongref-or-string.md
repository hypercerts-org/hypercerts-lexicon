---
"@hypercerts-org/lexicon": minor
---

Simplify workScope to union of strongRef and string

**Breaking Changes:**

- The `workScope` field in `org.hypercerts.claim.activity` is now a union of:
  - `com.atproto.repo.strongRef`: A reference to a work-scope logic record for structured, nested work scope definitions
  - `org.hypercerts.claim.activity#workScopeString`: A free-form string for simple or legacy scopes

- **Removed** from `org.hypercerts.defs`:
  - `workScopeAll` (logical AND operator)
  - `workScopeAny` (logical OR operator)
  - `workScopeNot` (logical NOT operator)
  - `workScopeAtom` (atomic scope reference)

This simplification allows work scope complexity to be managed via referenced records while still supporting simple string-based scopes for straightforward use cases.
