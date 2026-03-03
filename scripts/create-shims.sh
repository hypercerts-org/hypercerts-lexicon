#!/bin/sh
# Create type shims for external lexicon references

# @atcute/leaflet - Leaflet document types
mkdir -p ./generated/types/pub/leaflet/pages
cat >./generated/types/pub/leaflet/pages/linearDocument.ts <<'EOF'
// Type shim for @atcute/leaflet external lexicons
// This allows our generated code to resolve Leaflet type references
export * from '@atcute/leaflet/types/pages/linearDocument';
EOF

# app.bsky.richtext.facet - ATProto richtext facet types
mkdir -p ./generated/types/app/bsky/richtext
cat >./generated/types/app/bsky/richtext/facet.ts <<'EOF'
// Type shim for app.bsky.richtext.facet lexicon
// Re-exports from @atcute/bluesky which provides ATProto standard lexicon types
import type { AppBskyRichtextFacet } from '@atcute/bluesky';
export type { AppBskyRichtextFacet };
export type Main = AppBskyRichtextFacet.Main;
export type ByteSlice = AppBskyRichtextFacet.ByteSlice;
export type Link = AppBskyRichtextFacet.Link;
export type Mention = AppBskyRichtextFacet.Mention;
export type Tag = AppBskyRichtextFacet.Tag;
EOF

echo "Created type shims for external lexicons"
