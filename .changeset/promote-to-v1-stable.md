---
"@hypercerts-org/lexicon": major
---

Promote `@hypercerts-org/lexicon` to v1.0.0 — first stable release.

This changeset contributes no schema or type changes of its own; it
exists solely to force a major version bump so the package crosses the
0.x → 1.0 line. From v1.0.0 onward, the lexicons, TypeScript types,
and generated exports are considered stable for downstream consumers,
and the package follows standard SemVer semantics: breaking changes
bump the major version, non-breaking additions the minor version, and
fixes the patch version. (Prior to v1.0.0, breaking changes were
allowed under `minor` per the SemVer 0.x convention — see
`.claude/skills/writing-changesets/SKILL.md`.)

Any other changesets pending at the time this one is consumed are
folded into the same v1.0.0 release; see the other entries below for
those contributions.
