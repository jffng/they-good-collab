// First we need to import the client library
var importio = require("import-io").client;
var mongoose = require('mongoose');
mongoose.connect('mongodb://arntzy:theygoodevents@ds053937.mongolab.com:53937/theygoodevents');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("mongoose connection made");
});

var theygoodSchema = mongoose.Schema({

    venue: String,
    bands: String,
    date: String,
    price: String
});

var TheyGoodEvent = mongoose.model('TheyGoodEvent', theygoodSchema);

// To use an API key for authentication, use the following code:
var io = new importio("09ad11e5-17b2-47b8-9e9e-d9b0124d4552", "AMEeTu4Gf7dzm8UestigiRTdAsd9aDEOLXqbUHdMXYHfR+H++u8CaSX1Twt/L/pSIcpFo9eIQPpdljmd3ctFDQ==", "import.io");

// Once we have started the client and authenticated, we need to connect it to the server:
io.connect(function(connected) {
  // Make sure that your code to use the library only runs after this callback has returned, 
  // as prior to this the library is still connecting and may not yet be ready to issue queries

  // Once the callback is called, we need to check whether the connection request was successful
  if (!connected) {
    console.error("Unable to connect");
    return;
  }

  // Define here a variable that we can put all our results in to when they come back from
  // the server, so we can use the data later on in the script
  var data = [];

  // Record the number of currently running queries to the server
  var runningQueries = 0;

  // In order to receive the data from the queries we issue, we need to define a callback method
  // This method will receive each message that comes back from the queries, and we can take that
  // data and store it for use in our app
  var callback = function(finished, message) {
    // Disconnect messages happen if we disconnect the client library while a query is in progress
    if (message.type == "DISCONNECT") {
      console.error("The query was cancelled as the client was disconnected");
    }
    // Check the message we receive actually has some data in it
    if (message.type == "MESSAGE") {
      if (message.data.hasOwnProperty("errorType")) {
        // In this case, we received a message, but it was an error from the external service
        console.error("Got an error!", message.data);
      } else {
        // We got a message and it was not an error, so we can process the data
        console.log("Got data!", message.data);
        
        data = data.concat(message.data.results);
      }
    }
    if (finished) {
      // When the query is finished, show all the data that we received
      console.log("Done single query");
      runningQueries--;
      // If all queries are done, then log out the data we have
      if (runningQueries <= 0) {
        runningQueries = 0;
        console.log(data.length);
        addToDatabase(data);
        console.log("All queries completed");
      }
    }
  };

  // Issue three queries to the same data source with different inputs
  // You can modify the inputs and connectorGuids so as to query your own sources
  // To find out more, visit the integrate page at http://import.io/data/integrate/#minijs
  
  // Also increment the number of queries we are running
  runningQueries += 1;

  // Query for tile OhMyRockness
  io.query({
    "connectorGuids": [
      "12424ba8-b6db-4c44-bbdf-8de8340239a8"
    ],
    "input": {
      "webpage/url": "http://www.ohmyrockness.com/",
      // "searchterm": "Baby\'s All Right"
    }  
  }, callback);

  var addToDatabase = function(data){

    for (var i = 0; i < data.length; i++) {

      var record = new TheyGoodEvent({
        venue: data[i].venue,
        bands: data[i].bands,
        date: data[i].date,
        price: data[i].ticket_price
      });      

      record.save(function (err, record) {
        if (err) return console.error(err);
      });
    }
  };
});







