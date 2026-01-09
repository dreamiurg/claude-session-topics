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

### Context Sources

1. **claude-mem** (preferred) - If installed, queries the claude-mem SQLite database for session observations
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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

[MIT](LICENSE) - see LICENSE file for details.

## Related Projects

- [claude-mem][claude-mem] - Persistent memory for Claude Code sessions
- [Claude Code](https://claude.ai/code) - Anthropic's AI coding assistant

[claude-mem]: https://github.com/thedotmack/claude-mem
