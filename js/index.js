"use strict";
var poemViewController = (function(){
  // Create a request Object for Ajax
  var xmlhttp;
  // Boolean value to know what kind of object was created.
  xmlhttp = new XMLHttpRequest();
  // Check if the browser created an XMLHttpRequest object "withCredentials" property. (only exists on XMLHTTPRequest2 objects)
  if ("withCredentials" in xmlhttp) {
    xmlhttp.open('POST', 'https://192.168.1.91:1337/', true);
  // Otherwise, check if XDomainRequest, because it only exists in IE, and is IE's way of making CORS requests.
  } else if (typeof XDomainRequest != "undefined") {
    xmlhttp = new XDomainRequest();
    xmlhttp.open('POST', 'https://192.168.1.91:1337/');
  } 
  else {
    // Otherwise, CORS is not supported by the browser.
    xmlhttp = null;
  }

  if (!xmlhttp) {
    throw new Error('CORS not supported');
  }

  /* Function to Retrieve the text of the poem (via GET request) from node.js server:
  /*
  /* My node.js server is listening on port 1337, but the XMLHttpRequest I send from my browser is coming through 
  /* a different port (whicher port Apache is using). This poses a problem because I am failing the same-origin policy 
  /* which requires Same Protocol &  Host & Port.
  /* 
  /* Additionally, I'm having trouble receiving information back from my node.js server using FireFox, although both Chrome and Safari are working fine
  /* with the jQuery Ajax function which uses JSONP format. Thus I am attempting to solve this problem by using CORS (Cross Origin Resource Sharing) 
  /* via JavaScript in order to get this to work on FireFox. CORS says it's supported by all major browsers. 
  /*
  /* My attempts to try CORS and JSONP approaches were spawned by: http://en.wikipedia.org/wiki/Same-origin_policy
  /* Some noteable understanding was found from: https://senecacd.wordpress.com/2013/02/15/enabling-cors-on-a-node-js-server-same-origin-policy-issue/
  /* Differences betwen CORS and JSONP: JSONP only supports the GET request method. CORS supports other http requests.
  */
  var retrievePoem = function() {
    console.log("Retrieving poem...");
    // Attempting to save poem using jsonp
    $(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: 'https://192.168.1.91:1337/',
        dataType: "jsonp",
        jsonpCallback: "_testcb",
        cache: false,
        timeout: 1000,
        success: function(data) {
            $("#resultFromServer").append(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(jqXHR + " " + textStatus + " " + errorThrown);
        }
      });
    });
    
  };
  // Function to Submit Poem to the Database
  var submitPoem = function() {
    console.log("Saving poem to database...");
    // Attempting to use Javascript via CORS
    xmlhttp.send();
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

  // Successful request using CORS
  poemViewController.xmlhttp.onload = function(){
    // When finished
    var text = poemViewController.xmlhttp.responseText;
    // var title = text.match('<title>(.*)?</title>')[1];
    alert('Reponse from CORS request: ' + text);
  }
  // Error with request via CORS
  poemViewController.xmlhttp.onerror = function(){
    // When finished
    alert('Error making the request.');
  }

})();
