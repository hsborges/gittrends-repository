#!/bin/sh
COLS_COUNT=$(tput cols)

tmux new-session -s 'gittrends-panels' -n 'pm2-runtime' \; \
  send-keys 'yarn workspace @gittrends/service pm2-runtime service.config.js' \; \
  new-window -n 'pm2-logs' \; \
  send-keys 'yarn workspace @gittrends/service pm2 logs --raw "/repos|users|scheduler/"' Enter  \; \
  split-window -v \; \
  send-keys 'yarn workspace @gittrends/service pm2 logs --raw proxy-server' Enter  \; \
  split-window -h \; \
  send-keys 'htop' Enter  \; \
  split-window -h \; \
  send-keys './node_modules/.bin/dotenv -- bash -c '"'"'mongostat -i --uri ${GT_MONGO_URL}'"'"'' Enter  \; \
  resize-pane -t 1 -x $(($COLS_COUNT * 35 / 100)) \; \
  resize-pane -t 2 -x $(($COLS_COUNT * 35 / 100)) \; \
  resize-pane -t 3 -x $(($COLS_COUNT * 30 / 100)) \; \
  new-window -n 'pm2-monit' \; \
  send-keys 'yarn workspace @gittrends/service pm2 monit' Enter  \; \
  select-window -t 1 \;
