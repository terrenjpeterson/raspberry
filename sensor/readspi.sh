#!/bin/bash
# run a successive number of soil moisture tests

for i in {1..100000}
do 
    sudo python readspi.py
    sleep 10s
done
