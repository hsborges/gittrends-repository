#!/bin/bash
while read LINE; do
    echo "=> $LINE";
    yarn export-rankings "$LINE" --output ".rankings/$LINE.csv" --makedir </dev/null;
done < "export-rankings-sample.txt"
