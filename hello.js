var http = require('http');
var AWS = require('aws-sdk');

AWS.config.region = 'us-west-2';

var server = http.createServer(function (req, res) {

  switch(req.method) {
    case 'GET':
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Hello World\n');
      console.log('Web Server Called : ' + req.url);

    case 'POST':

      var sensorData = "";

      req.on('data', function(chunk) {
        sensorData += chunk;
      });

      req.on('end', function() {

        currData = sensorData.toString();

        console.log("processing sensor reading : " + currData);

        // create a timestamp that will be used in processing the data

        var date = new Date();

        var hour = date.getHours();
            hour = (hour < 10 ? "0" : "") + hour;

        var min  = date.getMinutes();
            min = (min < 10 ? "0" : "") + min;

        var sec  = date.getSeconds();
            sec = (sec < 10 ? "0" : "") + sec;

        var year = date.getFullYear();

        var month = date.getMonth() + 1;
            month = (month < 10 ? "0" : "") + month;

        var day  = date.getDate();
            day = (day < 10 ? "0" : "") + day;

//        var recordDate = year + ":" + month + ":" + day;
//        var recordTime = hour + ":" + min + ":" + sec;

        // first overwrite current data to display on dashboard

        var s3 = new AWS.S3();
        var params = {Bucket: 'robot-gardener',
                      Key: 'current.json',
                      ACL: 'public-read',
                      Body: currData };


        s3.putObject(params, function(err,data) {
          if (err) {
            console.log("Error uploading data: ", err);
          } else {
            // first get current array of data for the date

            var s3 = new AWS.S3();

            var priorHistParams = {Bucket: 'robot-gardener',
                                   Key: year + month + day + ".json"};

            s3.getObject(priorHistParams, function(err, data) {
              if(err) {
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
                var histParams = {Bucket: 'robot-gardener',
                                  Key: year + month + day + '.json',
                                  ACL: 'public-read',
                                  Body: saveData };

                s3.putObject(histParams, function(err, data) {
                  if (err) {
                    console.log("Error uploading history data: ", err);
                    } else {
//                    console.log("Successfully uploaded history");
                  }
                });

                // then return the call back to the HTTP request

                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('Received Data');
              }
            });
          }
        });
      });
  }
});

console.log('Node is running ');

server.listen(8080);
