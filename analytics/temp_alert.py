from __future__ import print_function

# import libraries to use AWS boto framework and translate json
import json
import boto3

print('Loading function')

def lambda_handler(event, context):
    # configure parameter to specific notification topic
    topic_arn = 'arn:aws:sns:us-west-2:034353605017:Garden-Notification'
    
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

	# Customize the body of the e-mail with specifics on the temperature and time that it occurred at
        alert_message = 'The most recent garden temperature reading was measured at %s F at %s' % (temperature, read_time)

        response = client.publish(
            TopicArn=topic_arn,
            Message=alert_message,
            Subject='Alert - Garden Temperatures are High',
            MessageStructure='string'
        )
    
    return 'Garden Temperature Check Complete'
