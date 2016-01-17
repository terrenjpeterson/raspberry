#!/usr/bin/python
#
# this script leverages a framework from twitter to tweet from the command line
#

# this is needed from twitter and handles the API calls
from twitter import *

# this handles reading in the twitter.config file with the secret keys
import ConfigParser

# this handles the API calls back to AWS
import requests

import json

# read in the configuration file
configParser = ConfigParser.RawConfigParser()
configFilePath = r'twitter.config'
configParser.read(configFilePath)

# now parse out the different secret keys
access_token = configParser.get('My Secret Data', 'access_token')
access_token_secret = configParser.get('My Secret Data', 'access_token_secret')
API_key = configParser.get('My Secret Data', 'API_key')
API_secret = configParser.get('My Secret Data', 'API_secret')

# create OAuth token using the secret keys  
twitter = Twitter(auth = OAuth(access_token, access_token_secret, API_key, API_secret))

# get the current garden conditions
garden = requests.get("https://xzmez6qe1a.execute-api.us-west-2.amazonaws.com/prod")

if garden.status_code == 200:
  garden_data = json.loads(garden.content)

  # parse through the JSON data returned from the http request for current data
  humidity = garden_data['humidity']
  temperature = garden_data['temperature']
  read_date = garden_data['read_date']
  read_time = garden_data['read_time']

  # this is the new string that will be posted to twitter
  new_status = "Currently in the garden, the temperature is %s F and relative humidity is %s at %s." % (temperature, humidity, read_time[:5])
  # new_status = "the lights are doing all of the work"

  # post tweet
  new_update = twitter.statuses.update(status = new_status)
