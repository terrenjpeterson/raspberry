#!/usr/bin/python
#
# this script leverages a framework from twitter to tweet from the command line
#

# this is needed from twitter and handles the API calls
from twitter import *

# this handles reading in the twitter.config file with the secret keys
import ConfigParser

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

# create what information is to be tweeted
new_status = "the lights are doing all of the work"

# post tweet
results = twitter.statuses.update(status = new_status)
