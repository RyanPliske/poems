"use strict";
var poemViewController = (function(){

  // Force https
  if (window.location.protocol != 'https:'){
    window.location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
  }
  // Grab current url to know if we're on localhost or not
  var originToServer = window.location.origin;
  // Private Method that creates a request Object for Ajax
  var _createCORSRequestObject = function() {
    var xhr = new XMLHttpRequest();
    // Check if the browser created an XMLHttpRequest object "withCredentials" property. (only exists on XMLHTTPRequest2 objects)
    if ("withCredentials" in xhr) {
      xhr.open('POST', originToServer + ':1337/', true);
    // Otherwise, check if XDomainRequest, because it only exists in IE, and is IE's way of making CORS requests.
    } else if (typeof XDomainRequest != "undefined") {
      xhr = new XDomainRequest();
      xhr.open('POST', originToServer + ':1337/');
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
    // Retrieving the selected Poem via jsonp format: http://api.jquery.com/jquery.ajax/
    $(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: originToServer + ':1337/',
        data: { 'poemName': poemName, 'reqType':'retrievePoem'},
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
            if (jqXHR.status == 0)
              poemView.displayReturnedPoem('\nSorry, the Node.js Server is not currently servicing requests.');
            else 
              poemView.displayReturnedPoem(errorThrown);
        }
      });
    });
  };
  // Public Function to Submit Poem to the Database (see notes from above)
  var submitPoem = function(poemName, poemText) {
    console.log("Saving poem to database...");
    var xmlhttp = _createCORSRequestObject();
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // Attempting to use Javascript via CORS
    xmlhttp.send('poemName=' + poemName + '&poemText=' + poemText);
    // Prepare for Successful Response from Server
    xmlhttp.onload = function(){
      poemView.displayResponseFromSaving(null,xmlhttp.responseText);
      getListOfPoems();
    }
    // Prepare for Error from Server
    xmlhttp.onerror = function(){
      if (xmlhttp.responseText)
        poemView.displayResponseFromSaving(xmlhttp.responseText);
      else
        poemView.displayResponseFromSaving('\nSorry, the Node.js Server is not currently servicing requests.');
      // poemView.displayResponseFromSaving('No reponse from the server.');
    }
    
  };
  // Public Function to Populate Drop Down Menu
  var getListOfPoems = function(){
    console.log("Grabbing List of Poems...");
    $(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: originToServer + ':1337/',
        data: { 'reqType':'retrievePoemList'},
        dataType: "jsonp",
        jsonpCallback: "_poem",
        cache: false,
        timeout: 1000,
        success: function(data) {
            // Display the Poem
            poemView.fillPoemDropDown(null, data);
        },
        // jqXHR Object Properties: http://api.jquery.com/jQuery.ajax/#jqXHR
        error: function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 0)
              poemView.fillPoemDropDown('\nSorry, the Node.js Server is not currently servicing requests.');
            else 
              poemView.fillPoemDropDown(errorThrown);
        }
      });
    });
  };
  // Make Public Functions and Objects available to poemView
  return{
    submitPoem: submitPoem,
    retrievePoem: retrievePoem,
    getListOfPoems: getListOfPoems
  };
})();

