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

# app.bsky.embed.* - Bluesky embed types
mkdir -p ./generated/types/app/bsky/embed
cat >./generated/types/app/bsky/embed/images.ts <<'EOF'
// Type shim for app.bsky.embed.images lexicon
import type { AppBskyEmbedImages } from '@atcute/bluesky';
export type Main = AppBskyEmbedImages.Main;
export type Image = AppBskyEmbedImages.Image;
export type View = AppBskyEmbedImages.View;
export type ViewImage = AppBskyEmbedImages.ViewImage;
EOF

cat >./generated/types/app/bsky/embed/video.ts <<'EOF'
// Type shim for app.bsky.embed.video lexicon
import type { AppBskyEmbedVideo } from '@atcute/bluesky';
export type Main = AppBskyEmbedVideo.Main;
export type Caption = AppBskyEmbedVideo.Caption;
export type View = AppBskyEmbedVideo.View;
EOF

cat >./generated/types/app/bsky/embed/external.ts <<'EOF'
// Type shim for app.bsky.embed.external lexicon
import type { AppBskyEmbedExternal } from '@atcute/bluesky';
export type Main = AppBskyEmbedExternal.Main;
export type External = AppBskyEmbedExternal.External;
export type View = AppBskyEmbedExternal.View;
export type ViewExternal = AppBskyEmbedExternal.ViewExternal;
EOF

cat >./generated/types/app/bsky/embed/record.ts <<'EOF'
// Type shim for app.bsky.embed.record lexicon
import type { AppBskyEmbedRecord } from '@atcute/bluesky';
export type Main = AppBskyEmbedRecord.Main;
export type View = AppBskyEmbedRecord.View;
export type ViewBlocked = AppBskyEmbedRecord.ViewBlocked;
export type ViewDetached = AppBskyEmbedRecord.ViewDetached;
export type ViewNotFound = AppBskyEmbedRecord.ViewNotFound;
export type ViewRecord = AppBskyEmbedRecord.ViewRecord;
EOF

cat >./generated/types/app/bsky/embed/recordWithMedia.ts <<'EOF'
// Type shim for app.bsky.embed.recordWithMedia lexicon
import type { AppBskyEmbedRecordWithMedia } from '@atcute/bluesky';
export type Main = AppBskyEmbedRecordWithMedia.Main;
export type View = AppBskyEmbedRecordWithMedia.View;
EOF

# com.atproto.label.defs - ATProto label types
mkdir -p ./generated/types/com/atproto/label
cat >./generated/types/com/atproto/label/defs.ts <<'EOF'
// Type shim for com.atproto.label.defs lexicon
import type { ComAtprotoLabelDefs } from '@atcute/atproto';
export type SelfLabels = ComAtprotoLabelDefs.SelfLabels;
export type SelfLabel = ComAtprotoLabelDefs.SelfLabel;
export type Label = ComAtprotoLabelDefs.Label;
EOF

echo "Created type shims for external lexicons"
