"use strict";
var poemModel = (function(){
  // Modules for serving https requests
  var https = require('https');
  var fs = require('fs');
  // Module for dealing with postgres
  var postgres = require('./postgresModule');
  // location of SSL certification and key on my server
  var options = {
  	key: fs.readFileSync('/etc/apache2/ssl/apache.key'),
  	cert: fs.readFileSync('/etc/apache2/ssl/apache.crt')
  };

  // Creates a Server that waits for requests
  https.createServer(options, function (request, response) {
  	/* Add a Response Header to the Request: 
    /* First Argument: Status Code 200, 'OK'
    /* Second Argument: 
    /* 1: Allow Origin for CORS
    /* 2: If I want to add more functionality later, I can add more Methods to delete poems, etc.
    /* 3: Allow Credentials to accept Cookies */
    response.writeHead(200, {'Content-Type': 'text/javascript',
                              'Access-Control-Allow-Origin': 'https://192.168.1.91',
                              'Access-Control-Allow-Methods' : 'GET,POST',
                              'Access-Control-Allow-Credentials': true});
  
    if (request.method == 'GET'){
      // Parse "Incoming Message" from GET request: http://nodejs.org/api/http.html#http_http_incomingmessage
      var queryParam = require('url').parse(request.url, true).query
      // Retrieve Poem from Database
      postgres.retrievePoemFromPostgres(queryParam.poemName, function (error, poemText){
        // Respond using jsonp format
        if (error)
          response.end('_poem(\'{"fail": "Failed To Retrieve From Database: ' + error + ' "}\')');
        else
          response.end('_poem(\'{"poemText": "' + poemText + '"}\')');
      
      });
    }
    else if (request.method == 'POST'){
      // Parse Data from POST request
      var body = "";
      request.on('data', function(chunk){
        body += chunk;
      });
      request.on('end', function() {
        response.end('_poem(\'{"poemText": "' + body + '"}\')');
      });
      /*
      // Post Poem to Database
      postgres.submitPoemToPostgres("Ryan", "RyanisCool", function (error){
        if (error)
          response.end('Failed During Save to Database: ' + error);
        else
          response.end('Successfully Saved Poem to Database');
      
      });
*/
    }
    
  }).listen(1337);
  console.log('Server started. Listening on port:1337/');
})();