#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi

npm run dev >/tmp/folio-dev.log 2>&1 &

for _ in $(seq 1 60); do
  if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
    exit 0
  fi
  sleep 0.5
done

echo "Folio failed to start on :8080" >&2
tail -n 40 /tmp/folio-dev.log >&2 || true
exit 1
