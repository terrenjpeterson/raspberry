#!/usr/bin/python
#
# this script reads the SPI (Serial Peripheral Interface)
# to get analog readings from sensors
# currently it is set to read a mosture sensor

# these are required for the interface to work
import spidev
import time
#import os

# this is needed for the API to work
import json
import requests
import datetime

# Open SPI bus
spi = spidev.SpiDev()
spi.open(0,0)

# Function to read SPI data from MCP3008 chip
# Channel must be an integer 0-7
def ReadChannel(channel):
  adc = spi.xfer2([1,(8+channel)<<4,0])
  data = ((adc[1]&3) << 8) + adc[2]
  return data

# Define sensor channels - this is driven by the pin on the ADC
moisture_channel = 0
plant_id = 'L-2-4'

# Define maximum and minimum levels of sensor (this is when it is absolute dry and wet)
max_reading = 1023 # this is the reading taken in air or completely dry dirt
min_reading = 377 # this is the reading taken in a glass of water
reading_range = max_reading - min_reading

# location of the API
Apiurl = 'http://ec2-52-34-244-227.us-west-2.compute.amazonaws.com:8080'

# Read the sensor, then calculate the relative reading (zero being dry)
moisture_level = ReadChannel(moisture_channel)
moisture_relative = (100*(max_reading - moisture_level)/reading_range)

# create the payload object for the API call
data = {}

# get the current timestame and convert to string format
# then add to recorded object
current_datetime = str(datetime.datetime.now())

data['read_date'] = current_datetime[:10]
data['read_time'] = current_datetime[11:][:8]
data['sensor'] = 'YL-69'
data['relative_moisture'] = moisture_relative
data['absolute_moisture'] = moisture_level
data['plant_id'] = plant_id

# Print out results
print "--------------------------"
print("Plant Id: {} Moisture: {} percent (absolute {})".format(plant_id, moisture_relative, moisture_level))

# convert to json format
json_data = json.dumps(data)

# call the API to store the sensor data
x = requests.post(Apiurl+'/saveMoistureReading', data = json_data)
#print 'Result of http request: ' + str(x.status_code)
