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

https.createServer(options, function (req, res) {
	// Add a Response
  res.writeHead(200, {'Content-Type': 'text/plain'});
  // res.end('Hello World\n');
  res.end('_testcb(\'{"message": "Hello world!"}\')');
  /*
  if (req.method == 'POST'){
  	pg.insert_records(req,res);
  }
  */
}).listen(1337);
console.log('Server running at port:1337/');