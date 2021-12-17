#!/bin/sh
COLS_COUNT=$(tput cols)

tmux new-session -s 'gittrends-monitor' \; \
  send-keys 'yarn workspace @gittrends/service pm2 logs --raw "/repos|users|scheduler/"' Enter  \; \
  split-window -v \; \
  send-keys 'yarn workspace @gittrends/service pm2 logs --raw proxy-server' Enter  \; \
  split-window -h \; \
  send-keys 'htop' Enter  \; \
  split-window -h \; \
  send-keys './node_modules/.bin/dotenv -- bash -c '"'"'mongostat -i --authenticationDatabase admin --authenticationMechanism SCRAM-SHA-1 --host ${GT_DATABASE_HOST:-localhost}:${GT_DATABASE_PORT:-27017} $([[ -z "$GT_DATABASE_USERNAME" ]] && echo "" || echo " --username ${GT_DATABASE_USERNAME} --password $GT_DATABASE_PASSWORD")'"'"'' Enter  \; \
  resize-pane -t 1 -x $(($COLS_COUNT * 35 / 100)) \; \
  resize-pane -t 2 -x $(($COLS_COUNT * 35 / 100)) \; \
  resize-pane -t 3 -x $(($COLS_COUNT * 30 / 100)) \; \
  new-window \; \
  send-keys 'yarn workspace @gittrends/service pm2 monit' Enter  \; \
  select-window -t 0 \;
