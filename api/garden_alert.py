from __future__ import print_function

import json
import boto3

print('Loading function')

def lambda_handler(event, context):
    # retrieve current conditions from S3 Bucket
    s3 = boto3.resource('s3')
    object = s3.Object('robot-gardener','current.json')
    response = object.get()["Body"].read()
    
    print(response)
    
    # parse out the temperature and time/date from the sensor data
    data = json.loads(response)
    temperature = data['temperature']
    read_time = data['read_time']
    read_date = data['read_date']

    # set max threshold for the alert
    max_temp = 80

    print('Temp: ' + temperature)
    
    temperature = float(temperature)

    # check if the max level is exceeded, if so send an alert to the SNS topic
    if temperature > max_temp:
        print('Temperature Exceeded 80')
        # Get the service resource
        client = boto3.client('sns')

        response = client.publish(
            TopicArn='arn:aws:sns:us-west-2:034353605017:Garden-Notification',
            Message='The most recent garden temperature reading was greater than 80 degrees.',
            Subject='Alert - Garden Temperatures are High',
            MessageStructure='string'
        )
    
    return 'Garden Temperature Check Complete'
