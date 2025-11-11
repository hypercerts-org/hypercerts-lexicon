## Description

Hypercerts lexicon definitions and types.

## Installation

```
npm i hypercerts-lexicon
```

## Usage

```
import { AtpBaseClient } from 'hypercerts-lexicon'
import type { HypercertClaim } from 'hypercerts-lexicon' //to check

const client = new AtpBaseClient({
  service: 'https://bsky.social',
  headers: { Authorization: `Bearer ${token}` }
})

const hypercert: HypercertClaim = {
  $type: 'org.hypercerts.claim',
  title: 'My Impact Work',
  shortDescription: 'Description here',
  workScope: 'Scope of work',
  workTimeFrameFrom: '2023-01-01T00:00:00Z',
  workTimeFrameTo: '2023-12-31T23:59:59Z',
  createdAt: new Date().toISOString()
}

await client.org.hypercerts.claim.create(
  { repo: 'did:plc:example' },
  hypercert
)
``` 
