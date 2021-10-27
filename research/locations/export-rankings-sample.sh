#!/bin/bash
yarn build;
parallel -j 5 yarn export-rankings '{1}' --output '.rankings/{1}.csv' --makedir </dev/null  ::: $(cat export-rankings-sample.txt)
