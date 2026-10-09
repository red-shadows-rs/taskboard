#!/usr/bin/env bash
# ─────────────────────────────────────────────
# TaskBoard - Version Synchronization
# https://github.com/red-shadows-rs/taskboard
# ─────────────────────────────────────────────

set -euo pipefail
cd "${REPO_ROOT:-$PWD}"

version="$1"
summary="$2"

previous="$(grep -m1 -oE '"version": "[^"]+"' package.json | sed 's/.*"\(.*\)"/\1/')"

if [ "$previous" = "$version" ]; then
    echo "set-version: already at $version"
    exit 0
fi

sed -i -E "s/\"version\": \"${previous}\"/\"version\": \"${version}\"/" package.json

sed -i -E "s/version-${previous}-/version-${version}-/g" README.md
sed -i -E "s/الإصدار-${previous}-/الإصدار-${version}-/g" README_AR.md

npm install --package-lock-only --ignore-scripts >/dev/null 2>&1 || true

stamp="$(date +%F)"
python3 - "$version" "$summary" "$stamp" <<'PY'
import re
import sys

version, summary, stamp = sys.argv[1:4]
text = open("CHANGELOG.md", encoding="utf-8").read()

entry = (
    f"## [v{version}] - {stamp}\n\n"
    f"### Changed\n\n"
    f"- {summary}\n"
    f"- Version bumped to {version} across package.json, documentation badges, "
    f"and the changelog.\n\n"
)

match = re.search(r"^## \[", text, re.M)
if match:
    text = text[: match.start()] + entry + text[match.start():]
else:
    text = text.rstrip("\n") + "\n\n" + entry

link = (
    f"[v{version}]: "
    f"https://github.com/red-shadows-rs/taskboard/releases/tag/v{version}\n"
)
link_match = re.search(r"^\[v?[0-9]", text, re.M)
if link_match:
    text = text[: link_match.start()] + link + text[link_match.start():]
else:
    text = text.rstrip("\n") + "\n\n" + link

open("CHANGELOG.md", "w", encoding="utf-8").write(text)
PY

echo "set-version: ${previous} -> ${version}"
