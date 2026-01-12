#!/bin/bash
# Validate all scripts for syntax errors and common issues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXIT_CODE=0

echo "Validating bash scripts..."

for script in "$SCRIPT_DIR"/*; do
    [[ -f "$script" ]] || continue
    [[ "$script" == *.sh ]] || [[ -x "$script" ]] || continue
    [[ "$(basename "$script")" == "validate.sh" ]] && continue

    echo -n "  $(basename "$script")... "

    # Check syntax
    if ! bash -n "$script" 2>&1; then
        echo "FAILED (syntax error)"
        EXIT_CODE=1
        continue
    fi

    # Check for 'local' outside functions (basic check - not perfect)
    # This is a simple heuristic: local statements should be inside function definitions
    # Skip this check for now as it needs proper bash parsing
    # if awk '
    #     /^[a-zA-Z_][a-zA-Z0-9_]*\(\)/ { in_function=1 }
    #     /^}/ && in_function { in_function=0 }
    #     /^[[:space:]]*local / && !in_function { print NR": "$0; found=1 }
    #     END { exit found }
    # ' "$script"; then
    #     echo "FAILED (local outside function)"
    #     EXIT_CODE=1
    #     continue
    # fi

    echo "OK"
done

if [[ $EXIT_CODE -eq 0 ]]; then
    echo "✓ All scripts valid"
else
    echo "✗ Validation failed"
fi

exit $EXIT_CODE
