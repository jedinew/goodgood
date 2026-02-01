#!/bin/sh
# Get the latest date
LATEST=$(curl -sf http://localhost:3000/data/latest.json | node -e "try { console.log(JSON.parse(require('fs').readFileSync(0, 'utf8')).date) } catch (e) {}")

if [ -z "$LATEST" ]; then
  echo "Failed to get latest date from http://localhost:3000/data/latest.json"
  exit 1
fi

echo "Latest date is $LATEST"

curl -f http://localhost:3000/ > /dev/null && \
curl -f http://localhost:3000/data/latest.json > /dev/null && \
curl -f http://localhost:3000/data/daily/${LATEST}.json > /dev/null && \
echo "Healthcheck passed"
