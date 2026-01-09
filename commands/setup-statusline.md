---
description: Configure Claude Code status line to display session topics
---

# Setup Status Line for Session Topics

Add session topic display to your Claude Code status line.

## Default Setup (ccstatusline users)

Most users have ccstatusline configured. The default setup adds topics as a second
line below ccstatusline output.

### Step 1: Create the wrapper script

Create `~/.claude/bin/statusline-with-topics`:

```bash
#!/bin/bash
# Combined status line: ccstatusline + session topic
# Line 1: ccstatusline metrics (model, tokens, git, etc.)
# Line 2: Session topic with age indicator

input=$(cat)
echo "$input" | npx -y ccstatusline@latest 2>/dev/null

topic=$(~/.claude/plugins/cache/claude-session-topics-marketplace/claude-session-topics/*/scripts/topic-display "$CLAUDE_SESSION_ID" 2>/dev/null)
[[ -n "$topic" ]] && echo "# $topic"
```

Make it executable:

```bash
mkdir -p ~/.claude/bin
chmod +x ~/.claude/bin/statusline-with-topics
```

### Step 2: Update settings.json

Change the statusLine in `~/.claude/settings.json`:

```json
"statusLine": {
  "type": "command",
  "command": "~/.claude/bin/statusline-with-topics"
}
```

### Step 3: Restart Claude Code

Topics appear after ~10 messages when there's enough context to summarize.

## Troubleshooting

Enable debug logging:

```bash
export CLAUDE_TOPIC_DEBUG=1
```

## Other Configurations

If the user doesn't have ccstatusline or wants a different setup, adapt the wrapper
script to their needs. The key is calling `topic-display` with `$CLAUDE_SESSION_ID`
and outputting the result as a second line.
