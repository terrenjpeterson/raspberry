var http = require('http');
var AWS = require('aws-sdk');

AWS.config.region = 'us-west-2';

var server = http.createServer(function (req, res) {

//  console.log("Method Called: " + req.method);

  switch(req.method) {
    case 'GET':
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Hello World\n');
      console.log('Web Server Called : ' + req.url);

    case 'POST':
//      console.log('processing data');

      req.on('data', function(chunk) {
        console.log("Recieved body data: " + chunk.toString());

        // create a timestamp
 
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

        var recordDate = year + ":" + month + ":" + day;
        var recordTime = hour + ":" + min + ":" + sec;

        console.log('date: ' + recordDate + ' time: ' + recordTime);

        console.log("posting to S3");

        var s3 = new AWS.S3();
        var params = {Bucket: 'robot-gardener',
                      Key: year.toString() + month.toString() + day.toString() + '/' + hour.toString() + min.toString() + sec.toString() + '.json',
                      Body: chunk.toString() };


        s3.putObject(params, function(err,data) {
          if (err) {
            console.log("Error uploading data: ", err);
          } else {
            console.log("Successfully uploaded data");
          }
        });
      });

      req.on('end', function() {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Received Data');
      });
  }
});

console.log('Node is running ');

server.listen(8080);
