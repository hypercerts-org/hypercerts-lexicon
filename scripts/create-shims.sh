#!/bin/sh
# Create type shims for external lexicon references

# @atcute/leaflet - Leaflet document types
mkdir -p ./generated/types/pub/leaflet/pages
cat > ./generated/types/pub/leaflet/pages/linearDocument.ts << 'EOF'
// Type shim for @atcute/leaflet external lexicons
// This allows our generated code to resolve Leaflet type references
export * from '@atcute/leaflet/types/pages/linearDocument';
EOF

echo "Created type shims for external lexicons"
