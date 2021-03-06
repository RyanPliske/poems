"use strict";
var poemModel = (function(){
  // Modules for serving https requests
  var https = require('https');
  var fs = require('fs');
  // Module for dealing with postgres
  var postgres = require('./postgresModule');
  // Module for parsing Get Requests
  var urlParser = require('url');
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
    /* 3: Allow Credentials to accept Cookies if I wanted to send some */
  
    response.writeHead(200, {'Content-Type': 'application/javascript',
                              'Access-Control-Allow-Origin': request.headers.origin,
                              'Access-Control-Allow-Methods' : 'GET,POST',
                              'Access-Control-Allow-Credentials': true});
  
    if (request.method == 'GET'){
      // Parse "Incoming Message" from GET request: http://nodejs.org/api/http.html#http_http_incomingmessage
      var queryParam = urlParser.parse(request.url, true).query
      if (queryParam.reqType == 'retrievePoem')
      {
        // Retrieve Poem from Database
        postgres.retrievePoemFromPostgres(queryParam.poemName, function (error, poemText){
          // Respond using jsonp format
          if (error)
            response.end('_poem(\'{"fail": "Failed To Retrieve From Database: ' + error + ' "}\')');
          else
            response.end('_poem(\'{"poemText": "' + poemText + '"}\')');
        });
      }
      else if (queryParam.reqType == 'retrievePoemList')
      {
        // Retrieve list of poems from Database
        postgres.retrievePoemListFromPostgres(function (error, poemList){
          // Respond using jsonp format
          if (error)
            response.end('_poem(\'{"fail": "Failed To Retrieve List of Poems From Database: ' + error + ' "}\')');
          else
          {
            // Build response text
            var jsonResponseWithListOfPoems = '_poem(\'{"poem":[';
            for (var i=0; i < poemList.length; i++)
            {
              jsonResponseWithListOfPoems += '{"name":"' + poemList[i].poem_name + '"}';
              if (i != poemList.length-1)
              {
                jsonResponseWithListOfPoems += ',';
              }
            }
            jsonResponseWithListOfPoems += ']}\')';
            // Send response with format: // response.end('_poem(\'{"poem":[{"name": "Ryan"}, {"name": "Poem2"}, {"name": "twist"}]}\')');
            response.end(jsonResponseWithListOfPoems);
          }
        });
      }
      else
        /* This is just to test FireFox issue by going to the domain:1337 via browser
        /* To get this to work on FireFox, First please visit: https://192.168.1.91:1337/
        /* to accept the security warning
        */
        response.end('Hello Firefox and IE, why you no like me?\nIs my self authenticated SSL certificate not good enough for you?');
    }
    else if (request.method == 'POST'){
      // Parse Data from POST request by first reading in the data
      var bodyFromRequest = "";
      request.on('data', function(chunk){
        bodyFromRequest += chunk;
      });
      // When It has all of the data, then Create parameters Object
      request.on('end', function() {
        var queryParams = {};
        // Grab parameters from the body
        bodyFromRequest.split("&").forEach(function(item) {
          queryParams[item.split("=")[0]] = item.split("=")[1];
        });
        // Send those paramters (the poem and poem name) to the Database
        postgres.submitPoemToPostgres(queryParams.poemName, queryParams.poemText, function (error){
          if (error)
            response.end('Failed During Save to Database: ' + error);
          else
            response.end('Successfully Saved Poem to Database');
        });
      });
    }      
  }).listen(1337);
  console.log('Server started. Listening on port:1337/');
})();