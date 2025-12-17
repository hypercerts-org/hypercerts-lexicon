# Publishing Guide for Maintainers

This document describes how to publish the `@hypercerts-org/lexicon`
package to npm using GitHub Actions workflows. All publishing
workflows are manually triggered to give you full control over when
releases are made.

## Prerequisites

Before publishing, ensure you have:

1. **GitHub Secrets configured:**
   - `GH_PA_TOKEN`: GitHub Personal Access Token with permissions for
     releases
   - `NPM_TOKEN`: npm access token with publish permissions for
     `@hypercerts-org` scope

2. **GitHub Environments configured:**
   - `test`: For the build-and-test job
   - `staging`: For the semantic-release job

## Publishing a Release

To publish a new release to npm:

1. **Navigate to GitHub Actions:**
   - Go to the repository on GitHub
   - Click on the "Actions" tab

2. **Select the workflow:**
   - Choose "Build and release" from the workflow list

3. **Run the workflow:**
   - Click "Run workflow"
   - Select the branch (typically `main`)
   - Click "Run workflow" to start

4. **What happens:**
   - The workflow runs linting and regenerates TypeScript types
   - If successful, semantic-release analyzes your commits
   - If there are version-worthy changes, it:
     - Determines the new version based on
       [Conventional Commits](https://www.conventionalcommits.org/)
     - Updates `CHANGELOG.md`
     - Creates a GitHub release
     - Publishes to npm with the new version

## Publishing a Prerelease

To publish a beta/prerelease version:

1. **Navigate to GitHub Actions:**
   - Go to the "Actions" tab

2. **Select the prerelease workflow:**
   - Choose "Build and release - staging"

3. **Run the workflow:**
   - Click "Run workflow"
   - Select the branch (typically `develop` or a feature branch)
   - Click "Run workflow"

4. **What happens:**
   - Same process as above, but publishes with a `beta` tag
   - Version format: `1.2.3-beta.1`, `1.2.3-beta.2`, etc.

## Validating Releases (PRs)

When you open a pull request, the "Build and release - staging"
workflow automatically runs in dry-run mode to:

- Validate that the code builds successfully
- Check that types regenerate correctly
- Show what version would be released (without actually publishing)

This helps catch issues before merging.

## Version Management

Versions are automatically determined by semantic-release based on
commit messages:

- `feat:` → minor version bump (1.0.0 → 1.1.0)
- `fix:` → patch version bump (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` or `!` → major version bump (1.0.0 → 2.0.0)

The `prepublishOnly` script ensures types are regenerated before
publishing, so the published package always includes the latest
generated TypeScript types.
