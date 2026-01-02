---
"@hypercerts-org/lexicon": minor
---

Improved exports structure with semantic collection mappings for extra syntactic sugar.

**Breaking Changes:**

- Renamed `ids` export to `HYPERCERTS_NSIDS_BY_TYPE` (maps type namespaces to NSIDs)

**New Features:**

- Added `HYPERCERTS_NSIDS` object with semantic keys (e.g., `ACTIVITY`, `RIGHTS`, `CONTRIBUTION`)
- Added `HYPERCERTS_LEXICON_JSON` object with semantic keys mapping to raw JSON lexicons
- Added `HYPERCERTS_LEXICON_DOC` object with semantic keys mapping to typed lexicon documents
- All three new objects share the same key structure for consistency

**Migration Guide:**

If you were using the `ids` export (rare):

```typescript
// Before
import { ids } from "@hypercerts-org/lexicon";
const nsid = ids.OrgHypercertsClaimActivity;

// After
import { HYPERCERTS_NSIDS_BY_TYPE } from "@hypercerts-org/lexicon";
const nsid = HYPERCERTS_NSIDS_BY_TYPE.OrgHypercertsClaimActivity;
```

Most users should use individual NSID constants (unchanged):

```typescript
import { ACTIVITY_NSID, RIGHTS_NSID } from "@hypercerts-org/lexicon";
```

Or the new semantic mapping:

```typescript
import { HYPERCERTS_NSIDS } from "@hypercerts-org/lexicon";
const nsid = HYPERCERTS_NSIDS.ACTIVITY; // Same as ACTIVITY_NSID
```
