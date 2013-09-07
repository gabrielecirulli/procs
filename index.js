// Modules
var http = require("http");
var express = require("express");
var socket = require("socket.io");
var ejs = require('ejs-locals');

// Local modules
var processes = require("./lib/processes");
var uglify = require("./lib/uglify-middleware");

// App
var app = express();
var server = http.createServer(app);
var io = socket.listen(server);

// Static
app.use(uglify.middleware({
  src:  __dirname + "/assets",
  dest: __dirname + "/public"
}));
app.use(express.static(__dirname + "/public"));

// Render settings
app.engine('ejs', ejs);
app.set('view engine', 'ejs');

app.get("/", function (req, res) {
  res.render("index");
});

var host = process.env.HOST || "localhost";
var port = process.env.PORT || 4000;

server.listen(port, host, function () {
  console.log("Listening on " + host + ":" + port);
});
