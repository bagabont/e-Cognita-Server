var path = require('path'),
    fs = require('fs');

var rootPath = path.normalize(__dirname + './');
var mongoUser = process.env.MONGO_USER;
var mongoPass = process.env.MONGO_PASS;
var gcmApiKey = process.env.GCM_API_KEY;

var connectionString = 'mongodb://' + mongoUser + ':' + mongoPass + '@ds061928.mongolab.com:61928/';

module.exports = {
    development: {
        rootPath: rootPath,
        db: connectionString + 'e-cognita',
        gcmApiKey: gcmApiKey
    },
    production: {
        rootPath: rootPath,
        db: connectionString + 'e-cognita',
        gcmApiKey: gcmApiKey
    }
};