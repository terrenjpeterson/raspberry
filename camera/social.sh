#!/bin/bash
# run script that will tweet and upload photos

for i in {1..1000}
do
    sudo python tweet.py
    sleep 10s
    sudo python upload_img.py
    sleep 1h
done
