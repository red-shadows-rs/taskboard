#!/usr/bin/env bash
# ─────────────────────────────────────────────
# Taskboard - Version Consistency Check
# https://github.com/red-shadows-rs/taskboard
# ─────────────────────────────────────────────

set -euo pipefail

cd "$(dirname "$0")/.."

expected="$(grep -m1 -oE '"version": "[^"]+"' package.json | sed 's/.*"\(.*\)"/\1/')"
if [ -z "$expected" ]; then
    echo "check-versions: cannot read the version from package.json" >&2
    exit 1
fi

failures=0

check_badge() {
    local file="$1" pattern="$2"
    if grep -q "$pattern" "$file" && ! grep -q "${pattern}${expected}-" "$file"; then
        printf 'check-versions: %-24s badge is not %s\n' "$file" "$expected" >&2
        failures=$((failures + 1))
    fi
}

check_badge "README.md" 'img.shields.io/badge/version-'
check_badge "README_AR.md" 'img.shields.io/badge/الإصدار-'

if ! grep -qE "^## \[v?${expected}\]" CHANGELOG.md; then
    printf 'check-versions: %-24s has no entry for %s\n' "CHANGELOG.md" "$expected" >&2
    failures=$((failures + 1))
fi

if ! grep -q "releases/tag/v${expected}" CHANGELOG.md; then
    printf 'check-versions: %-24s has no link for v%s\n' "CHANGELOG.md" "$expected" >&2
    failures=$((failures + 1))
fi

if [ "$failures" -ne 0 ]; then
    echo "check-versions: $failures mismatch(es) against $expected" >&2
    exit 1
fi

echo "check-versions: all version locations agree on $expected"
