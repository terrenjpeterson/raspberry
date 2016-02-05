// lambda function written in nodeJS to aggregate moisture history

console.log('loading required functions');

var aws = require('aws-sdk');

console.log('starting to execute function');

exports.handler = function(event, context) {
    // start executing function
    console.log('processing request');
    
    // build the file name where the data is stored based on the current date
    
    var date = new Date();

    var year = date.getFullYear();
    
    var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
        
    var day = date.getDate();

    // adjust for current timezone as EST is five hours behind UTC
    if (date.getHours() < 5) {day = day - 1}

        day = (day < 10 ? "0" : "") + day;
        
    var dataFile = year + month + day + '-moisture.json';
    //dataFile = '20160131-moisture.json';
    
    // pull the history array for a given day
    
    var s3 = new aws.S3();
    
    var getParams = {Bucket : 'robot-gardener', 
                     Key : dataFile}; 

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
        freq = 100;
        
        // these are temporary variables that are used in calculating average for the period
        j = 1;
        var sumRelMoisture = [];
        var sumAbsMoisture = [];
        var sampleReadings = [];
        
        for (k = 0; k < 4; k++) {
            sumRelMoisture[k] = 0;
            sumAbsMoisture[k] = 0;
            sampleReadings[k] = 0;
        }

        // then return the summary array back to the caller
        
        //for (i = 0; i < 100; i++) {
        for (i = 0; i < histDataArray.length; i++) {
            plantId = histDataArray[i].sensorId;

            // add current reading to appropriate plant array
            sumRelMoisture[plantId] += histDataArray[i].relativeMoisture;
            sumAbsMoisture[plantId] += histDataArray[i].absoluteMoisture;
            sampleReadings[plantId] += 1;
              
            //console.log(histDataArray[i]);
            if (j == freq) {
                // if matches, calculate the average from the running total for the period, 
                // then push the object into the sample array.
                var aveReading = {};
                    aveReading.readTime = histDataArray[i].readTime;
                    aveReading.readDate = year + '/' + month + '/' + day;

                var sensor0 = {};
                    sensor0.sensorId = '0';
                    sensor0.plantId = 'L-2-4';
                    sensor0.relativeMoisture = sumRelMoisture[0]/sampleReadings[0];
                    sensor0.absoluteMoisture = sumAbsMoisture[0]/sampleReadings[0];
                    sensor0.readings = sampleReadings[0];

                var sensor1 = {};
                    sensor1.sensorId = '1';
                    sensor1.plantId = 'T-1-4';
                    sensor1.relativeMoisture = sumRelMoisture[1]/sampleReadings[1];
                    sensor1.absoluteMoisture = sumAbsMoisture[1]/sampleReadings[1];
                    sensor1.readings = sampleReadings[1];

                var sensor2 = {};
                    sensor2.sensorId = '2';
                    sensor2.plantId = 'C-2-8';
                    sensor2.relativeMoisture = sumRelMoisture[2]/sampleReadings[2];
                    sensor2.absoluteMoisture = sumAbsMoisture[2]/sampleReadings[2];
                    sensor2.readings = sampleReadings[2];

                var sensor3 = {};
                    sensor3.sensorId = '3';
                    sensor3.plantId = 'B-1-6';
                    sensor3.relativeMoisture = sumRelMoisture[3]/sampleReadings[3];
                    sensor3.absoluteMoisture = sumAbsMoisture[3]/sampleReadings[3];
                    sensor3.readings = sampleReadings[3];

                var sensorReadings = [];
                    sensorReadings.push(sensor0);
                    sensorReadings.push(sensor1);
                    sensorReadings.push(sensor2);
                    sensorReadings.push(sensor3);
                    
                    aveReading.readings = sensorReadings;

                summaryArray.push(aveReading);

                // then reset temp variables
                j = 1;
                
                for (k = 0; k < 4; k++) {
                    sumRelMoisture[k] = 0;
                    sumAbsMoisture[k] = 0;
                    sampleReadings[k] = 0;
                }

            } else { 
                // increment interval counter and add current sensor readings for average
                j++;
            }
        }
            
        context.succeed(summaryArray);
    });
};
