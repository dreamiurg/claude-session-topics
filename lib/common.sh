#!/bin/bash
# Common constants and functions for claude-session-topics scripts
# Source this file: source "$(dirname "$0")/../lib/common.sh"

# Ensure dependencies are available
command -v jq >/dev/null 2>&1 || {
    echo "Error: jq is required but not installed" >&2
    exit 1
}

# Use TMPDIR for portability (macOS sets this per-user)
CLAUDE_TMPDIR="${TMPDIR:-/tmp}"

# File paths (exported for use by sourcing scripts)
# shellcheck disable=SC2034  # Variables used by sourcing scripts
CLAUDE_TOPIC_PREFIX="${CLAUDE_TMPDIR}/claude-topic-"

# Get state file path for a session
claude_state_file() {
    local session_id="$1"
    printf '%s%s.json' "$CLAUDE_TOPIC_PREFIX" "$session_id"
}

# Get lock file path for a session
claude_lock_file() {
    local session_id="$1"
    printf '%s%s.lock' "$CLAUDE_TOPIC_PREFIX" "$session_id"
}

# Validate session_id format (UUID)
validate_session_id() {
    local session_id="$1"
    if [[ ! "$session_id" =~ ^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$ ]]; then
        # Also allow agent-style IDs like agent-a1b2c3d
        if [[ ! "$session_id" =~ ^agent-[a-f0-9]{7}$ ]]; then
            return 1
        fi
    fi
    return 0
}

# Validate transcript path is within allowed directory
validate_transcript_path() {
    local path="$1"
    local allowed_dir="$HOME/.claude"

    # Expand ~ if present
    path="${path/#\~/$HOME}"

    # Check path starts with allowed directory
    [[ "$path" == "$allowed_dir"/* ]] || return 1

    # If file exists, resolve to real path and check again (prevents symlink escapes)
    # Note: realpath -m isn't portable (not on macOS), so only check existing files
    if [[ -f "$path" ]]; then
        local real_path
        real_path=$(realpath "$path" 2>/dev/null) || return 1
        [[ "$real_path" == "$allowed_dir"/* ]] || return 1
        printf '%s' "$real_path"
    else
        # File doesn't exist yet, just return validated path
        printf '%s' "$path"
    fi
}

# Get file modification time (portable across macOS/Linux)
get_file_mtime() {
    local file="$1"
    if [[ ! -f "$file" ]]; then
        echo 0
        return
    fi
    if [[ "$(uname -s)" == "Darwin" ]]; then
        stat -f %m "$file" 2>/dev/null || echo 0
    else
        stat -c %Y "$file" 2>/dev/null || echo 0
    fi
}

# Atomic lock acquisition using mkdir (POSIX atomic)
acquire_lock() {
    local lock_path="$1"
    local max_age="${2:-60}" # Default 60 seconds stale timeout

    # Try to create lock directory atomically
    if mkdir "$lock_path" 2>/dev/null; then
        return 0 # Lock acquired
    fi

    # Lock exists - check if stale
    local lock_age=$(($(date +%s) - $(get_file_mtime "$lock_path")))
    if [[ $lock_age -ge $max_age ]]; then
        # Stale lock - remove and try again
        rmdir "$lock_path" 2>/dev/null
        mkdir "$lock_path" 2>/dev/null && return 0
    fi

    return 1 # Lock not acquired
}

# Release lock
release_lock() {
    local lock_path="$1"
    rmdir "$lock_path" 2>/dev/null || rm -rf "$lock_path" 2>/dev/null
}
