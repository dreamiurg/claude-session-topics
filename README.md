# Claude Session Topics

> *"What was I working on in that other terminal?"*

AI-generated topic summaries for your Claude Code sessions. See what each session is about at a glance.

![Claude Code session topics in tmux status line](http://dreamiurg.net/images/claude-session-topics.png)

## Install

```bash
# Inside Claude Code
/plugin marketplace add dreamiurg/claude-session-topics
/plugin install claude-session-topics@dreamiurg

# Then configure your status line
/claude-session-topics:setup-statusline
```

That's it. Topics appear automatically after a few messages.

## What You Get

Topics follow a `<theme>: <activity>` format:

```text
OAuth debug: fixing schema validation
Blog post: adding code snippets
API refactor: updating endpoints
```

The plugin uses Claude Haiku to summarize your session every 10 messages.
Generation happens in the background (<50ms overhead).
Topics include an age indicator so you know how fresh they are.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_TOPIC_THRESHOLD` | `10` | Messages between regeneration |
| `CLAUDE_TOPIC_MAX_CHARS` | `50` | Max topic length |
| `CLAUDE_TOPIC_DEBUG` | `0` | Enable debug logging |

## Troubleshooting

**"waiting for conversation"** — Normal. Need a few messages for context.

**Topics not showing?** — Run `export CLAUDE_TOPIC_DEBUG=1` and check stderr.

## Requirements

- [Claude Code](https://claude.ai/code) CLI
- `jq`
- Bash 4.0+

## How It Works

A [stop hook](hooks/hooks.json) fires after each Claude response, triggering
[topic-generator](scripts/topic-generator). Every N messages, it spawns a background process that:

1. Pulls context from [claude-mem][claude-mem] (if available) or parses the transcript
2. Sends it to Haiku with a summary prompt
3. Writes to `$TMPDIR/claude-topic-<session_id>.json`

[topic-display](scripts/topic-display) reads the state file and outputs the topic with age.
[session-cleanup](scripts/session-cleanup) removes temp files when the session ends.

For the full story: [Session Topic Summaries in Claude Code Status Line][blog-post]

## License

[MIT](LICENSE)

---

*Built by [@dreamiurg](https://github.com/dreamiurg) because remembering context shouldn't require context.*

[blog-post]: http://dreamiurg.net/2026/01/08/claude-code-session-topics.html
[claude-mem]: https://github.com/thedotmack/claude-mem
