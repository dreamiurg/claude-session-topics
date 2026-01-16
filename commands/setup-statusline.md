---
description: Configure ccstatusline to display session topics
---

# Setup Status Line for Session Topics

Configure ccstatusline to show session topics as a second line.

## Instructions

### Step 1: Check ccstatusline config

Read `~/.config/ccstatusline/settings.json` to see current configuration.

### Step 2: Add custom-command widget

Add a second line with a `custom-command` widget pointing to the plugin's topic-display script:

```json
{
  "id": "session-topic",
  "type": "custom-command",
  "rawValue": true,
  "commandPath": "node ~/.claude/plugins/cache/dreamiurg/claude-session-topics/*/dist/cli-display.js",
  "color": "cyan"
}
```

The widget goes in the `lines` array as a new line (array of widgets).

### Step 3: Example configuration

A typical ccstatusline config with topics looks like:

```json
{
  "version": 3,
  "lines": [
    [
      {"type": "context-percentage", "color": "brightRed", "rawValue": true},
      {"type": "current-working-dir", "color": "brightBlue", "rawValue": true},
      {"type": "git-branch", "color": "green", "rawValue": true}
    ],
    [
      {
        "id": "session-topic",
        "type": "custom-command",
        "rawValue": true,
        "commandPath": "node ~/.claude/plugins/cache/dreamiurg/claude-session-topics/*/dist/cli-display.js",
        "color": "cyan"
      }
    ]
  ]
}
```

### Step 4: Verify setup

After making changes, verify everything is working by running the topic-display command:

```bash
node ~/.claude/plugins/cache/dreamiurg/claude-session-topics/*/dist/cli-display.js "$CLAUDE_SESSION_ID"
```

This should output something like `New session: gathering context` for new sessions,
or the actual topic if one has been generated.

Tell the user: "Setup complete. Your status line will show 'New session: gathering context'
initially. After a few messages, it will update with an AI-generated topic summarizing
your conversation. Restart Claude Code for changes to take effect."

## Alternative: Use ccstatusline TUI

Users can also run `npx ccstatusline@latest` to open the interactive configuration UI
and add a custom command widget there.

## Troubleshooting

Enable debug logging:

```bash
export CLAUDE_TOPIC_DEBUG=1
```
