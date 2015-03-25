'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
        fs = require('fs'),
        should = require('should'),
	config = require('./config/config'),
	mongoose = require('mongoose'),
        Grid = require('gridfs-stream'),
	chalk = require('chalk');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

// Output a message when db connection is ready
//mongoose.connection.on('connected', function () {
//      console.log('Mongoose default connection open');
//});

// Inject GridFS instance into mongoose connection object
//db.connection.on('open', function() {
//    db.connection.gfs = new Grid(db.connection.db, mongoose.mongo);
//});

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
app.listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);
