# Publishing Guide for Maintainers

This document describes how to publish the `@hypercerts-org/lexicon`
package to npm using GitHub Actions workflows with Changesets. All
publishing workflows are manually triggered to give you full control
over when releases are made.

## Prerequisites

Before publishing, ensure you have:

1. **GitHub Secrets configured:**
   - `RELEASE_PAT`: GitHub Personal Access Token with permissions to bypass
     branch protection rules. Required for the beta release workflow that
     commits and pushes version changes to protected branches.
     - **Recommended:** Fine-grained Personal Access Token
       - Create at: <https://github.com/settings/tokens?type=beta>
       - Repository access: Select this repository
       - Repository permissions: `Contents` (read and write), `Metadata`
         (read-only)
     - **Alternative:** Classic Personal Access Token (if fine-grained
       doesn't work with your branch protection settings)
       - Create at: <https://github.com/settings/tokens>
       - Required scopes: `repo` (full control of private repositories)
     - This is needed because `GITHUB_TOKEN` cannot bypass branch protection
     - **Note:** Ensure branch protection rules allow the token to bypass
       protection (uncheck "Do not allow bypassing the above settings" or
       add the token as an allowed actor)
   - `NPM_TOKEN`: npm access token with publish permissions for
     `@hypercerts-org` scope

## Adding Changesets

Before publishing, you need to create changesets for any user-facing
changes:

```bash
npm run changeset
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
but it's not necessary and not recommended in collaborative environments.

## Publishing a Stable Release

To publish a stable release to npm:

1. **Navigate to GitHub Actions:**
   - Go to the repository on GitHub
   - Click on the "Actions" tab

2. **Select the workflow:**
   - Choose "Release" from the workflow list

3. **Run the workflow:**
   - Click "Run workflow"
   - Select the branch (typically `main`)
   - Click "Run workflow" to start

4. **What happens:**
   - The workflow validates the code and regenerates TypeScript types
   - If there are pending changesets, it creates a "Release Pull Request"
   - Merge the Release PR to publish to npm with the `latest` tag
   - If no changesets exist, nothing is published

## Publishing a Beta Release

To publish a beta/prerelease version:

1. **Navigate to GitHub Actions:**
   - Go to the "Actions" tab

2. **Select the workflow:**
   - Choose "Release Beta"

3. **Run the workflow:**
   - Click "Run workflow"
   - Select the branch (must be `main`)
   - Click "Run workflow"

4. **What happens:**
   - The workflow enters beta prerelease mode (if not already)
   - Versions packages based on pending changesets
   - Publishes to npm with the `beta` tag
   - Version format: `0.9.0-beta.1`, `0.9.0-beta.2`, etc.
   - Commits and pushes version changes back to the repository

**Note:** This workflow requires the `RELEASE_PAT` secret to bypass
branch protection rules when pushing version changes.

## Validating Releases (PRs)

When you open a pull request, the "PR Check" workflow automatically
runs to:

- Check if package changes (lexicons, types, package.json) have
  corresponding changesets
- Warn if changesets are missing

This helps ensure all user-facing changes are properly documented
before merging.

## Version Management

Versions are determined by Changesets:

- **Patch**: Bug fixes and minor updates (0.9.0 → 0.9.1)
- **Minor**: New features (0.9.0 → 0.10.0)
- **Major**: Breaking changes (0.9.0 → 1.0.0)

You specify the version bump type when creating a changeset with
`npm run changeset`.

The `prepublishOnly` script ensures types are regenerated before
publishing, so the published package always includes the latest
generated TypeScript types.
