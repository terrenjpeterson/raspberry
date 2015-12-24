#!/bin/bash
# run a successive number of temperature tests

for i in {1..1000}
do 
    sudo python simpletest.py
    sleep 5s
done
