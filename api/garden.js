// include required nodejs packages

var http    = require('http');
var AWS     = require('aws-sdk');
var express = require('express');
var fs      = require('fs');

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
            // Assume error indicates that no current reading has been entered
            var histDataArray = [];

            var s3 = new AWS.S3();
            var histParams = {Bucket: dataBucket,
                              Key: pathDate + '.json',
                              ACL: 'public-read',
                              Body: histDataArray };

            s3.putObject(histParams, function(err, data) {
              if (err) {
                console.log("Error uploading history data: ", err);
                } else {
                console.log("Successfully uploaded blank history entry");
              }
            });

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

// API for saving moisture sensor data

app.post('/saveMoistureReading', function(req, res){

  var sensorData = "";

  req.on('data', function(chunk) {
    sensorData += chunk;
  });

  req.on('end', function() {
    // process data object that has been passed

    currData = sensorData.toString();

    console.log("processing sensor reading : " + currData);

    // creating the path to save the reading based on the date from the sensor

    var sensorDate = eval('(' + currData + ')').read_date;
    var pathDate = sensorDate.substring(0,4) + sensorDate.substring(5,7) + sensorDate.substring(8,10);

    // determine which channel the sensor is for and set target object to be used when saving

    var sensorChannel = eval('(' + currData + ')').sensor_channel;
    var targetObject = 'moisture' + sensorChannel + '.json';

    // first overwrite current channel object data that can be displayed on a dashboard

    var s3 = new AWS.S3();
    var params = {Bucket: dataBucket,
                  Key: targetObject,
                  ACL: 'public-read',
                  Body: currData };

    s3.putObject(params, function(err,data) {
      if (err) {
        console.log("Error uploading data: ", err);
      } else {
        // assuming the first step is successful, now save the data to a historical array

        // first get current array of data for the date

        var s3 = new AWS.S3();

        var priorHistParams = {Bucket: dataBucket,
                               Key: pathDate + "-moisture.json"};

        s3.getObject(priorHistParams, function(err, data) {
          if(err) {
            // assume error is due to first entry not being there
            var histDataArray = [];

            var s3 = new AWS.S3();

            var histParams = {Bucket: dataBucket,
                              Key: pathDate + '-moisture.json',
                              ACL: 'public-read',
                              Body: histDataArray };

            s3.putObject(histParams, function(err, data) {
              if (err) {
                console.log("Error uploading history data: ", err);
                } else {
                console.log("Successfully uploaded blank moisture history");
              }
            });

          } else {

            var histDataArray = eval('(' + data.Body + ')');

            // now add to the array containing all of the history for the day

            var convData = eval('(' + sensorData + ')');

            var histData = {};
                histData.readTime         = convData.read_time;
                histData.relativeMoisture = convData.relative_moisture;
                histData.absoluteMoisture = convData.absolute_moisture;
                histData.plantId          = convData.plant_id;
                histData.sensorId         = convData.sensor_channel;

            histDataArray.push(histData);

            var saveData = JSON.stringify(histDataArray);

            // then replace the array in the S3 bucket

            var s3 = new AWS.S3();
            var histParams = {Bucket: dataBucket,
                              Key: pathDate + '-moisture.json',
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

// this API is used to upload an image to an S3 bucket and is coming from the RaPi

app.post('/photo', function(req, res){

  // sensorData will be the string that is the image data

  var sensorData = "";
  var counter = 0;
  var lastChunk = "";

  req.on('data', function(chunk) {

    counter += 1;

    //console.log('data received: ' + sensorData.length + ' counter: ' + counter);

    sensorData += chunk;

    // need to strip off header

    if (counter == 1) {
      var dataBit = 0;
      var fullData = '';
      var readData = '';

      console.log('chunk length: ' + chunk.length);

      // the first 109 characters are padded header

      while (dataBit < 109)
        { 
         console.log('checking bit: ' + dataBit + ' data: ' + sensorData.charAt(dataBit));
         fullData += sensorData.charAt(dataBit);
         dataBit += 1;       
        };

      while (dataBit < chunk.length)
        {
         readData += sensorData.charAt(dataBit);
         dataBit += 1;
        };

      // this is what was stripped off the first block received
      console.log('total header: ' + fullData);
      console.log('read data: ' + readData);
      fs.writeFileSync('garden.jpg', readData, encoding='binary');
    };

    if (counter > 1)
      {
       //console.log(chunk.toString());
       lastChunk = chunk;

       // write the block of data to the local file
       fs.appendFileSync('garden.jpg', chunk, encoding='binary');
      }
  });

  req.on('end', function() {

    console.log('upload complete');

    console.log('last chunk: ' + lastChunk);
    console.log('last chunk length: ' + lastChunk.length);

    dataBit = lastChunk.length - 20;

    console.log('data bit: ' + dataBit);

    //console.log('substring: ' + trunkThis.substring(dataBit, lastChunk.length));

    //while (dataBit < lastChunk.length)
    //  {
    //   console.log('checking bit: ' + dataBit + ' data: ' + lastChunk.charAt(dataBit));
    //   dataBit += 1;
    //  }

    var s3 = new AWS.S3();

    // read locally written temp file and then load into a buffer

    var tempFile = fs.readFileSync('garden.jpg', 'binary');

    console.log('read in file of size : ' + tempFile.length);

    var uploadImage = new Buffer(tempFile, 'binary');

    console.log('buffer size : ' + uploadImage.length);

    // now write to an S3 bucket for permanent storage

    var params = {Bucket: 'robot-gardener',
                  Key: 'garden.jpg',
                  ACL: 'public-read',
                  Body: uploadImage,
                  ContentType: 'image/jpeg'};

    s3.putObject(params, function(err, data) {
      if (err) {
        console.log('Error putting photo into S3: ' + err);
        res.send('Upload Complete - Upload Error');
      } else {
        console.log('Successfully uploaded new garden image to AWS-S3');
        res.send('Upload Complete');
      }
    });

  });
});

console.log('Node is running ');

app.listen(8080);
