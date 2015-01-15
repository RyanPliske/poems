"use strict";
var poemViewController = (function(){
  // Create a request Object for Ajax
  var xmlhttp;
  /*
  if (window.XMLHttpRequest) // If browser supports XMLHttpRequest it's: IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  else // IE6 or IE5 so use ActiveXObject
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  */
  // Boolean value to know what kind of object was created.
  xmlhttp = new XMLHttpRequest();
  // Check if the browser created an XMLHttpRequest object "withCredentials" property. (only exists on XMLHTTPRequest2 objects)
  if ("withCredentials" in xmlhttp) {
    xmlhttp.open('POST', 'poemModel.js', true);
  // Otherwise, check if XDomainRequest, because it only exists in IE, and is IE's way of making CORS requests.
  } else if (typeof XDomainRequest != "undefined") {
    xmlhttp = new XDomainRequest();
    xmlhttp.open('POST', 'poemModel.js');
  } 
  else {
    // Otherwise, CORS is not supported by the browser.
    xmlhttp = null;
  }

  if (!xmlhttp) {
    throw new Error('CORS not supported');
  }

  // Function to Submit to Database
  var submitPoem = function() {
    console.log("Saving poem to database...");
    xmlhttp.send();
  };
  // Function to Retrieve From Database
  var retrievePoem = function() {
    console.log("Retrieving poem...");
  };
  // Make some Functions and Objects available to poemView
  return{
    submitPoem: submitPoem,
    retrievePoem: retrievePoem,
    xmlhttp: xmlhttp
  };
})();

var poemView = (function () {
  // Check for https
  if (window.location.protocol != 'https:')
  {
    window.location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
  }
  var submitPoemButton = document.getElementById("submitPoem");
  var retrievePoemButton = document.getElementById("retrievePoem");
  var resultsTextBox = document.getElementById('resultFromServer');
  // Submit Poem to Postgres upon Click
  submitPoemButton.onclick = function () {
    poemViewController.submitPoem();
  };
  // Retrieve Poem from Postgres upon Click
  retrievePoemButton.onclick = function () {
    poemViewController.retrievePoem();
  };

  // Successful request
  poemViewController.xmlhttp.onload = function(){
    // When finished
    var text = poemViewController.xmlhttp.responseText;
    var title = text.match('<title>(.*)?</title>')[1];
    alert('Reponse from CORS request to ' + title);
  }
  // Error with request
  poemViewController.xmlhttp.onerror = function(){
    // When finished
    alert('Error making the request.');
  }

})();
