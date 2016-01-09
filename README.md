Raspberry Pi Testing
--------------------

- simpletest.py - python process running locally on a pi leveraging the requests package to do HTTP requests
- garden.js - nodejs server running on AWS to receive HTTP POST calls from the pi
- stream.sh - batch proces that recursively runs the sensor on the pi
- getRecentTempData.js - Lambda function that aggregates granular sensor data, and renders an array of average readings.
- cameratest.py - python script that captures an image from a pi.

Charts Folder
-------------
HTML pages containing basic content for the website.

- index.html - basic homepage that uses the twitter responsive design format.
- garden.html - gauge chart that renders the most recent sensor data in an easy to read form.
- temp_history - line chart that renders an array of sensor data for the current date into a chart format.
- blog.html - page capturing updates on how the garden is progressing.

Dependencies
------------
Setting up the sensor to be read by the Raspberry Pi.

https://github.com/adafruit/Adafruit_Python_DHT

The heavy lifting of the charts is done by the Google Charts framework.  Here is where the website with all the critical
information on how each chart type works.

https://developers.google.com/chart/
