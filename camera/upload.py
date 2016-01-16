#!/usr/bin/python

# this program will upload a photo from a raspberry pi to a API in the Cloud

import time
import datetime
import requests

curr_dt_tm = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

print curr_dt_tm

# variable for the location of the API
Apiurl = 'http://ec2-52-34-244-227.us-west-2.compute.amazonaws.com:8080/photo'

# upload the file
files = {'media': open('20160115.jpg', 'rb')}
requests.post(Apiurl, files=files)

# time.sleep(10)
