#!/usr/bin/python

# this program will capture a photo on a camera attached to a raspberry pi

import picamera
import time
import datetime

# capture the current date and time in string format
curr_dt_tm = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

print curr_dt_tm

# create an instance of the camera

camera = picamera.PiCamera()

camera.vflip = True
camera.hflip = True

# set resolution of the camera
camera.resolution = (2400, 1200)
camera.start_preview()

# overlay text on top of the photo
camera.annotate_text = 'Hello My Young Plants!\n' + curr_dt_tm

time.sleep(10)

# capture the photo to a local file system
camera.capture('20160110.jpg')
