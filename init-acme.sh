#!/bin/bash

domains=(gittrends.app www.gittrends.app)
data_path="./data/acme"
email=""

if [ -d "$data_path" ]; then
  read -p "Existing data found for $domains. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

echo "### Starting nginx ..."
pkill nginx && nginx -c data/nginx/init-acme.conf
echo

echo "### Registering ZeroSSL account"
if [ $email != "" ]; then acme.sh --register-account  -m $email --server zerossl; fi


echo "### Requesting ZeroSSL certificate for $domains ..."
#Join $domains to -d args
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

mkdir -p data/acme/www/gittrends.app
acme.sh --server zerossl --issue $domain_args -w data/acme/www/gittrends.app --dns dns_cf

mkdir -p data/acme/certs/gittrends.app
mv *.pem data/acme/certs/gittrends.app

echo "### Reloading nginx ..."
nginx -s reload
