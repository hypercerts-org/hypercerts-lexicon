---
"@hypercerts-org/lexicon": minor
---

Increase the free-form activity work scope string limit from 100 to 1,000 graphemes, with a 10,000-byte cap.

The previous 100-grapheme limit was too tight for simple work scope descriptions: if the relevant terms are around 10–15 characters each, the field only fits roughly 5–6 words. Gainforest hit this limit while implementing the work scope string field and had to move to the CEL-based work scope form earlier than intended.

Most invalid work scope records were caused by the newer typed shape requiring `$type`; the length cap only affects two known accounts at the time (`k-redence.bsky.social` from the hackathon and `simocracry-bhutan.bsky.social`, which exceeds the old limit by 4 characters), so raising it fixes those without changing currently valid claims.

The string form is the simplest option for producers that do not need CEL's structured, machine-evaluable semantics. Raising the grapheme and byte limits keeps that simple path viable for concise natural-language scopes while CEL remains available for more complex tagging and query logic.
