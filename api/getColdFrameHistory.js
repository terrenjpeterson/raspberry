// lambda function written in nodeJS to summarize Cold Frame Temp History

console.log('loading required functions');

var AWS = require('aws-sdk');

console.log('starting to execute function');

exports.handler = function(event, context) {
    // start executing function
    console.log('processing request');
    // leverage dynamo DB
    var dynamodb = new AWS.DynamoDB({region: 'us-west-2'});
    // set the reading Date
    var readingDate = '2016-02-15';
    //console.log('passed in variable: ' + event.readDate);
    // set the location based on what was passed in 
    var location = event.location;
    // set the parameters for the function
    var bucketInterval = 10; // this represents the number of minutes
    var totalBuckets = 24 * ( 60 / bucketInterval );
    // set parameters to do a scan based on reading date
    var params = {
        TableName : 'HumidTempReadings',
        //Limit: 5000,
        ScanFilter: { 'readingDate' : 
            {
                'AttributeValueList' : [ { S : readingDate } ],
                'ComparisonOperator' : 'EQ'
            }
        }
    };
    //
    dynamodb.scan(params, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                // scan will return an array of raw unsorted readings
                historyArray = data.Items;
                // now build an array that will summarize the Cold Frame data
                readInstance = [];
                tempTotal = [];
                humidTotal = [];
                //
                for (i = 0; i< totalBuckets; i++) {
                    readInstance[i] = 0;
                    tempTotal[i] = 0;
                    humidTotal[i] = 0;
                }
                // for each reading returned, perform logic to summarize raw readings into buckets
                for (i = 0; i < historyArray.length; i++) {
                    //console.log(historyArray[i]);
                    if (historyArray[i].location.S == location) {
                        // find the reading Bucket that corresponds to a ten minute interval
                        readingTime = historyArray[i].readingTime.S;
                        readingHour = parseInt(readingTime.substring(0,2));
                        readingMinute = parseInt(readingTime.substring(3,5));
                        readingBucket = Math.round(( readingHour * 60 + readingMinute ) / bucketInterval );
                        //
                        readingTemp = parseFloat(historyArray[i].temperature.S);
                        readingHumid = parseFloat(historyArray[i].humidity.S);
                        // add the current reading to the running totals for the correct bucket
                        tempTotal[readingBucket] += readingTemp;
                        humidTotal[readingBucket] += readingHumid;
                        readInstance[readingBucket] += 1;
                    }
                }
                // assemble array with data based on buckets totaled above
                var min = 0;
                var hr  = 0;
                var bucketArray = [];
                
                for (i = 0; i< totalBuckets; i++) {
                    // this is the object for the current bucket
                    var readingAve = {};
                    // increment the time block based on the interval
                    min += bucketInterval;
                    if ( min == 60 ) {
                        hr += 1;
                        min = 0;
                    }
                    // format the time in a string format
                    if (min !== 0) { 
                        readingAve.time = hr.toString() + ':' + min.toString() + ':00';
                    } else {
                        readingAve.time = hr.toString() + ':00:00';
                    }
                    // make sure there are readings, then average the data
                    if (readInstance[i] > 0) {
                        readingAve.temperature = tempTotal[i]/readInstance[i];
                        readingAve.humidity = humidTotal[i]/readInstance[i];
                        // add the object for the current interval into the array
                        bucketArray.push(readingAve);
                    }
                }
                context.succeed(bucketArray);
            }
        }
    );
};
