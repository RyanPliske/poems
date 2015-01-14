"use strict";
var poemViewController = (function(){
  // Create a request Object for Ajax
  var xmlhttp;
  if (window.XMLHttpRequest) // If browser supports XMLHttpRequest it's: IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  else // IE6 or IE5 so use ActiveXObject
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  
  // Function to Submit to Database
  var submitPoem = function() {
    console.log("Saving poem to database...");
    this.xmlhttp.open("POST", "https://192.168.1.91:1337/", true);
    this.xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    this.xmlhttp.send("poemName=RyansPoem&poemText=Onomotopoeia");
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
  var submitPoemButton = document.getElementById("submitPoem");
  var retrievePoemButton = document.getElementById("retrievePoem");
  var resultsTextBox = document.getElementById('resultFromServer')
  // Submit Poem to Postgres upon Click
  submitPoemButton.onclick = function () {
    poemViewController.submitPoem();
  };
  // Retrieve Poem from Postgres upon Click
  retrievePoemButton.onclick = function () {
    poemViewController.retrievePoem();
  };

  // Deal with the request
  poemViewController.xmlhttp.onreadystatechange = function(){
    // When finished
    if (poemViewController.xmlhttp.readyState == 4 && poemViewController.xmlhttp.status == 200)
    {
      // Do something
    }
  }
  
})();
