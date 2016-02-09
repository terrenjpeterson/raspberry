Garden IoT Project
------------------

This repo contains all of the source code needed to run a internet monitored garden using a raspberry pi.  More details can be found here:

https://www.hackster.io/terren/cloud-gardening-manage-indoor-food-gardens-using-iot-be95d1

The code is packaged into several folders.

api folder
----------
These are API's that are used to communicate between different components.

- getRecentTempData.js - Lambda function that aggregates granular sensor data, and renders an array of average readings.
- garden.js - nodejs server running on AWS to receive HTTP POST calls from the pi.  Currently this is run on an EC2 instance.
- getCurrentMoistureReadings - Lambda function that retrieves the most recent moisture sensor reading for a given sensor.
- getRecentMoistureHistory - Lambda function that aggregates moisture sensor data, and renders an array of average readings for the current date.
- sensorTemplate.json - mapping file for the getCurrentMoistureReadings.js function.

camera folder
-------------
These are installed on a Pi that can be used to capture images of the garden, and can then be saved to complement the sensor data, or to elaborate on findings on the website.

- camera_setup.py - script that runs the camera in preview mode for display onto a HDMI enabled monitor.
- camera_test.py - python script that captures an image from a pi for recordkeeping.
- upload_img.py - python script that uploads the current image from the camera using the AWS boto framework.
- aws.config - configuration file used to store user credentials to authenticate with AWS.
- tweet.py - python script that tweets out current sensor readings.
- twitter.config - configuration file used in the tweet.py script that needs to be set with twitter API settings.
- social.sh - bash script that routinely calls the tweet and upload image scripts.

website folder
-------------
HTML pages containing basic content for the website.  In addition, utility files that are used for search engine optimization.

- index.html - basic homepage that uses the twitter responsive design format.
- blog.html - page capturing updates on how the garden is progressing.
- design.html - page capturing key physical design aspects of the garden.
- source.html - page capturing software aspects of the garden and a link back to the github repo.
- robots.txt - page for search engine authorization.
- sitemap.xml - page for instructing search engines how to navigate HTML tree.

chart folder
------------
HTML pages that leverage the Google Chart framework that render UI for the sensor data based on API calls to retrieve garden data.

- garden.html - gauge chart that renders the most recent sensor data in an easy to read form.
- temp_history.html - line chart that renders an array of sensor data for the current date into a chart format.
- moisture.html - gauge chart that displays the soil moisture sensor reading.
- moist_history.html - line chart that renders an array of sensor data for the current date for all moisture sensors connected.

sensor folder
-------------

- simpletest.py - python process running locally on a pi leveraging the requests package to do HTTP requests
- stream.sh - batch proces that recursively runs the temperature and moisture sensor on the pi.
- readspi.py - python script that reads analog sensor readings using the SPI and an ADC chip. This is how the moisture sensors are read.
- readspi.sh - bash script that recursively invokes the SPI sensor script.

analytics folder
----------------

- temp_alert.py - lambda function written in python that checks the latest temperature reading and sends a SNS notification in case the limit is reached.

Dependencies
------------
Setting up the sensor to be read by the Raspberry Pi.

https://github.com/adafruit/Adafruit_Python_DHT

The heavy lifting of the charts is done by the Google Charts framework.  Here is where the website with all the critical
information on how each chart type works.

https://developers.google.com/chart/

Reading the SPI pins on the Raspberry Pi. These pins are fed by the Analog to Digital converter.

https://github.com/Gadgetoid/py-spidev
