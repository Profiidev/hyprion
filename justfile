run:
  #!/usr/bin/env bash
  cleanup() {
    pkill ags || true
    pkill gjs || true
    echo "Cleaned up processes."
    exit 0;
  }

  trap cleanup EXIT SIGINT SIGTERM

  while true; do
    echo "Starting the bar...";
    ags run . &
    echo "Bar started, waiting for file changes...";
    inotifywait -q -r -e modify,move,create,delete .;
    echo "File change detected. Killing bar";
    pkill ags;
    pkill gjs;
  done