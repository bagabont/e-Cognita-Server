var http = require('http'),
    express = require('express');

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];
var app = express();

// Load configurations
require('./config/mongoose')(config);
require('./config/express')(config, app);

// Create server
module.exports = http.createServer(app);