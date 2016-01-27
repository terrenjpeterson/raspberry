from __future__ import print_function

import json
import boto3

print('Loading function')

def lambda_handler(event, context):
    # Get the service resource
    client = boto3.client('sns')

    response = client.publish(
        TopicArn='arn:aws:sns:us-west-2:034353605017:Garden-Notification',
        Message='The most recent garden temperature reading was above 80 degrees.',
        Subject='Alert - Garden Temperatures are High',
        MessageStructure='string'
    )

    return 'Garden Message Sent'
