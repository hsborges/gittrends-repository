#!/bin/sh
COLS_COUNT=$(tput cols)

tmux new-session -s 'gittrends-panels' -n 'pm2-runtime' \; \
  send-keys 'yarn workspace @gittrends/service pm2-runtime service.config.js' C-m \; \
  new-window -n 'pm2-logs' \; \
  send-keys 'bash -c "sleep 15 && yarn workspace @gittrends/service pm2 logs --raw \"/repos|users|scheduler/\""' C-m \; \
  split-window -v \; \
  split-window -v \; \
  select-pane -U \; \
  send-keys 'bash -c "sleep 15 && yarn workspace @gittrends/service pm2 logs --raw proxy-server"' C-m \; \
  split-window -h \; \
  send-keys 'htop' C-m \; \
  select-pane -D \; \
  send-keys './node_modules/.bin/dotenv -c ${NODE_ENV-development} -- bash -c '"'"'mongostat -i --uri ${GT_MONGO_URL}'"'"'' C-m \; \
  resize-pane -y 3 \; \
  new-window -n 'pm2-monit' \; \
  send-keys 'bash -c "sleep 15 && yarn workspace @gittrends/service pm2 monit"' C-m \; \
  select-window -t 1 \;
