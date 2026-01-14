# Claude Session Topics

> *"What was I working on in that other terminal?"*

AI-generated topic summaries for your Claude Code sessions. See what each session is about at a glance.

![Claude Code session topics in tmux status line](http://dreamiurg.net/images/claude-session-topics.png)

## Install

```bash
# Inside Claude Code
/plugin marketplace add dreamiurg/claude-session-topics
/plugin install claude-session-topics@dreamiurg

# Restart Claude Code, then configure your status line
/claude-session-topics:setup-statusline
```

That's it. Topics appear automatically after a few messages.

To force a topic refresh anytime:

```bash
/claude-session-topics:regenerate-topic
```

## What You Get

Topics follow a `<theme>: <activity>` format with a circle progress indicator:

```text
◔ OAuth debug: fixing validation
◑ Blog post: adding snippets
◕ API refactor: updating endpoints
```

The circle shows progress toward the next topic refresh:

- ○ (empty) → ◔ → ◑ → ◕ → ● (full)

Topics generate using an adaptive schedule:

- Messages 1, 2, 3, 5, 8: Early updates while context develops
- Every 10 messages after that: Regular refreshes

Generation happens in the background (<50ms overhead) using Claude Haiku to summarize your session.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_TOPIC_THRESHOLD` | `10` | Messages between regeneration |
| `CLAUDE_TOPIC_CONTEXT_LINES` | `100` | Transcript lines to analyze |
| `CLAUDE_TOPIC_MAX_CHARS` | `50` | Max topic length |
| `CLAUDE_TOPIC_DEBUG` | `0` | Enable debug logging |

## Troubleshooting

**"waiting for conversation"** — Normal. Need a few messages for context.

**Topics not showing?** — Run `export CLAUDE_TOPIC_DEBUG=1` and check stderr.

## Requirements

- [Claude Code](https://claude.ai/code) CLI
- [Bun](https://bun.sh) 1.0+ or Node.js 18+

## How It Works

A [stop hook](hooks/hooks.json) fires after each Claude response, triggering
[topic-generator](scripts/topic-generator). Every N messages, it spawns a background process that:

1. Pulls context from [claude-mem][claude-mem] (if available) or parses the transcript
2. Sends it to Haiku with a summary prompt
3. Writes to `$TMPDIR/claude-topic-<session_id>.json`

[topic-display](scripts/topic-display) reads the state file and outputs the topic with progress indicator.
[session-cleanup](scripts/session-cleanup) removes temp files when the session ends.

For the full story: [Session Topic Summaries in Claude Code Status Line][blog-post]

## Development

### Prerequisites

- [Bun](https://bun.sh) 1.0+
- TypeScript 5.7+

### Build

```bash
bun install
bun run build
```

### Test

```bash
bun test
bun run test:watch  # Watch mode
```

### Type Check

```bash
bun run lint
```

---

*Built by [@dreamiurg](http://dreamiurg.net/about) because remembering context shouldn't require context.*

[blog-post]: http://dreamiurg.net/2026/01/08/claude-code-session-topics.html
[claude-mem]: https://github.com/thedotmack/claude-mem
