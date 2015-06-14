var http = require('http'),
    passport = require('passport'),
    express = require('express');

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

var app = express();

// Load configuration
require('./config/mongoose')(config);
require('./config/passport')(passport);
require('./config/express')(config, app, passport);

var server;

if (env === "production") {
  server = http.createServer(app);
}
else {
  server = http.createServer(app);
}

module.exports = server;


