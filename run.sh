#!/bin/bash
echo "Starting Tower Defense at http://localhost:8080"

# Kill anything already holding port 8080
fuser -k 8080/tcp 2>/dev/null && sleep 0.3

cd "/home/samsung1466/Python/tower_defense/"
python3 app.py &
SERVER_PID=$!

# Give the server a moment to bind before opening the browser
sleep 0.5
xdg-open "http://localhost:8080" 2>/dev/null \
  || sensible-browser "http://localhost:8080" 2>/dev/null \
  || google-chrome "http://localhost:8080" 2>/dev/null \
  || firefox "http://localhost:8080" 2>/dev/null \
  || echo "Could not detect a browser — open http://localhost:8080 manually"

echo "Server running. Press Enter to stop."
read
kill $SERVER_PID
echo "Server stopped."
