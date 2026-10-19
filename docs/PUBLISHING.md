# Publishing Guide for Maintainers

This document describes how to publish the `@hypercerts-org/lexicon`
package to npm using GitHub Actions workflows with Changesets. Stable
releases are prepared automatically after pushes to `main` and published
when the generated Release PR is merged. Beta releases remain manually
triggered from ephemeral prerelease branches.

## Maintenance and publishing releases

Clearly stability and predictability for users and developers are
essential.

Unfortunately AT Protocol doesn't support any kind of native
versioning or migrations which could support lexicon schema changes.
Our strategy for dealing with this is documented in the ["Maintenance
and publishing releases" section of
`README.md`](../README.md#maintenance-and-publishing-releases).

## Branch Strategy

- **`main` branch**: Preparation for stable releases, which will be
  tagged and published from this branch. This is the only evergreen
  branch.
- **`prerelease/*` branches**: Ephemeral branches for beta/prerelease
  versions (created from `main`, merged back when done)
- **`feature/*` (or `fix/*`) branches**: Short-lived branches for
  development work, targeting and merged to `main` or a
  `prerelease/*` branch via PR depending on whether a beta or
  prerelease is required.

**Flow:**

- `feature/*` or `fix/*` → `main` or `prerelease/*`
- `prerelease/*` → `main` (beta cycle)

### Release Flow

```text
Stable releases:

feature/* ──► main ──► automatic checks and Changesets versioning
                           │
                           ▼
                 Release v1.0.1 PR
                           │ merge
                           ▼
              npm @latest + git tag + GitHub Release

Beta releases:

prerelease/beta ──► manual workflow dispatch ──► npm @beta + git tag
       │
       └── exit prerelease mode ──► PR to main
                                      │ merge
                                      └──► automatic stable Release PR
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

2. **Release Bot GitHub App:**
   - Configure repository secrets `RELEASE_BOT_APP_ID` and
     `RELEASE_BOT_APP_PRIVATE_KEY`.
   - The app must be installed for this repository with permission to
     write contents and pull requests. It updates the Release PR and
     pushes release commits or tags where needed.

3. **Repository URL in package.json:**
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

Stable releases are not started with `workflow_dispatch`. The process is
automatic once a Changeset-bearing change reaches `main`:

1. **Merge the contributor PR to `main`.** The PR check warns when
   package changes do not include a Changeset.

2. **Review the automatically created or updated Release PR.** A push to
   `main` validates the package and rejects active prerelease mode. If
   Changesets has pending version changes, the workflow creates or
   updates a PR from `changeset-release/main` titled `Release vX.Y.Z`.
   If there are no pending changesets, no new Release PR is needed.

3. **Review and merge the Release PR.** It contains the package version,
   changelog, and lockfile updates. The publishing job runs only when the
   PR is merged, originates from this repository, and has head branch
   `changeset-release/main`.

4. **The workflow validates and publishes the exact merged commit.** It
   checks out and verifies the PR's merge commit SHA, runs
   `npm run check`, and confirms stable prerelease mode is not active. It then
   publishes to npm with the `latest` tag, pushes the version tag, and
   creates the corresponding GitHub Release using npm Trusted
   Publishers/OIDC.

A manual dispatch from `main` is rejected. It cannot prepare a stable
Release PR or publish a stable package. Closed-but-unmerged PRs,
foreign-repository PRs, and other branches do not publish.

## Publishing Beta Releases

Beta releases use ephemeral prerelease branches. Release tooling requires
Node.js `^22.11 || ^24 || >=26` and npm `>=10.9.0`; these are development
requirements, not requirements for consumers of the published lexicons.

Changesets v3 archives versioned prerelease changesets in `.changeset/pre/`.
When migrating an active v2 prerelease, `npx changeset status` migrates the
state automatically. Review and commit all resulting `.changeset/` changes.

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
   git add -A .changeset/
   git commit -m "release: enter beta prerelease mode"
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

If there are no pending non-empty changesets, the workflow succeeds without
versioning, committing, publishing, or pushing tags.

### Finishing a Beta Cycle

When you're ready to promote to stable:

1. **Exit prerelease mode on the prerelease branch:**

   ```bash
   git checkout prerelease/beta
   npx changeset pre exit
   git add -A .changeset/
   git commit -m "release: exit beta prerelease mode"
   git push
   ```

2. **Open a PR from `prerelease/beta` → `main`**
   - The PR check will verify prerelease mode is not active

3. **Merge the PR to `main`**

4. **Complete the stable release.** The push to `main` automatically
   validates the stable release state and creates or updates a versioned
   Release PR when there are pending changesets. Review and merge that
   Release PR to publish to npm with the `latest` tag; do not dispatch the
   workflow on `main`.

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

The Release workflow also validates pushes to `main` and validates the
exact merged Release PR commit before stable publication.

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
