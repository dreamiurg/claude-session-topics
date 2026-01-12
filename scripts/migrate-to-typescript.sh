#!/bin/bash
# Migrate from Bash to TypeScript implementation

set -e

echo "Building TypeScript version..."
npm run build

echo "Updating hooks configuration..."
# Update hooks to use TypeScript
cat > hooks/hooks.json << 'HOOKEOF'
{
  "description": "Topic generation hooks for Claude Code sessions",
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cat | node ${CLAUDE_PLUGIN_ROOT}/dist/cli.js"
          }
        ]
      }
    ]
  }
}
HOOKEOF

echo "Archiving old Bash scripts..."
mkdir -p scripts/bash-archive
mv scripts/topic-generator scripts/bash-archive/ 2>/dev/null || true
mv scripts/topic-display scripts/bash-archive/ 2>/dev/null || true
mv scripts/force-topic scripts/bash-archive/ 2>/dev/null || true
mv scripts/topic-generator-debug scripts/bash-archive/ 2>/dev/null || true
mv lib/common.sh scripts/bash-archive/ 2>/dev/null || true

echo "Migration complete!"
echo "Please restart Claude for changes to take effect."
