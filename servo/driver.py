#!/usr/bin/python

# import General Purpose IO Libraries
import RPi.GPIO as GPIO
import time

# configure pin 18 to be used
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(18, GPIO.OUT)

print "Setup Complete"

# PWD is used to control the width of the pulses to control the servo
# the frequency for this is set to 100 Hz (send pulse every 10 ms)
pwm = GPIO.PWM(18, 100)
pwm.start(5)

print "Starting"

# for loop changes what the pulse duration is to change angle
for x in range(0, 200):
  duty = float(x) / 10.0 + 2.5
  pwm.ChangeDutyCycle(duty)
  time.sleep(.05)
  print duty

print "Complete"
