run:
  @while true; do \
    echo "Starting the bar..."; \
    ags run . & \
    echo "Bar started, waiting for file changes..."; \
    inotifywait -q -r -e modify,move,create,delete .; \
    echo "File change detected. Killing bar"; \
    pkill ags; \
    pkill gjs; \
  done