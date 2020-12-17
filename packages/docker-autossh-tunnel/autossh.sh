#!/bin/bash

echo '### Verifing enviroment variables ...'
if ! [[ "${TUNNEL_HOST}" &&  "${LOCAL_PORT}" &&  "${REMOTE_HOST}" &&  "${REMOTE_PORT}" ]]; then
  echo 'Required variables: TUNNEL_HOST, LOCAL_PORT, REMOTE_HOST and REMOTE_PORT .' >&2
  exit 1
fi

verbose=''
if [[ "${VERBOSE}"  ]]; then
  verbose="-$VERBOSE"
fi

echo '### Coping files to local .ssh directory and changing permissions ...'
cp /root/ssh/* /root/.ssh/
chmod -R 600 /root/.ssh/*

echo '### Creating ssh tunnel with autossh ...'
autossh -4 "$verbose" -T -N $TUNNEL_HOST -L *:$LOCAL_PORT:$REMOTE_HOST:$REMOTE_PORT
