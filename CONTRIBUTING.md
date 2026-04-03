# Contributing to Hypercerts Lexicon

Thank you for your interest in contributing! This guide covers the
contribution process. For technical details about the codebase, see
[AGENTS.md](AGENTS.md).

## Quick Start

```bash
# Fork and clone the repository
git clone https://github.com/your-username/hypercerts-lexicon.git
cd hypercerts-lexicon

# Install dependencies
npm install

# Verify setup
npm run check
```

## Making Changes

### Using AI Agents (Recommended)

The easiest way to contribute is using an AI agent that respects the
guidance in [AGENTS.md](AGENTS.md). The agent will handle code
generation, formatting, and changesets automatically.

### Manual Changes

If making changes manually, follow the workflow in [AGENTS.md § Adding
/ modifying a lexicon](AGENTS.md#adding--modifying-a-lexicon).

**Key points:**

- Never edit `generated/` or `dist/` directories directly
- Run `npm run gen-api` after modifying lexicon JSON files
- Run `npm run format` before committing
- Run `npm run check` to validate everything
- **Always create a changeset** for public API changes

## Changesets (Required)

Create a changeset for any user-facing changes:

```bash
npm run changeset
```

Follow the prompts to select version bump type and describe
changes. See [AGENTS.md § Versioning](AGENTS.md#versioning) for
details.

## Pull Request Process

1. **Target the `main` branch** unless there is a specific need
   to use a `prerelease/*` branch. Consult the maintainers / community
   if unsure.
2. **Ensure all checks pass**: `npm run check`
3. **Include a changeset** if required
4. **Write clear commit messages** using conventional commit format
5. **Respond to review feedback** promptly

### Before Submitting

```bash
npm run format  # Format code
npm run check   # Validate everything passes
```

## Code Quality Standards

- **Formatting**: Run `npm run format` (uses Prettier + EditorConfig)
- **Linting**: Run `npm run lint`
- **Type checking**: Run `npm run typecheck`
- **Lexicon style**: Run `npm run style:check`

See [LEXICON_STYLE_GUIDE.md](LEXICON_STYLE_GUIDE.md) for lexicon best
practices.

## Development Commands

See [AGENTS.md § Development Commands](AGENTS.md#development-commands)
for the complete list of available npm scripts.

## Project Structure

See [AGENTS.md § Project Structure](AGENTS.md#project-structure) for
directory layout and file organization.

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/hypercerts-org/hypercerts-lexicon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hypercerts-org/hypercerts-lexicon/discussions)
- **Documentation**: [README.md](README.md), [AGENTS.md](AGENTS.md), [SCHEMAS.md](SCHEMAS.md)

## Release Process

**Contributors only create changesets.** Releases are handled by
maintainers via GitHub Actions on the `main` branch. See
[docs/PUBLISHING.md](docs/PUBLISHING.md) for details.

## License

Contributions are licensed under the MIT License.

---

**Thank you for contributing!** Your work helps make the Hypercerts
protocol better for everyone.
