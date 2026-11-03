---
"@hypercerts-org/lexicon": patch
---

The package is now built with TypeScript 7 and Vite, as the API and SDK packages are; the lexicons and the exported API do not change. One difference in the published type declarations: optional properties are written `x?: T` instead of `x?: T | undefined`. Only projects with `exactOptionalPropertyTypes` notice it, as they can no longer assign `undefined` explicitly to an optional field. The package also no longer ships duplicate declaration files under `dist/generated/`, which no entry point exports.
