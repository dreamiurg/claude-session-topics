# Claude Session Topics

Automatic AI-powered session topic generation for [Claude Code](https://claude.ai/code) sessions.

## Overview

Claude Session Topics generates concise, descriptive topic summaries for your Claude Code
sessions using Claude Haiku. Topics are automatically generated as you work and stored in
state files for easy access by external tools like status bars, dashboards, or logging systems.

### Features

- **Automatic topic generation** - Topics are generated after configurable message thresholds
- **claude-mem integration** - Uses [claude-mem][claude-mem] observations when available
  for richer context
- **Fallback to transcript** - Gracefully falls back to transcript parsing when claude-mem is unavailable
- **Non-blocking** - Background generation ensures hooks don't slow down your workflow
- **Session cleanup** - Automatic cleanup of state files when sessions end

### Example Topics

```text
OAuth debug: fixing schema validation
Blog post: adding code snippets
tmux config: wiring session display
API refactor: updating endpoints
```

## Installation

### As a Claude Code Plugin

```bash
# Add the marketplace
claude /marketplace-add https://github.com/dreamiurg/claude-session-topics.git

# Install the plugin
claude /plugin-install claude-session-topics
```

### Manual Installation

Clone the repository:

```bash
git clone https://github.com/dreamiurg/claude-session-topics.git ~/.claude/plugins/claude-session-topics
```

## Configuration

### Claude Code Hooks

Add these hooks to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cat | ~/.claude/plugins/claude-session-topics/scripts/topic-generator"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cat | ~/.claude/plugins/claude-session-topics/scripts/session-cleanup"
          }
        ]
      }
    ]
  }
}
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_TOPIC_THRESHOLD` | `10` | Messages between topic regeneration |
| `CLAUDE_TOPIC_MAX_CHARS` | `50` | Maximum characters for generated topic |
| `CLAUDE_TOPIC_CONTEXT_LINES` | `20` | Transcript lines to use as context |
| `CLAUDE_TOPIC_LOCK_TIMEOUT` | `60` | Seconds before stale lock is broken |
| `CLAUDE_TOPIC_MEM_LIMIT` | `5` | Number of claude-mem observations to fetch |
| `CLAUDE_TOPIC_DEBUG` | `0` | Set to `1` to enable debug logging |
| `CLAUDE_MEM_DB` | `~/.claude-mem/claude-mem.db` | Path to claude-mem database |

## Usage

### Reading Topics

The `topic-display` script reads the current topic for a session:

```bash
# Display topic for a session
./scripts/topic-display <session_id>

# Example output
# "OAuth debug: fixing auth flow (5m)"
```

### Integration Examples

#### tmux Status Line

```bash
# In your tmux.conf
set -g status-right "#(~/.claude/plugins/claude-session-topics/scripts/topic-display $CLAUDE_SESSION_ID)"
```

#### Shell Prompt

```bash
# In your .bashrc or .zshrc
claude_topic() {
  if [[ -n "$CLAUDE_SESSION_ID" ]]; then
    ~/.claude/plugins/claude-session-topics/scripts/topic-display "$CLAUDE_SESSION_ID"
  fi
}
PS1='$(claude_topic) $ '
```

## Architecture

### State Files

Topics are stored in `$TMPDIR/claude-topic-<session_id>.json`:

```json
{
  "count": 5,
  "topic": "OAuth debug: fixing auth flow",
  "error": "",
  "generated_at": 1704067200
}
```

| Field | Type | Description |
|-------|------|-------------|
| `count` | integer | Messages since last topic generation (resets to 0 after generation) |
| `topic` | string | Generated topic or empty if not yet generated |
| `error` | string | Error message (e.g., "waiting for conversation") or empty |
| `generated_at` | integer | Unix timestamp of last state update |

### Session ID Formats

The plugin accepts two session ID formats:

- **UUID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (standard Claude session)
- **Agent ID**: `agent-xxxxxxx` (sub-agents spawned by Claude)

### Context Sources

1. **claude-mem** (preferred) - If installed, queries the claude-mem SQLite database
   for session observations
2. **Transcript** (fallback) - Parses the Claude Code transcript for recent messages

## Requirements

- [Claude Code](https://claude.ai/code) CLI
- `jq` - JSON processor
- `sqlite3` - For claude-mem integration (optional)
- Bash 4.0+

## Development

### Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install --install-hooks
```

### Running Tests

```bash
# Test topic generation
echo '{"session_id":"test-1234-5678-9abc-def012345678"}' | ./scripts/topic-generator

# Check state file
cat $TMPDIR/claude-topic-test-1234-5678-9abc-def012345678.json
```

## Troubleshooting

### Enable Debug Logging

```bash
export CLAUDE_TOPIC_DEBUG=1
```

Debug output goes to stderr and shows lock acquisition, context source selection,
and topic generation progress.

### Common Issues

**Topics not generating:**

1. Check that `claude` CLI is installed: `which claude`
2. Check that `jq` is installed: `which jq`
3. Verify hooks are configured in `~/.claude/settings.json`
4. Enable debug logging to see what's happening

**"waiting for conversation" error:**

This appears when there's no context available yet. It clears automatically after
a few messages when transcript data becomes available.

**Stale topics / topics not updating:**

- Topics only regenerate every `CLAUDE_TOPIC_THRESHOLD` messages (default: 10)
- Check for stale lock files: `ls $TMPDIR/claude-topic-*.lock`
- Remove stale locks: `rmdir $TMPDIR/claude-topic-*.lock`

**claude-mem not being used:**

- Verify database exists: `ls ~/.claude-mem/claude-mem.db`
- Check sqlite3 is installed: `which sqlite3`
- The plugin falls back to transcript parsing if claude-mem is unavailable

### Verifying Installation

```bash
# Check all dependencies
which jq claude sqlite3

# Test topic generation manually
echo '{"session_id":"00000000-0000-0000-0000-000000000000"}' | \
  CLAUDE_TOPIC_DEBUG=1 ./scripts/topic-generator

# Check state file
cat $TMPDIR/claude-topic-00000000-0000-0000-0000-000000000000.json
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

[MIT](LICENSE) - see LICENSE file for details.

## Related Projects

- [claude-mem][claude-mem] - Persistent memory for Claude Code sessions
- [Claude Code](https://claude.ai/code) - Anthropic's AI coding assistant

[claude-mem]: https://github.com/thedotmack/claude-mem
