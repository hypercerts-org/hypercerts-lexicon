---
name: writing-changesets
description: Create changeset files for user-facing changes. Use when making schema changes, modifying types, or any change that affects package consumers.
---

# Writing Changesets

Create a changeset file to document user-facing changes for release.

## When to Use

Add a changeset when making changes that affect consumers:

- Adding new lexicons
- Modifying existing lexicon schemas (breaking or non-breaking)
- Changing TypeScript type exports
- Renaming any exported constants, types, or functions
- Modifying generation scripts that affect exported code
- Any change that requires a version bump or affects package consumers

Skip changesets for purely internal changes that don't reach any users
(e.g. CI config, `AGENTS.md`, `tests/`).

**Do not skip changesets for changes to files that are published in the
npm package.** Check the `files` field in `package.json` to see what
ships. Currently that includes `dist/`, `lexicons/`, `SCHEMAS.md`, and
`CHANGELOG.md`. Additionally, npm automatically includes `README.md`
regardless of the `files` field. Changes to any of these files warrant
a changeset.

**Also do not skip changesets for changes to
`.agents/skills/building-with-hypercerts-lexicons/SKILL.md`.** Although
this file is not in the npm package, it is installed by downstream AI
agents via `npx skills add hypercerts-org/hypercerts-lexicon` and acts
as the primary usage guide for those agents. Changes to it are
effectively user-facing (or at least AI-agent-facing) and warrant a
changeset.

## Format

Create in `.changeset/` a Markdown file with a descriptive name (e.g.,
`add-attachment-outcome-types.md`) in this format:

```markdown
---
"@hypercerts-org/lexicon": minor
---

Add new attachment and outcome record types to support rich media claims
```

### Frontmatter Fields

There should be a frontmatter field for each package being changed.
The field name should be the package name, and the field value should
be one of the following change types:

- `patch` - Bug fixes, non-breaking changes
- `minor` - New features, non-breaking additions (also breaking
  changes if the version in `package.json` is still 0.x.y)
- `major` - Breaking changes (_ONLY_ use if the version in `package.json`
  is already greater than 0.x.y)

### Description

In the body after the frontmatter field(s), write a clear, concise
description following conventional commit style. Focus on what changed
and why.

## Example Changesets

**New lexicon type:**

```markdown
---
"@hypercerts-org/lexicon": minor
---

Add attachment record type for supporting rich media evidence on claims
```

**Schema change:**

```markdown
---
"@hypercerts-org/lexicon": minor
---

Convert location field to locations array across activity, evaluation, and measurement records
```

**Breaking change when package version is 1.x.y:**

```markdown
---
"@hypercerts-org/lexicon": major
---

Rename evidence record to attachment and outcome, requiring migration of existing records
```

**Breaking change when package version is 0.x.y:**

```markdown
---
"@hypercerts-org/lexicon": minor
---

Rename evidence record to attachment and outcome, requiring migration of existing records
```

## Key Files

- `.changeset/config.json` - Changeset configuration
- Existing changeset files in `.changeset/` - Reference for naming and format
- `package.json` - Contains version and release scripts
