---
description: Force-generate a new topic for the current session
---

# Regenerate Topic

Force-generate a new topic immediately, bypassing the message threshold.

## Instructions

Run the force-topic script with the current session ID:

```bash
~/.claude/plugins/cache/claude-session-topics-marketplace/claude-session-topics/*/scripts/force-topic "$CLAUDE_SESSION_ID"
```

The script will:

1. Query claude-mem for session observations (or fall back to transcript)
2. Send context to Haiku for topic generation
3. Update the state file with the new topic
4. Output the generated topic

If successful, tell the user the regenerated topic and that the status line will update on the next refresh.

If it fails, show the error and suggest enabling debug mode with `export CLAUDE_TOPIC_DEBUG=1`.
