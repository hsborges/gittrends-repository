Cols=$(tput cols)

tmux new-session \; \
  send-keys 'yarn workspace @gittrends/service pm2 logs --raw "/repos|users|scheduler/"' Enter  \; \
  split-window -v \; \
  send-keys 'yarn workspace @gittrends/service pm2 logs --raw proxy-server' Enter  \; \
  split-window -h \; \
  send-keys 'htop' Enter  \; \
  split-window -h \; \
  send-keys 'docker-compose exec mongo bash -c "mongostat -i --username \$MONGO_INITDB_ROOT_USERNAME --authenticationDatabase admin --authenticationMechanism SCRAM-SHA-1 --password \$MONGO_INITDB_ROOT_PASSWORD"' Enter  \; \
  resize-pane -t 1 -x $(($Cols * 35 / 100)) \; \
  resize-pane -t 2 -x $(($Cols * 35 / 100)) \; \
  resize-pane -t 3 -x $(($Cols * 30 / 100)) \; \
  new-window \; \
  send-keys 'yarn workspace @gittrends/service pm2 monit' Enter  \; \
  select-window -t 0 \;
