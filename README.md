Raspberry Pi Testing
--------------------

- simpletest.py - python process running locally on a pi leveraging the requests package to do HTTP requests
- garden.js - nodejs server running on AWS to receive HTTP POST calls from the pi
- stream.sh - batch proces that recursively runs the sensor on the pi
- getRecentTempData.js - Lambda function that aggregates data for the daily chart
- cameratest.py - python script that captures an image from a pi

Charts Folder
-------------
HTML pages containing basic content for the website
