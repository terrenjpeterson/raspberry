// lambda function written in nodeJS to get moisture sensor reading based on sensorId provided

console.log('loading required functions');

var aws = require('aws-sdk');

// this is the bucket where the sensor data is stored.
var dataBucket = 'robot-gardener';

console.log('starting to execute function');

exports.handler = function(event, context) {
    // start executing function
    console.log('processing request');

    // leverage s3 resource
    var s3 = new aws.S3();
    
    // set which moisture sensor based on the parameter passed in
    var sensorObject = 'moisture' + event.sensorId + '.json';
    
    var getParams = {Bucket : dataBucket, 
                     Key : sensorObject}; 

    s3.getObject(getParams, function(err, data) {
      if(err) {
        console.log('Error getting history data : ' + err);
        context.fail(err);
      } else {
        console.log('Successfully retrieved history data : ' + err);
        // data retrieval was successfull
        var moistureReading = eval('(' + data.Body + ')');
        console.log('moisture reading: ' + JSON.stringify(moistureReading));

        // then return result
        context.succeed(moistureReading);
      }
    });
}
