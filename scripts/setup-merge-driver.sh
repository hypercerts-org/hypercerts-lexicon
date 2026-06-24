#!/bin/bash
# Configure git merge driver for SCHEMAS.md
#
# When SCHEMAS.md has conflicts, it will be regenerated from lexicon files.
# The driver must write only to Git's %A merge-file path. Generating
# ./SCHEMAS.md as a worktree side effect leaves rebases dirty between steps.
# This script should be auto-run on npm install via the "prepare" script.

git config --local merge.schemas.driver "npm run --silent gen-schemas-md -- --outfile \"%A\""

echo "✅ Configured merge driver for SCHEMAS.md"
