"use strict";
var poemViewController = (function(){

  // Private Method that creates a request Object for Ajax
  var _createCORSRequestObject = function() {
    var xhr = new XMLHttpRequest();
    // Check if the browser created an XMLHttpRequest object "withCredentials" property. (only exists on XMLHTTPRequest2 objects)
    if ("withCredentials" in xhr) {
      xhr.open('POST', 'https://192.168.1.91:1337/', true);
    // Otherwise, check if XDomainRequest, because it only exists in IE, and is IE's way of making CORS requests.
    } else if (typeof XDomainRequest != "undefined") {
      xhr = new XDomainRequest();
      xhr.open('POST', 'https://192.168.1.91:1337/');
    } 
    else {
      // Otherwise, CORS is not supported by the browser.
      xhr = null;
    }
    if (!xhr) {
      throw new Error('CORS not supported');
    }
    return xhr;
  };
  
  /* Public Function to Retrieve the text of the poem (via GET request) from node.js server:
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
  var retrievePoem = function(poemName) {
    console.log("Retrieving poem...");
    // Attempting to save poem using jsonp : http://api.jquery.com/jquery.ajax/
    $(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: 'https://192.168.1.91:1337/',
        data: { 'poemName': poemName},
        dataType: "jsonp",
        jsonpCallback: "_poem",
        cache: false,
        timeout: 1000,
        success: function(data) {
            // Parse the JSON
            data = JSON.parse(data)
            // Display the Poem
            poemView.displayReturnedPoem(null, data.poemText);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            poemView.displayReturnedPoem(jqXHR + " " + textStatus + " " + errorThrown);
        }
      });
    });
  };
  // Public Function to Submit Poem to the Database (see notes from above)
  var submitPoem = function() {
    console.log("Saving poem to database...");
    var xmlhttp = _createCORSRequestObject();
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // Attempting to use Javascript via CORS
    xmlhttp.send("poemName=Poem2&poemText=Superbad");
    // Prepare for Successful Response from Server
    xmlhttp.onload = function(){
      poemView.displayResponseFromSaving(null,xmlhttp.responseText);
      // var title = text.match('<title>(.*)?</title>')[1];
    }
    // Prepare for Error from Server
    xmlhttp.onerror = function(){
      poemView.displayResponseFromSaving('No reponse from the server.');
    }
    
  };
  // Make some Functions and Objects available to poemView
  return{
    submitPoem: submitPoem,
    retrievePoem: retrievePoem,
  };
})();

var poemView = (function () {
  // Force https
  if (window.location.protocol != 'https:')
  {
    window.location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
  }
  var submitPoemButton = document.getElementById("submitPoem");
  var retrievePoemButton = document.getElementById("retrievePoem");
  var retrievedPoemTextBox = document.getElementById('poemRetrievalResult');
  var selectedPoemFromDropDown = document.getElementById("selectAPoem");
  // Submit Poem to Postgres upon Click
  submitPoemButton.onclick = function () {
    poemViewController.submitPoem();
  };
  // Retrieve Poem from Postgres upon Click
  retrievePoemButton.onclick = function () {
    var selectedPoem_poemName = selectedPoemFromDropDown.options[selectedPoemFromDropDown.selectedIndex].value;
    poemViewController.retrievePoem(selectedPoem_poemName);
  };

  // Function to Handle Saving Poem to Database
  var displayResponseFromSaving = function(error, successMsg) {
    if (error)
      alert(error);
    else
      alert(successMsg);
  };

  // Function to handle Retrieving Poem 
  var displayReturnedPoem = function(error, successMsg) {
    if (error)
      alert(error);
    else
      retrievedPoemTextBox.innerHTML = successMsg;
  };
  return{
    displayResponseFromSaving: displayResponseFromSaving,
    displayReturnedPoem: displayReturnedPoem
  };
})();
