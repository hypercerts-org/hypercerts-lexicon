---
"@hypercerts-org/lexicon": minor
---

Add optional `extensions` to badge awards as an open union of inline typed objects and strong references, and optional `extensionTypes` to badge definitions as a list of `{ type, required }` entries declaring which extension types belong to the badge. An award lacking a required extension is invalid; extensions of undeclared types are outside the badge's contract and do not invalidate the award. Integrators can attach their own schema-defined data without modifying the shared badge lexicons. Enforcing the contract and validating third-party payloads remains an application-level responsibility.
