"use strict";
// Modules for serving https requests
var https = require('https');
var fs = require('fs');
// Module for Postgres
var pg = require('pg');

var options = {
	key: fs.readFileSync('/etc/apache2/ssl/apache.key'),
	cert: fs.readFileSync('/etc/apache2/ssl/apache.crt')
};
// var conString = "postgres://<username>:<password>@<host>/<database>";
var conString = "postgres://tplisk:psqlMizz0u!6@localhost:5432/tplisk";
// Create a new, unconnected client from a url based connection string
var client = new pg.Client(conString);
// Connect client
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
  // client.query('SELECT ')
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].theTime);
    // Close connection to Postgres
    client.end();
  });
});

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
    // Insert Poem to Database
  	// pg.insert_records(req,res);
    // Respond using jsonp format
    response.end('_testcb(\'{"message": "Retrieved This Poem From Database."}\')');
  }
  else if (request.method == 'POST'){
    // Grab Poem from Database
    // If successful, Respond with a success message
    response.end('Successfully Saved to Database');
  }
  
}).listen(1337);
console.log('Server running at port:1337/');