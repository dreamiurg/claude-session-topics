---
description: Configure Claude Code status line to display session topics
---

# Setup Status Line for Session Topics

Help the user configure their Claude Code status line to display session topics.
This is an interactive setup that respects existing configurations.

## Instructions

### Step 1: Examine Current Configuration

Read `~/.claude/settings.json` and analyze the current `statusLine` configuration.

Possible states:

- **No statusLine configured** - user has default/no status line
- **Using ccstatusline** - command contains `ccstatusline` (popular status line tool)
- **Using topic-display** - already configured for this plugin
- **Custom configuration** - some other custom status line command

### Step 2: Present Findings and Options

Based on what you find, present the situation to the user using AskUserQuestion:

**If no statusLine configured:**

- Offer to add topic display as the status line
- Show what the configuration will look like

**If using ccstatusline or another tool:**

- Explain they have an existing status line tool
- Offer options:
  1. Replace with topic-display (simple, just shows topic)
  2. Keep current setup and show manual integration instructions
  3. Cancel - make no changes

**If already using topic-display:**

- Inform user it's already configured
- Offer to show current configuration or make adjustments

### Step 3: Apply Changes (only with user approval)

If user approves changes, update `~/.claude/settings.json` with:

```json
"statusLine": {
  "type": "command",
  "command": "~/.claude/plugins/cache/claude-session-topics-marketplace/claude-session-topics/*/scripts/topic-display \"$CLAUDE_SESSION_ID\""
}
```

Important: Use the glob pattern `*/` for version to ensure it works across plugin updates.

### Step 4: Confirm and Explain

After making changes (or if user chose not to change):

- Confirm what was done
- Explain that topics appear after ~10 messages of conversation
- Note they may need to restart Claude Code for changes to take effect
- Mention `CLAUDE_TOPIC_DEBUG=1` for troubleshooting

### Manual Integration Note

If user wants to keep their existing status line but add topics, suggest they can:

1. Create a wrapper script that combines their existing command with topic-display
2. Or pipe outputs together in their statusLine command

Example wrapper approach:

```bash
#!/bin/bash
topic=$(~/.claude/plugins/cache/claude-session-topics-marketplace/claude-session-topics/*/scripts/topic-display "$CLAUDE_SESSION_ID" 2>/dev/null)
existing=$(npx -y ccstatusline@latest 2>/dev/null)
echo "${topic:+$topic | }$existing"
```
