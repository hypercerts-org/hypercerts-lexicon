# Publishing Guide for Maintainers

This document describes how to publish the `@hypercerts-org/lexicon`
package to npm using GitHub Actions workflows with Changesets. The
workflow uses `main` as the sole release branch, with ephemeral
prerelease branches for beta testing. All releases are manually
triggered to give you full control over when releases are made.

## Branch Strategy

- **`main` branch**: Stable releases (the only long-lived branch)
- **`feature/*` branches**: Short-lived branches for development work,
  merged to `main` via PR
- **`prerelease/*` branches**: Ephemeral branches for beta/prerelease
  versions (created from `main`, merged back when done)

**Flow:** `feature/*` → `main` (stable), or
`prerelease/beta` → `main` (beta cycle)

### Release Flow

```text
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Stable releases:                                                │
│                                                                  │
│  feature/* ───► main ───► Manual publish @latest (1.0.0)         │
│                                                                  │
│  Beta releases:                                                  │
│                                                                  │
│  prerelease/beta                                                 │
│        │                                                         │
│        │  npx changeset pre enter beta                           │
│        ▼                                                         │
│  prerelease/beta ──► Manual publish @beta                        │
│        │              (1.0.0-beta.0, 1.0.0-beta.1)               │
│        │                                                         │
│        │  npx changeset pre exit                                 │
│        │  (when ready for stable)                                │
│        ▼                                                         │
│   PR to main ──► Manual publish @latest (1.0.0)                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Prerequisites

Before publishing, ensure you have:

1. **npm Trusted Publisher configured:**
   - The workflow uses npm Trusted Publishers via GitHub OIDC for secure,
     token-less publishing
   - Configure on npmjs.com: Package settings → Publishing access → Add a
     GitHub Actions publisher
   - **Required settings:**
     - Organization/User: `hypercerts-org`
     - Repository: `hypercerts-lexicon`
     - Workflow filename: `release.yml` (must match exactly, case-sensitive)
   - The npm CLI (v11.5.1+) automatically detects OIDC and uses it
   - See: <https://docs.npmjs.com/trusted-publishers>
   - **No `NPM_TOKEN` secret is required** - Trusted Publishers eliminates
     the need for long-lived tokens

2. **Repository URL in package.json:**
   - `package.json` must have a `repository.url` field
   - This is required for npm Trusted Publishers to verify the package source
   - The repo already has this configured correctly

## Adding Changesets

Before publishing, you need to create changesets for any user-facing
changes:

```bash
npx changeset
```

This will:

1. Prompt you to select which packages changed
2. Ask for the version bump type (major/minor/patch)
3. Create a markdown file in `.changeset/` with your changes

**Note:** Changesets generates files with random names (e.g.,
`beige-clowns-relax.md`). This is intentional to prevent filename
collisions when multiple contributors create changesets simultaneously.
The filename doesn't affect version ordering—Changesets uses git history
to determine the order of changes. You can rename these files if desired,
but it's not necessary.

## Publishing a Stable Release

To publish a stable release to npm:

1. **Run the workflow:**
   - Navigate to: <https://github.com/hypercerts-org/hypercerts-lexicon/actions/workflows/release.yml>
   - Click "Run workflow"
   - Select the branch: **`main`**
   - Click "Run workflow" to start

2. **What happens:**
   - The workflow validates the code and regenerates TypeScript types
   - If there are pending changesets, it creates a "Release Pull Request"
   - Merge the Release PR to publish to npm with the `latest` tag
   - If no changesets exist, nothing is published

## Publishing Beta Releases

Beta releases use ephemeral prerelease branches.

### Starting a Beta Cycle

1. **Create a prerelease branch from `main`:**

   ```bash
   git checkout main
   git pull
   git checkout -b prerelease/beta
   ```

2. **Enter prerelease mode:**

   ```bash
   npx changeset pre enter beta
   git add .changeset/pre.json
   git commit -m "chore: enter beta prerelease mode"
   git push -u origin prerelease/beta
   ```

3. **Publish the first beta:**
   - Navigate to: <https://github.com/hypercerts-org/hypercerts-lexicon/actions/workflows/release.yml>
   - Click "Run workflow"
   - Select the branch: **`prerelease/beta`**
   - Click "Run workflow"

4. **What happens:**
   - The workflow validates the code
   - Versions packages based on pending changesets
   - Commits and pushes version changes to the prerelease branch
   - Publishes to npm with the `beta` tag
   - Version format: `1.0.0-beta.0`, `1.0.0-beta.1`, etc.

### Publishing Additional Betas

To add changes and publish more betas:

1. Create feature branches from `prerelease/beta` (or cherry-pick
   from `main`)
2. Add changesets as normal
3. Merge to `prerelease/beta`
4. Run the release workflow on `prerelease/beta`

### Finishing a Beta Cycle

When you're ready to promote to stable:

1. **Exit prerelease mode on the prerelease branch:**

   ```bash
   git checkout prerelease/beta
   npx changeset pre exit
   git add .changeset/pre.json
   git commit -m "chore: exit prerelease mode"
   git push
   ```

2. **Open a PR from `prerelease/beta` → `main`**
   - The PR check will verify prerelease mode is not active

3. **Merge the PR to `main`**

4. **Run the release workflow on `main`:**
   - The workflow detects the exit intent in `pre.json`
   - `changeset version` strips prerelease tags and removes `pre.json`
   - A "Release Pull Request" is created with the stable versions
   - Merge the Release PR to publish to npm with the `latest` tag

5. **Delete the prerelease branch** (it's ephemeral)

## Validating Releases (PRs)

When you open a pull request to `main`, the "PR Check" workflow
automatically runs to:

- Check if package changes (lexicons, types, package.json) have
  corresponding changesets
- Warn if changesets are missing
- **Reject the PR if prerelease mode is still active** - This ensures
  `npx changeset pre exit` has been run before merging a prerelease
  branch to `main`

## Version Management

Versions are determined by Changesets:

- **Patch**: Bug fixes and minor updates (1.0.0 → 1.0.1)
- **Minor**: New features (1.0.0 → 1.1.0)
- **Major**: Breaking changes (1.0.0 → 2.0.0)

You specify the version bump type when creating a changeset with
`npx changeset`.

The `prepublishOnly` script ensures types are regenerated before
publishing, so the published package always includes the latest
generated TypeScript types.

## Why Not a Long-Lived `develop` Branch?

Changesets' prerelease mode (`pre.json`) is designed for a
single-branch workflow. Using a long-lived `develop` branch in pre
mode causes problems when merging between branches:

- `pre.json` state conflicts on merge
  ([changesets#239](https://github.com/changesets/changesets/issues/239))
- Merging `main` back to `develop` (e.g. for CHANGELOG updates)
  disrupts pre mode
- No upstream solution exists for multi-branch prerelease workflows

Ephemeral prerelease branches avoid these issues entirely.
