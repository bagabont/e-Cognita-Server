var http = require('http'),
    express = require('express');

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];
var app = express();

// Load configurations
require('./config/mongoose')(config);
require('./config/express')(config, app);

// Create server
var server = http.createServer(app);

server.listen(process.env.PORT || 3030, function () {
    console.log('e-Cognita ' + process.env.NODE_ENV + ' server listening on port ' + server.address().port + '...');
});
