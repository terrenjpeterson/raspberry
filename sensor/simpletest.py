#!/usr/bin/python

# Copyright (c) 2014 Adafruit Industries
# Author: Tony DiCola

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
import Adafruit_DHT

# added two libraries - one for formatting json objects, the other to create http requests
import json
import requests
import datetime

# parameters set based on model of sensor and pin location connected to pi
sensor = Adafruit_DHT.DHT22
pin = 4

# try and open a file for apending
f = open('datafile.dat', 'a')

# create an object that will be used to persist the data and set the sensor attribute name
data = {}
data['sensor'] = 'AM2302'
data['location'] = 'IndoorGarden'

# establish the endpoint that the API will be located at 
Apiurl = 'http://ec2-52-34-244-227.us-west-2.compute.amazonaws.com:8080/post'
#Apiurl = 'https://2zsxv0zmz9.execute-api.us-west-2.amazonaws.com/prod'

# get the current timestame and convert to string format
# then add to recorded object
current_datetime = str(datetime.datetime.now())

data['read_date'] = current_datetime[:10]
data['read_time'] = current_datetime[11:][:8]

# Try to grab a sensor reading.  Use the read_retry method which will retry up
# to 15 times to get a sensor reading (waiting 2 seconds between each retry).
humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)

# add sensor readings as attributes to the object
# also convert floats to strings to make more compact as precision isn't true
if humidity is not None:
    data['humidity'] = str(humidity)[:4]

if temperature is not None:
    temperature = temperature * 9/5.0 + 32
    data['temperature'] = str(temperature)[:4]

# Note that sometimes you won't get a reading and
# the results will be null (because Linux can't
# guarantee the timing of calls to read the sensor).  
# If this happens try again!
if humidity is not None and temperature is not None:
        json_data = json.dumps(data)
        print 'Temp={0:0.1f}*F  Humidity={1:0.1f}%'.format(temperature, humidity)
        f.write(str(json_data)+'\n')
        x = requests.post(Apiurl, data=json_data, verify=False)
        print 'Result of http request: ' + str(x.status_code)
else:
        print 'Failed to get reading. Try again!'
