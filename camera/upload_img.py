#!/usr/bin/python

# first setup AWS libraries to connect using boto to connect to AWS
import boto3
from boto3.session import Session

# this will capture a photo on a camera attached to a raspberry pi

import picamera
import time
import datetime

# this handles reading in the twitter.config file with the secret keys
import ConfigParser

# read in the configuration file for AWS credentials
configParser = ConfigParser.RawConfigParser()
configFilePath = r'aws.config'
configParser.read(configFilePath)

# now parse out the different secret keys from the aws.config file
AWS_ACCESS_KEY_ID = configParser.get('My Secret Data', 'access_key_id')
AWS_SECRET_ACCESS_KEY = configParser.get('My Secret Data', 'secret_access_key')

# get the current date and time
curr_dt_tm = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

print curr_dt_tm

# create an instance of the camera

camera = picamera.PiCamera()

camera.vflip = True
camera.hflip = True

# set resolution of the camera - this should be about a 500kb file
camera.resolution = (1200, 600)
camera.start_preview()

# overlay timestamp on top of the photo and use a black background
camera.annotate_background = picamera.Color('black')
camera.annotate_text = 'Garden Camera \n' + curr_dt_tm

# sleep to give the camera time to warm-up and focus
time.sleep(5)

# capture the photo to a local file system
camera.capture('temp.jpg')

# connect to AWS using credentials unique to the account
session = Session(aws_access_key_id = AWS_ACCESS_KEY_ID,
                  aws_secret_access_key = AWS_SECRET_ACCESS_KEY,
                  region_name = 'us-west-2')

s3 = session.resource('s3')

# configure the correct S3 bucket and API parameters
image = 'temp.jpg'
bucket = 'robot-gardener'
target_name = 'current.jpg'

# this will read the temp image and update to the current garden view
data = open(image, 'rb')
s3.Bucket(bucket).put_object(Key=target_name, Body=data, ACL='public-read')

time.sleep(5)

# this will add the image to the archive setting the naming convention below
curr_hour = curr_dt_tm[:10] + '-' + curr_dt_tm[11:13] + '.jpg'

data = open(image, 'rb')
s3.Bucket(bucket).put_object(Key='archive/'+curr_hour, Body=data, ACL='public-read')
