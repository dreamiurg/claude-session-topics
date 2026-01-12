# Architecture

## Overview

claude-session-topics is a TypeScript/Node.js application that generates contextual topic summaries for Claude Code sessions.

## Components

### Core Modules

- **state.ts** - State file management (JSON persistence in TMPDIR)
- **validation.ts** - Session ID validation
- **lock.ts** - Atomic lock management for concurrent safety
- **schedule.ts** - Fibonacci-based regeneration schedule
- **claude-mem.ts** - Integration with claude-mem SQLite database
- **transcript.ts** - Transcript file parsing with wait logic
- **topic-generator.ts** - Topic generation via Claude API
- **hook-handler.ts** - Main Stop hook handler
- **display.ts** - Status line formatting

### CLIs

- **cli.ts** - Hook handler entry point (reads JSON from stdin)
- **cli-display.ts** - Status line display (ccstatusline integration)
- **cli-force-topic.ts** - Manual topic regeneration command

## Data Flow

1. Claude Code invokes Stop hook → passes JSON via stdin
2. cli.ts reads JSON, calls handleStopHook()
3. handleStopHook():
   - Validates session ID
   - Reads/initializes state
   - Increments message count
   - Checks Fibonacci schedule
   - Acquires lock (atomic via mkdir)
   - Queries claude-mem OR parses transcript
   - Spawns background topic generation
   - Updates state file
4. ccstatusline calls cli-display.ts → reads state → formats display

## Testing

- Unit tests for each module
- Integration tests for full lifecycle
- All tests use temp directories for isolation
- Run: `npm test`

## Build

- TypeScript compiled to dist/
- Entry points: dist/cli.js, dist/cli-display.js, dist/cli-force-topic.js
- Run: `npm run build`
