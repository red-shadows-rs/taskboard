#!/usr/bin/env bash
# ─────────────────────────────────────────────
# Taskboard - Code Comment Policy Guard
# https://github.com/red-shadows-rs/taskboard
# ─────────────────────────────────────────────

set -u

root="$(cd "$(dirname "$0")/.." && pwd)"
status=0

skip_banner='
BEGIN { state = 0 }
state == 0 {
    if ($0 ~ /^[[:space:]]*$/) next
    if ($0 ~ /^[[:space:]]*<![Dd][Oo][Cc][Tt][Yy][Pp][Ee]/) next
    if ($0 ~ /^[[:space:]]*\/\//) next
    if ($0 ~ /^[[:space:]]*\/\*/ || $0 ~ /^[[:space:]]*\*/) {
        if ($0 ~ /\*\//) next
        state = 2
        next
    }
    if ($0 ~ /^[[:space:]]*<!--/) {
        if ($0 ~ /-->/) next
        state = 3
        next
    }
    state = 1
}
state == 2 { if ($0 ~ /\*\//) state = 0; next }
state == 3 { if ($0 ~ /-->/) state = 0; next }
state == 1 { print }
'

while IFS= read -r file; do
    hits=$(awk "$skip_banner" "$file" 2>/dev/null \
        | grep -Pn '(^\s*//)|([^:"/]\s+//)|(^\s*/\*)|([^:"/]\s+/\*)|(^\s*<!--)')
    if [ -n "$hits" ]; then
        echo "::error file=${file#"$root"/}::code comments are not allowed"
        status=1
    fi
done < <(find \
    "$root/src" \
    "$root/scripts" \
    -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.mjs' \
        -o -name '*.css' -o -name '*.html' \) \
    ! -path '*/node_modules/*' 2>/dev/null)

if [ "$status" -eq 0 ]; then
    echo "comment policy holds"
fi
exit "$status"
