mport requests
import time

Apiurl = 'http://ec2-52-10-210-159.us-west-2.compute.amazonaws.com:8080'
counter = 0

while True:
  # r = requests.get(Apiurl+'/data?counter='+str(counter))

  # print 'http status: ' + str(r.status_code)
  # print 'counter: ' + str(counter)

  # time.sleep(10)

  print 'sending data to remote server - counter: ' + str(counter)


  x = requests.post(Apiurl+'/post', data = {"counter":counter})

  print 'http post status: ' + str(x.status_code)

  time.sleep(10)

  counter += 1


