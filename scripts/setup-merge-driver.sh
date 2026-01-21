#!/bin/bash
# Configure git merge driver for SCHEMAS.md
#
# When SCHEMAS.md has conflicts, it will be regenerated from lexicon files.
# This script should be auto-run on npm install via the "prepare" script.

git config --local merge.schemas.driver "npm run gen-schemas && git add -u -- %A"

echo "✅ Configured merge driver for SCHEMAS.md"
