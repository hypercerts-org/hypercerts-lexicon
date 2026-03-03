---
"@hypercerts-org/lexicon": patch
---

Add location property to attachment schema

**New Feature:**

- **`location` field** (`org.hypercerts.claim.attachment`):
  - Added optional `location` property as a strong reference (`com.atproto.repo.strongRef`)
  - Allows attachments to associate location metadata directly without using the sidecar pattern
  - The referenced record must conform to the `app.certified.location` lexicon

**Usage:**

```json
{
  "$type": "org.hypercerts.claim.attachment",
  "subjects": [
    {
      "uri": "at://did:plc:.../org.hypercerts.claim.activity/...",
      "cid": "..."
    }
  ],
  "content": [{ "uri": "https://..." }],
  "title": "Field Report",
  "location": {
    "uri": "at://did:plc:.../app.certified.location/abc123",
    "cid": "..."
  },
  "createdAt": "..."
}
```

This change aligns with the location property addition to collections (PR #123), providing a consistent pattern for associating location metadata across record types.
