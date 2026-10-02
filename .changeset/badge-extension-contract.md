---
"@hypercerts-org/lexicon": minor
---

Add optional `extensions` to badge awards as an open union of inline typed objects and strong references, and optional `extensionTypes` to badge definitions to declare allowed payload types. Integrators can attach their own schema-defined data without modifying the shared badge lexicons, while consumers can discover the extension contract from the definition before any awards exist. Matching and validating third-party payloads remains an application-level responsibility.
