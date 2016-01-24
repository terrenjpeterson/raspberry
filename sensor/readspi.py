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

# Define delay between readings
delay = 5

# Define maximum and minimum levels of sensor (this is when it is absolute dry and wet)
max_reading = 1023 # this is the reading taken in air or completely dry dirt
min_reading = 377 # this is the reading taken in a glass of water
reading_range = max_reading - min_reading

while True:

  # Read the sensor, then calculate the relative reading (zero being dry)
  moisture_level = ReadChannel(moisture_channel)
  moisture_relative = (100*(max_reading - moisture_level)/reading_range)

  # Print out results
  print "--------------------------"
  print("Moisture: {} percent ({})".format(moisture_relative,moisture_level))

  # Wait before repeating loop
  time.sleep(delay)
