#!/bin/bash
# this script is used for driving the daily processing of the pi
# within the loop the function will check the current time
# and if the time is within the parameters, will upload a photo

for i in {1..1000}
do
    time=`date +%k%M` ;
    echo $time
    if [ "$time" -le 700 ]
      then 
      echo 'early'
    elif [ "$time" -ge 1800 ]
      then
      echo 'late'
    else
      sudo python upload_img.py
    fi
    sleep 1h
    # sudo python tweet.py
done
