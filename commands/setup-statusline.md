---
description: Configure Claude Code status line to display session topics
---

# Setup Status Line for Session Topics

Configure the user's Claude Code status line to display the current session topic.

## Instructions

1. Read the user's `~/.claude/settings.json` file

2. Check the current `statusLine` configuration (if any)

3. Update `settings.json` to set the statusLine to use topic-display:

```json
{
  "statusLine": {
    "type": "command",
    "command": "${CLAUDE_PLUGINS_DIR}/claude-session-topics@dreamiurg/scripts/topic-display $CLAUDE_SESSION_ID"
  }
}
```

Note: `${CLAUDE_PLUGINS_DIR}` expands to the user's plugin cache directory (typically `~/.claude/plugins/cache`).

4. If the user already has a custom statusLine configured, ask if they want to:
   - Replace it with topic display
   - Keep their existing configuration (and show them how to manually integrate)

5. After updating, inform the user:
   - The status line will now show the current session topic
   - Topics are generated every 10 messages (configurable via `CLAUDE_TOPIC_THRESHOLD`)
   - They may need to restart Claude Code for changes to take effect

6. If anything goes wrong, explain the manual setup option:
   - Add to `~/.claude/settings.json`:
   ```json
   "statusLine": {
     "type": "command",
     "command": "~/.claude/plugins/cache/claude-session-topics-marketplace/claude-session-topics/*/scripts/topic-display $CLAUDE_SESSION_ID"
   }
   ```
