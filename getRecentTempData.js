// lambda function written in nodeJS to get an article in S3

console.log('loading required functions');

var aws = require('aws-sdk');

console.log('starting to execute function');

exports.handler = function(event, context) {
    // start executing function
    console.log('processing request');
    
    //console.log('event' + JSON.stringify(event));
    // pull the history array for a given day
    
    var s3 = new aws.S3();
    
    var getParams = {Bucket : 'robot-gardener', 
                     Key : '20160101.json'}; 

    console.log('attempt to pull an object from an s3 bucket' + JSON.stringify(getParams));

    s3.getObject(getParams, function(err, data) {
      if(err)
        console.log('Error getting history data : ' + err);
      else
        console.log('Successfully retrieved history data : ' + err);

        // data retrieval was successfull
        var histDataArray = eval('(' + data.Body + ')');
        console.log('number of readings: ' + histDataArray.length);

        // build a summary array by sampling based on freq parameter
        summaryArray = [];
        freq = 20;
        
        // these are temporary variables that are used in calculating average for the period
        j = 1;
        sumTemp  = 0;
        sumHumid = 0;
        
        for (i = 0; i < histDataArray.length; i++) { 
            if (j == freq) {
                // if matches, calculate the average from the running total for the period, 
                // then push the object into the sample array.
                var aveReading = {};
                    aveReading.readTime = histDataArray[i].readTime;
                    aveReading.temp     = (sumTemp + Number(histDataArray[i].temp))/freq;
                    aveReading.humidity = (sumHumid + Number(histDataArray[i].humidity))/freq;
                    
                summaryArray.push(aveReading);

                // then reset temp variables
                j = 1;
                sumTemp  = 0;
                sumHumid = 0;
            } else { 
                // increment interval counter and add current sensor readings for average
                j++;
                sumTemp  += Number(histDataArray[i].temp)
                sumHumid += Number(histDataArray[i].humidity)
            }
        }
      // then return the summary array back to the caller
      context.succeed(summaryArray);
    });
};
