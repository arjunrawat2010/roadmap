#!/usr/bin/env bash
# Build the app and serve it with a local nginx (macOS / Linux).
#
#   ./deploy/deploy.sh            build + start (or reload) on port 8080
#   PORT=9000 ./deploy/deploy.sh  use another port
#   ./deploy/deploy.sh stop       stop the server
#
# Needs Node.js and nginx on PATH (macOS: brew install nginx,
# Ubuntu/Debian: sudo apt install nginx). Runs as your user, no sudo.
set -euo pipefail

PORT="${PORT:-8080}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
PREFIX="$REPO/.nginx"
CONF="$PREFIX/conf/nginx.conf"

command -v nginx >/dev/null || { echo "nginx not found. Install it first (brew install nginx / sudo apt install nginx)." >&2; exit 1; }

running() { [ -f "$PREFIX/logs/nginx.pid" ] && kill -0 "$(cat "$PREFIX/logs/nginx.pid")" 2>/dev/null; }

if [ "${1:-}" = "stop" ]; then
  if running; then nginx -p "$PREFIX/" -c "$CONF" -s quit; echo "Stopped."; else echo "Not running."; fi
  exit 0
fi

echo "==> Building"
cd "$REPO"
[ -d node_modules ] || npm ci
npm run build

echo "==> Writing nginx config"
mkdir -p "$PREFIX/conf" "$PREFIX/logs" "$PREFIX/temp"
cp "$REPO/deploy/mime.types" "$PREFIX/conf/mime.types"
sed -e "s|__PORT__|$PORT|g" -e "s|__ROOT__|$REPO/dist|g" "$REPO/deploy/nginx.conf.template" > "$CONF"
nginx -p "$PREFIX/" -c "$CONF" -t -q -g "error_log '$PREFIX/logs/error.log';"

if running; then
  echo "==> Reloading nginx"
  nginx -p "$PREFIX/" -c "$CONF" -s reload
else
  echo "==> Starting nginx"
  nginx -p "$PREFIX/" -c "$CONF" -g "error_log '$PREFIX/logs/error.log';"
fi

echo "Roadmap is live at http://localhost:$PORT/"
