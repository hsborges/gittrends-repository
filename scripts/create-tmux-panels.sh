#!/bin/sh
COLS_COUNT=$(tput cols)

tmux new-session -s 'gittrends-panels' -n 'pm2-runtime' \; \
  send-keys 'yarn workspace @gittrends/service pm2-runtime service.config.js' C-m \; \
  new-window -n 'pm2-logs' \; \
  send-keys 'bash -c "sleep 2 && yarn workspace @gittrends/service pm2 logs --raw \"/repos|users|scheduler/\""' C-m \; \
  split-window -v \; \
  send-keys 'bash -c "sleep 4 && yarn workspace @gittrends/service pm2 logs --raw proxy-server"' C-m \; \
  split-window -h \; \
  send-keys 'htop' C-m \; \
  split-window -h \; \
  send-keys './node_modules/.bin/dotenv -c ${NODE_ENV-development} -- bash -c '"'"'mongostat -i --uri ${GT_MONGO_URL}'"'"'' C-m \; \
  resize-pane -t 1 -x $(($COLS_COUNT * 35 / 100)) \; \
  resize-pane -t 2 -x $(($COLS_COUNT * 35 / 100)) \; \
  resize-pane -t 3 -x $(($COLS_COUNT * 30 / 100)) \; \
  new-window -n 'pm2-monit' \; \
  send-keys 'bash -c "sleep 6 && yarn workspace @gittrends/service pm2 monit"' C-m \; \
  select-window -t 1 \;
