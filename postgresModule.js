"use strict";
// Module for Postgres
var pg = require('pg');
// var conString = "postgres://<username>:<password>@<host>/<database>";
var conString = "postgres://tplisk:psqlMizz0u!6@localhost:5432/tplisk";
// Create a new, unconnected client from a url based connection string
var client = new pg.Client(conString);

module.exports.submitPoemToPostgres = function (poemName, poemText, callback){
	// Connect client
	client.connect(function(err) {
		if(err) {
			console.error('could not connect to postgres', err);
			return callback(err);
		}
		client.query('SELECT NOW() AS "theTime"', function(err, result) {
		// client.query('SELECT ')
			if(err) {
		    	console.error('error running query', err);
		    	return callback(err);
			}
			else
			{
				console.log(result.rows[0].theTime);
				return callback(null);
			}
			// Close connection to Postgres
			client.end();
		});
	});
}

module.exports.retrievePoemFromPostgres = function (poemName, callback){
	// Connect client
	client.connect(function(err) {
		if(err) {
			console.error('could not connect to postgres', err);
			return callback(err);
		}
		client.query('SELECT NOW() AS "theTime"', function(err, result) {
		// client.query('SELECT ')
			if(err) {
		    	console.error('error running query', err);
		    	return callback(err);
			}
			else
			{
				console.log(result.rows[0].theTime);
				return callback(null, result.rows[0].theTime);
			}
			// Close connection to Postgres
			client.end();
		});
	});
}