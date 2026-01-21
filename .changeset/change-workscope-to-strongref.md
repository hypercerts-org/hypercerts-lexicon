---
"@hypercerts-org/lexicon": minor
---

Change workScope from inline object definition to strongRef in activity lexicon. This breaking change removes the workScope definition (withinAllOf, withinAnyOf, withinNoneOf properties) and changes the workScope property to reference an external record via strongRef, allowing for more flexible work scope definitions.
