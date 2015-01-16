/* File: postgresModule.js
/* Purpose: provide functions that contact Postgres
/* All Queries use Prepared Statements: https://github.com/brianc/node-postgres/wiki/Prepared-Statements */
"use strict";
// Module for Postgres
var pg = require('pg');
// var conString = "postgres://<username>:<password>@<host>/<database>";
var conString = "postgres://tplisk:psqlMizz0u!6@localhost:5432/tplisk";
// Function to Submit to Db
module.exports.submitPoemToPostgres = function (poemName, poemText, callback){
	// First Get a client from the connectino pool
	pg.connect(conString, function(err, dbClient, done){
		if (err){
		    return callback('error connecting to postgres: ' + err);
		}
		// Check to see if poem name is taken
		dbClient.query( {name: 'checkIfPoemExists', text: 'SELECT COUNT(poem_name) AS count FROM poemschema.poems WHERE poem_name = $1', values:[poemName]}, function(err, result) {
			if(err) {
		    	return callback(err);
			}
			else if (result.rows[0].count == 1) {
				return callback('Poem name is taken. Please choose another name.')
			}
			else {
				// Insert Poem
				dbClient.query( {name: 'insertPoem', text: 'INSERT INTO poemschema.poems VALUES ($1, $2)', values:[poemName,poemText]}, function(err, result) {
					if(err) {
				    	return callback('error inserting poem: ' + err);
					}
					else
					{
						return callback(null);
					}
				});
			}
		});
		// Removes the client from the connection pool
		done();
	});
}
// Function to Retrieve from Db
module.exports.retrievePoemFromPostgres = function (poemName, callback){
	// First get a client from the connection pool
	pg.connect(conString, function(err, dbClient, done){
		if (err){
		    return callback('error connecting to postgres: ' +err);
		}
		dbClient.query( {name: 'retrievePoem', text: 'SELECT poem_text FROM poemschema.poems WHERE poem_name = $1', values:[poemName]}, function(err, result) {
			if(err) {
		    	return callback('error retrieving poem: ' + err);
			}
			else {
				return callback(null, result.rows[0].poem_text);
			}
		});
		// Removes th client from the connection pool
		done();
	});
}
// Function to Display List of Poems in the Db