var poemView = (function () {

  var finalizePoemButton = document.getElementById('finalizePoem');
  var submitPoemButton = document.getElementById("submitPoem");
  var retrievePoemButton = document.getElementById("retrievePoem");
  var poemTextArea = document.getElementById('poemTextArea');
  var selectedPoemFromDropDown = document.getElementById("selectAPoem");
  var currentListOfPoems = [];
  // Populate Drop Down Menu
  poemViewController.getListOfPoems();
  // Public Function to Handle getting the list of Poems and adding them to Drop Down
  var fillPoemDropDown = function(error, listOfPoems){
    if (error)
    {
      alert("Uanble to Populate Drop Down Menu: " + error)
      return;
    }

    // Clear the current drop down menu
    for (var i = selectedPoemFromDropDown.options.length-1; i>=0; i--)
    {
      selectedPoemFromDropDown.remove(i);
    }
    // Parse the JSON
    listOfPoems = JSON.parse(listOfPoems)
    // Grab each poem
    for (var i=0; i < listOfPoems.poem.length; i++)
    {
      // Add to Drop down Menu
      selectedPoemFromDropDown[selectedPoemFromDropDown.length] = new Option(listOfPoems.poem[i].name,listOfPoems.poem[i].name);
      currentListOfPoems[i] = listOfPoems.poem[i].name;
    }
  };

  // Private Function to Validate Name is not taken from the database
  var _validatePoemName = function(){
    $( "#poemName" )
      //Upon naming your poem for saving
      .keyup(function() {
        var poemNameTaken = false;
        var inputForPoemName = $(this).val();
        // If input field is empty then return.
        if (inputForPoemName == '')
        {
          document.getElementById('nameYourPoem').className = '';
          document.getElementById('poemNameSucccessEmblem').className = '';
          return;
        }
        // Check against the list of Poem Names
        for (var i=0; i < currentListOfPoems.length; i++)
        {
          if (inputForPoemName == currentListOfPoems[i])
          {
            poemNameTaken = true;
            break;
          }
        }
        // If poem name is NOT taken display success
        if (!poemNameTaken)
        {
          document.getElementById('nameYourPoem').className = 'form-group has-success has-feedback';
          document.getElementById('poemNameSucccessEmblem').className = 'glyphicon glyphicon-ok form-control-feedback';
        }
        // Else display Red Ex to indicate that the name is already used
        else
        {
          document.getElementById('nameYourPoem').className = 'form-group has-error has-feedback';
          document.getElementById('poemNameSucccessEmblem').className = 'glyphicon glyphicon-remove form-control-feedback';
        }
      })
      .keyup();
  };
  _validatePoemName();

  // Public Function to Handle Saving Poem to Database
  var displayResponseFromSaving = function(error, successMsg) {
    if (error)
      alert(error);
    else
      alert(successMsg);
  };

  // Public Function to handle Retrieving Poem 
  var displayReturnedPoem = function(error, successMsg) {
    if (error)
      alert(error);
    else
      poemTextArea.innerHTML = successMsg;
  };
  // Public Function to ready any element to allow for the drop event
  var allowDrop = function(ev) {
      // prevent default handling of the element (allows dropping)
      ev.preventDefault();
  }
  // Public Function to set the data type and value of the dragged element
  var startDrag = function(ev) {
      // Set data type to text, value set to the id of the draggable element
      ev.dataTransfer.setData("Text", ev.target.id);
  }
  // Public Function to Drop text into Poem's Droppable Area.
  var dropToPoem = function(ev) {
      ev.preventDefault();
      // Grab the element's ID from the object that was dragged
      var data = ev.dataTransfer.getData("Text");
      // Append the dragged element into the drop element (append a node as the last child of current node)
      // http://www.w3schools.com/jsref/met_node_appendchild.asp
      ev.target.appendChild(document.getElementById(data));
      // Edit the Poem's Text
      _editPoemTextArea();
  }
  // Public Function to Drop text back into Word Bank.
  var dropToBank = function(ev) {
      ev.preventDefault();
      // Grab the element's ID from the object that was dragged
      var data = ev.dataTransfer.getData("Text");
      // Append the dragged element into the drop element
      ev.target.appendChild(document.getElementById(data));
      // Edit the Poem's Text
      _editPoemTextArea();
  }
  // Private Function: Crawls HTML elements from the Bin and appends them to Text Area
  var _editPoemTextArea = function(){
    // Clear out contents
    poemTextArea.innerHTML = null;
    $('#bin').children().each(function(i, element){
        $("#poemTextArea").append($(element).text().trim() + " ");
    });
  }

  // Submit Poem to Postgres upon Click
  submitPoemButton.onclick = function () {
    var nameOfPoem = document.forms['submitPoemForm']['nameOfPoem'].value;
    var poemText = document.getElementById('poemTextArea').value;
    if (poemText == '')
      alert('Please add text to your poem.');
    else if (nameOfPoem == '')
      alert('Please name your poem.');
    else
      poemViewController.submitPoem(nameOfPoem, poemText);
  };
  // Retrieve Poem from Postgres upon Click
  retrievePoemButton.onclick = function () {
    var selectedPoem_poemName = selectedPoemFromDropDown.options[selectedPoemFromDropDown.selectedIndex].value;
    if (selectedPoem_poemName != '')
      poemViewController.retrievePoem(selectedPoem_poemName);
    else
      alert('Please Select a Poem from the List');
  };

  // Make some functions available
  return{
    displayResponseFromSaving: displayResponseFromSaving,
    displayReturnedPoem: displayReturnedPoem,
    allowDrop: allowDrop,
    startDrag: startDrag,
    dropToPoem: dropToPoem,
    dropToBank: dropToBank,
    fillPoemDropDown: fillPoemDropDown
  };
})();
