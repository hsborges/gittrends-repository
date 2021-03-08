#!/bin/bash

ACME_SH=${HOME}/.acme.sh/acme.sh
DATA_PATH=$(pwd)/data/acme
DOMAINS=(gittrends.app www.gittrends.app)
EMAIL=""

if [ -d "$DATA_PATH" ]; then
  read -p "Existing data found for $DOMAINS. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

echo "### Starting nginx ..."
pkill nginx
nginx
echo

echo "### Registering ZeroSSL account"
if [ $EMAIL != "" ]; then $ACME_SH --register-account  -m $EMAIL --server zerossl; fi


echo "### Requesting ZeroSSL certificate for $DOMAINS ..."
#Join $DOMAINS to -d args
domain_args=""
for domain in "${DOMAINS[@]}"; do
  domain_args="$domain_args -d $domain"
done

dest="data/acme/certs/gittrends.app"
mkdir -p $dest

$ACME_SH --server zerossl \
  --issue $domain_args \
  -w data/acme/www/gittrends.app \

$ACME_SH --install-cert $domain_args \
  --cert-file $dest/cert.pem \
  --key-file $dest/key.pem \
  --fullchain-file $dest/fullchain.pem \
  --reloadcmd "nginx -s reload"
