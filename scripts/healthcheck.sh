#!/bin/sh
curl -f http://localhost:3000/ && \
curl -f http://localhost:3000/data/latest.json && \
echo "Healthcheck passed"
