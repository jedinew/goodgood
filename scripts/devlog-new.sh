#!/bin/sh
# Usage: ./scripts/devlog-new.sh "commit message"
# Creates a devlog file with timestamp and git info

if [ -z "$1" ]; then
  echo "Usage: $0 \"commit message\""
  exit 1
fi

MSG="$1"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
SHORTSHA=$(git rev-parse --short HEAD 2>/dev/null || echo "init")
FILENAME="docs/devlog/${TIMESTAMP}__${SHORTSHA}.md"

echo "# Devlog - $TIMESTAMP" > "$FILENAME"
echo "" >> "$FILENAME"
echo "Commit: $SHORTSHA" >> "$FILENAME"
echo "Message: $MSG" >> "$FILENAME"
echo "" >> "$FILENAME"
echo "## Changes" >> "$FILENAME"
echo "" >> "$FILENAME"
echo "## Tests" >> "$FILENAME"
echo "" >> "$FILENAME"
echo "## Issues" >> "$FILENAME"
echo "" >> "$FILENAME"

echo "Created $FILENAME"
