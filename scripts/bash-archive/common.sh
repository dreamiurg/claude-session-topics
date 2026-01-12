#!/bin/bash
# Common constants and functions for claude-session-topics scripts
# Source this file: source "$(dirname "$0")/../lib/common.sh"
#
# Environment variables:
#   CLAUDE_TOPIC_DEBUG - Set to "1" to enable debug logging to stderr

# Ensure dependencies are available
command -v jq >/dev/null 2>&1 || {
    echo "Error: jq is required but not installed" >&2
    exit 1
}

# Debug logging - outputs to stderr when CLAUDE_TOPIC_DEBUG=1
# Usage: debug_log "message"
debug_log() {
    [[ "${CLAUDE_TOPIC_DEBUG:-}" == "1" ]] && echo "[DEBUG $(date +%H:%M:%S)] $*" >&2
}

# Check if claude CLI is available (for topic generation)
# Usage: require_claude_cli || exit 0
require_claude_cli() {
    command -v claude >/dev/null 2>&1 || {
        debug_log "claude CLI not found"
        return 1
    }
}

# Use TMPDIR for portability (macOS sets this per-user)
CLAUDE_TMPDIR="${TMPDIR:-/tmp}"

# File paths (exported for use by sourcing scripts)
# shellcheck disable=SC2034  # Variables used by sourcing scripts
CLAUDE_TOPIC_PREFIX="${CLAUDE_TMPDIR}/claude-topic-"

# Get state file path for a session
# Args: session_id - validated session identifier
# Returns: path to state JSON file
claude_state_file() {
    local session_id="$1"
    printf '%s%s.json' "$CLAUDE_TOPIC_PREFIX" "$session_id"
}

# Get lock file path for a session
# Args: session_id - validated session identifier
# Returns: path to lock directory
claude_lock_file() {
    local session_id="$1"
    printf '%s%s.lock' "$CLAUDE_TOPIC_PREFIX" "$session_id"
}

# Validate session_id format
# Accepts:
#   - Standard UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
#   - Agent ID: agent-xxxxxxx (7 hex chars after prefix)
# Args: session_id - string to validate
# Returns: 0 if valid, 1 if invalid
validate_session_id() {
    local session_id="$1"
    # Standard UUID format
    if [[ "$session_id" =~ ^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$ ]]; then
        return 0
    fi
    # Agent-style IDs (used for sub-agents spawned by Claude)
    if [[ "$session_id" =~ ^agent-[a-f0-9]{7}$ ]]; then
        return 0
    fi
    return 1
}

# Validate transcript path is within allowed directory
# Security: Prevents path traversal and symlink escapes
# Args: path - transcript file path to validate
# Returns: validated path on stdout, exit 1 if invalid
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
# Args: file - path to check
# Returns: Unix timestamp on stdout, 0 if file doesn't exist
get_file_mtime() {
    local file="$1"
    if [[ ! -f "$file" && ! -d "$file" ]]; then
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
# Uses mkdir for atomicity - only one process can create a directory
# Implements stale lock detection based on age
# Args:
#   lock_path - path for lock directory
#   max_age - seconds before lock considered stale (default: 60)
# Returns: 0 if lock acquired, 1 if not
acquire_lock() {
    local lock_path="$1"
    local max_age="${2:-60}"

    debug_log "Attempting to acquire lock: $lock_path"

    # Try to create lock directory atomically
    if mkdir "$lock_path" 2>/dev/null; then
        debug_log "Lock acquired"
        return 0
    fi

    # Lock exists - check if stale
    local lock_age=$(($(date +%s) - $(get_file_mtime "$lock_path")))
    debug_log "Lock exists, age: ${lock_age}s (max: ${max_age}s)"

    if [[ $lock_age -ge $max_age ]]; then
        debug_log "Lock is stale, attempting to break"
        rmdir "$lock_path" 2>/dev/null
        if mkdir "$lock_path" 2>/dev/null; then
            debug_log "Stale lock broken, new lock acquired"
            return 0
        fi
    fi

    debug_log "Failed to acquire lock"
    return 1
}

# Release lock
# Args: lock_path - path to lock directory
release_lock() {
    local lock_path="$1"
    debug_log "Releasing lock: $lock_path"
    rmdir "$lock_path" 2>/dev/null || rm -rf "$lock_path" 2>/dev/null
}
