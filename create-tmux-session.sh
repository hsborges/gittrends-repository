tmux new-session \; \
  send-keys 'docker-compose logs -f --tail 25 updater users-updater scheduler' C-m  \; \
  split-window -h \; \
  select-pane -t 0 \; \
  split-window -v \; \
  resize-pane -y 15 \; \
  send-keys 'docker-compose logs -f --tail 25 proxy-server' C-m  \; \
  select-pane -t 2 \; \
  send-keys 'htop' C-m  \; \
  split-window -v \; \
  send-keys 'docker-compose exec mongo bash -c "mongostat -i --username \$MONGO_INITDB_ROOT_USERNAME --authenticationDatabase admin --authenticationMechanism SCRAM-SHA-1 --password \$MONGO_INITDB_ROOT_PASSWORD"' C-m  \; \
  split-window \; \
  send-keys 'docker-compose exec mongo bash -c "mongotop --username \$MONGO_INITDB_ROOT_USERNAME --authenticationDatabase admin --authenticationMechanism SCRAM-SHA-1 --password \$MONGO_INITDB_ROOT_PASSWORD"' C-m  \; \
  resize-pane -t 0 -x 115 \;
