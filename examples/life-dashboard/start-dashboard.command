#!/bin/bash
# Double-click to start the life dashboard (macOS). Keep this window open while you use it.
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Install the LTS version from https://nodejs.org and then open this file again."
  read -r -p "Press Enter to close."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "First run: installing the dashboard. This takes a minute or two..."
  if ! npm install; then
    echo
    echo "The install failed. Copy the messages above and send them over."
    read -r -p "Press Enter to close."
    exit 1
  fi
fi

echo "Starting the dashboard. Your browser will open at http://localhost:5173"
echo "Close this window to stop it."
OPEN_BROWSER=1 npm run dev
echo
echo "The dashboard stopped. If that was unexpected, copy the messages above and send them over."
read -r -p "Press Enter to close."
