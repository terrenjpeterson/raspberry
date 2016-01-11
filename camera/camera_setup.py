#!/usr/bin/python

import picamera
import time
import datetime

curr_dt_tm = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

print curr_dt_tm

# create an instance of the camera

camera = picamera.PiCamera()
camera.vflip = True
camera.hflip = True
camera.ISO = 100

# set resolution of the camera
camera.resolution = (1600, 900)
camera.start_preview()

time.sleep(2000)

camera.stop_preview()
