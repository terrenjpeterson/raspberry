var http = require('http');

exports.handler = function(event, context) {
    // this is the endpoint of the weather API
    var options = {
        host: 'api.wunderground.com',
        port: 80,
        path: '/api/f9815242167ffac0/conditions/q/VA/Richmond.json'
    };

    // invoke the API
    http.get(options, function(resp){
        resp.on('data', function(chunk){
            // convert the response to a json object
            respData = chunk.toString();
            weather = eval('(' + respData + ')').current_observation;
            
            // parse out the key attributes and create a return object
            var localReading = {}
                localReading.temperature = weather.temp_f;
                localReading.humidity = weather.relative_humidity;
                localReading.readTime = weather.observation_time_rfc822;

            console.log(weather);
            //console.log(temperature, humidity, readTime)
            context.succeed(localReading)
        });
    }).on("error", function(e){
        console.log("Got error: " + e.message);
    });
};
