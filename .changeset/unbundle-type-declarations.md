---
"@hypercerts-org/lexicon": patch
---

Switch from bundled to individual type declaration files

**Changes:**

- Removed `rollup-plugin-dts` dependency
- Switched to native TypeScript declaration generation
- Type declarations now mirror source structure in `dist/types/`
- Individual type files are small (1-3KB each) and lazy-loaded by TypeScript
- Improves IDE performance by avoiding single 39MB bundled declaration file

**Technical Details:**

The package now generates individual `.d.ts` files alongside the bundled JavaScript
output. This provides better IDE performance as TypeScript can lazy-load type files
on demand rather than parsing a massive bundled declaration file upfront.
