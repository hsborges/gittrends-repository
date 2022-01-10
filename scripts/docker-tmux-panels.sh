#!/bin/sh
COLS_COUNT=$(tput cols)

tmux new-session -s 'gittrends-panels' -n 'docker-compose' \; \
  send-keys 'docker-compose -f docker-compose.yml -f docker-compose.service.yml up' C-m \; \
  new-window -n 'docker-logs' \; \
  send-keys 'docker-compose -f docker-compose.yml -f docker-compose.service.yml logs repos-updater users-updater scheduler -f --no-log-prefix' C-m \; \
  split-window -v \; \
  send-keys 'docker-compose -f docker-compose.yml -f docker-compose.service.yml logs proxy-server -f --no-log-prefix' C-m \; \
  split-window -h \; \
  send-keys 'htop' C-m \; \
  split-window -h \; \
  send-keys './node_modules/.bin/dotenv -c ${NODE_ENV-development} -- bash -c '"'"'mongostat -i --uri ${GT_MONGO_URL}'"'"'' C-m \; \
  resize-pane -t 1 -x $(($COLS_COUNT * 35 / 100)) \; \
  resize-pane -t 2 -x $(($COLS_COUNT * 35 / 100)) \; \
  resize-pane -t 3 -x $(($COLS_COUNT * 30 / 100)) \; \
  new-window -n 'docker-monitoring' \; \
  send-keys 'docker run --rm -ti --name=ctop --volume /var/run/docker.sock:/var/run/docker.sock:ro quay.io/vektorlab/ctop:latest' C-m \; \
  select-window -t 1 \;
