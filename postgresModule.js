"use strict";
// Module for Postgres
var pg = require('pg');
// var conString = "postgres://<username>:<password>@<host>/<database>";
var conString = "postgres://tplisk:psqlMizz0u!6@localhost:5432/tplisk";

module.exports.submitPoemToPostgres = function (poemName, poemText, callback){

	pg.connect(conString, function(err, dbClient, done){
		if (err){
			console.error('error running query', err);
		    return callback(err);
		}
		// Using Prepared Statements: https://github.com/brianc/node-postgres/wiki/Prepared-Statements
		dbClient.query( {name: 'insertPoem', text: 'INSERT INTO poemschema.poems VALUES ($1, $2)', values:[poemName,poemText]}, function(err, result) {
			if(err) {
		    	console.error('error running query', err);
		    	return callback(err);
			}
			else
			{
				return callback(null);
			}
			// Keeps client open awaiting in a pool
			done();
		});
	});
}

module.exports.retrievePoemFromPostgres = function (poemName, callback){

	pg.connect(conString, function(err, dbClient, done){
		if (err){
			console.error('error running query', err);
		    return callback(err);
		}
		dbClient.query( {name: 'retrievePoem', text: 'SELECT poem_text FROM poemschema.poems WHERE poem_name = $1', values:[poemName]}, function(err, result) {
		// client.query('SELECT NOW() AS "theTime"', function(err, result) {
			if(err) {
		    	console.error('error running query', err);
		    	return callback(err);
			}
			else
			{
				return callback(null, result.rows[0].poem_text);
			}
			// Keeps client open awaiting in a pool
			done();
		});
	});
}