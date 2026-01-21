---
"@hypercerts-org/lexicon": minor
---

Add work scope logic expression system with boolean operators

**New Features:**

- **Work scope logic AST (`org.hypercerts.defs`):**
  - Added `org.hypercerts.defs#workScopeAll` (logical AND): requires all arguments to be satisfied, with recursive union support for nested expressions
  - Added `org.hypercerts.defs#workScopeAny` (logical OR): requires at least one argument to be satisfied, with recursive union support for nested expressions
  - Added `org.hypercerts.defs#workScopeNot` (logical NOT): negates an expression, with recursive union support for nested expressions
  - Added `org.hypercerts.defs#workScopeAtom`: atomic reference to a scope tag record via strongRef
  - All operators support recursive boolean logic expressions through union types in their `args`/`arg` properties, allowing nested combinations of `workScopeAll`, `workScopeAny`, `workScopeNot`, and `workScopeAtom`

- **Work scope tag lexicon (`org.hypercerts.helper.workScopeTag`):**
  - New record type for reusable scope atoms
  - Fields: `createdAt`, `key`, `label` (required), `kind`, `description`, `parent`, `aliases`, `externalReference` (optional)
  - Supports taxonomy/hierarchy via `parent` strongRef
  - Supports external references via URI or blob

- **Activity lexicon (`org.hypercerts.claim.activity`):**
  - Added `org.hypercerts.claim.activity#workScope` field using a union type that references `org.hypercerts.defs#workScopeAll`, `org.hypercerts.defs#workScopeAny`, `org.hypercerts.defs#workScopeNot`, and `org.hypercerts.defs#workScopeAtom`
  - Enables complex boolean logic expressions for work scope definitions with recursive nesting support
  - Replaces simple strongRef approach with expressive AST-based system

**Breaking Changes:**

- The `workScope` field in `org.hypercerts.claim.activity` now expects a work scope logic expression instead of a simple strongRef. Existing records using the old format will need to be migrated to use the new AST structure.
