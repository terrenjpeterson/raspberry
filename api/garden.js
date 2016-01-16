// include required nodejs packages

var http    = require('http');
var AWS     = require('aws-sdk');
var express = require('express');

// for AWS - using the US-WEST (OREGON) region
AWS.config.region = 'us-west-2';

// create the app server
var app = express();
var server = http.createServer(app);

// this is the name of the bucket that is used 
var dataBucket = 'robot-gardener';

// general API for posting temperature and humidity data

app.post('/post', function(req, res){

  var sensorData = "";

  req.on('data', function(chunk) {
    sensorData += chunk;
  });

  req.on('end', function() {

    currData = sensorData.toString();

    console.log("processing sensor reading : " + currData);

    // creating the path to save the reading based on the date from the sensor

    var sensorDate = eval('(' + currData + ')').read_date;

    var pathDate = sensorDate.substring(0,4) + sensorDate.substring(5,7) + sensorDate.substring(8,10);

    // first overwrite current data to display on dashboard

    var s3 = new AWS.S3();
    var params = {Bucket: dataBucket,
                  Key: 'current.json',
                  ACL: 'public-read',
                  Body: currData };

    s3.putObject(params, function(err,data) {
      if (err) {
        console.log("Error uploading data: ", err);
      } else {
        // first get current array of data for the date

        var s3 = new AWS.S3();

        var priorHistParams = {Bucket: dataBucket,
                               Key: pathDate + ".json"};

        s3.getObject(priorHistParams, function(err, data) {
          if(err) {
            // TODO: add logic to handle first reading of a day
            console.log("error finding history array: " + err);
            var histDataArray = [];
          } else { 

            var histDataArray = eval('(' + data.Body + ')');

            // now add to the array containing all of the history for the day
  
            var convData = eval('(' + sensorData + ')');

            var histData = {};
                histData.readTime = convData.read_time;
                histData.temp     = convData.temperature;
                histData.humidity = convData.humidity;

            histDataArray.push(histData);

            var saveData = JSON.stringify(histDataArray);

            // then replace the array in the S3 bucket

            var s3 = new AWS.S3();
            var histParams = {Bucket: dataBucket,
                              Key: pathDate + '.json',
                              ACL: 'public-read',
                              Body: saveData };

            s3.putObject(histParams, function(err, data) {
              if (err) {
                console.log("Error uploading history data: ", err);
                } else {
//                console.log("Successfully uploaded history");
              }
            });

            // then return the call back to the HTTP request

            res.send('Received Data');
          }
        });
      }
    });
  });
});

app.post('/photo', function(req, res){

  var sensorData = "";

  req.on('data', function(chunk) {

    console.log('data received');
    sensorData += chunk;

  });

  req.on('end', function() {

    console.log('upload complete');
    res.send('Upload Complete');

  });
});

console.log('Node is running ');

app.listen(8080);
