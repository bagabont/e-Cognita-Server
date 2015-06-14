var http = require('http'),
    passport = require('passport'),
    express = require('express');

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];
var app = express();

// Load configurations
require('./config/mongoose')(config);
require('./config/passport')(passport);
require('./config/express')(config, app, passport);

var server = http.createServer(app);

module.exports = server;