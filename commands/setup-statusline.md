---
description: Configure Claude Code status line to display session topics
---

# Setup Status Line for Session Topics

Help the user configure their Claude Code status line to display session topics.
This is an interactive setup that respects and preserves existing configurations.

## Instructions

### Step 1: Examine Current Configuration

Read `~/.claude/settings.json` and analyze the current `statusLine` configuration.

Possible states:

- **No statusLine configured** - user has default/no status line
- **Has existing statusLine** - user has a custom status line they likely want to keep

### Step 2: Present Findings and Options

Based on what you find, present the situation to the user using AskUserQuestion:

**If no statusLine configured:**

- Offer to add topic display as the status line
- This is straightforward - just add the configuration

**If user has existing statusLine (the common case):**

Show them their current command and explain you want to ADD topic display, not replace it.

Offer options (in this order - integration first, replacement last):

1. **Integrate with existing (Recommended)** - Create a wrapper script that shows BOTH
   the topic AND their existing status line output
2. **Prepend topic to existing** - Modify their command to include topic at the start
3. **Replace entirely** - Only use topic display (warns: loses existing status line)
4. **Cancel** - Make no changes

### Step 3: Apply Changes (only with user approval)

**For integration (recommended approach):**

Create a wrapper script at `~/.claude/bin/statusline-with-topics`:

```bash
#!/bin/bash
# Combined status line: topic + existing status
topic=$("~/.claude/plugins/cache/claude-session-topics-marketplace/claude-session-topics/*/scripts/topic-display" "$CLAUDE_SESSION_ID" 2>/dev/null)
existing=$(<THEIR_EXISTING_COMMAND> 2>/dev/null)
# Show topic first if available, then separator, then existing
if [[ -n "$topic" && -n "$existing" ]]; then
    echo "$topic | $existing"
elif [[ -n "$topic" ]]; then
    echo "$topic"
else
    echo "$existing"
fi
```

Then update settings.json to use the wrapper:

```json
"statusLine": {
  "type": "command",
  "command": "~/.claude/bin/statusline-with-topics"
}
```

**For prepend approach:**

Modify their existing command to prepend topic. For example if they have:

```json
"command": "npx -y ccstatusline@latest"
```

Change to:

```json
"command": "bash -c 't=$(~/.claude/plugins/cache/claude-session-topics-marketplace/claude-session-topics/*/scripts/topic-display \"$CLAUDE_SESSION_ID\" 2>/dev/null); e=$(npx -y ccstatusline@latest 2>/dev/null); echo \"${t:+$t | }$e\"'"
```

**For replace (last resort):**

```json
"statusLine": {
  "type": "command",
  "command": "~/.claude/plugins/cache/claude-session-topics-marketplace/claude-session-topics/*/scripts/topic-display \"$CLAUDE_SESSION_ID\""
}
```

### Step 4: Confirm and Explain

After making changes:

- Confirm what was done and show the new configuration
- If wrapper script was created, mention its location
- Explain that topics appear after ~10 messages of conversation
- Note they may need to restart Claude Code for changes to take effect
- Mention `CLAUDE_TOPIC_DEBUG=1` for troubleshooting

### Key Principles

- **Never overwrite without explicit consent** - always show what will change
- **Preserve user's existing setup** - integration is better than replacement
- **Create backup** - if modifying settings.json, show the old value first
- **Be reversible** - explain how to undo changes if needed
