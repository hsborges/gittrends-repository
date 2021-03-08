# Enabling website HTTPS

To get HTTPS enable on the website we have to perform the following steps:

**Step 1:** Install Acme.sh

    curl https://get.acme.sh | sh

**Step 2:** Issue the Certificate

    mkdir -p data/acme/www/gittrends.app
    acme.sh --issue -d www.gittrends.app -d gittrends.app -w data/acme/www/gittrends.app

**Step 3:** Set Up HTTPS Serving

    mkdir -p data/acme/certs/gittrends.app
    mv *.pem data/acme/certs/gittrends.app

> Credits: https://www.snel.com/support/securing-your-nginx-site-with-lets-encrypt-acme-sh/
