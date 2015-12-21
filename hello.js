var http = require('http');

var server = http.createServer(function (req, res) {

  console.log("Method Called: " + req.method);

  switch(req.method) {
    case 'GET':
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Hello World\n');
      console.log('Web Server Called : ' + req.url);

    case 'POST':
      console.log('processing data');

      req.on('data', function(chunk) {
        console.log("Recieved body data: " + chunk.toString());
      });

      req.on('end', function() {
        console.log("All done with POST");
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Received Data');
      });
  }
});

console.log('Node is running ');

server.listen(8080);
