'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Application = mongoose.model('Application'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create an Application
 */
exports.create = function(req, res) {
	var application = new Application(req.body);

	application.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(application);
		}
	});
};

/**
 * Show the current Application
 */
exports.read = function(req, res) {
	res.jsonp(req.application);
};

/**
 * Update an Application
 */
exports.update = function(req, res) {
	var application = req.application ;

	application = _.extend(application , req.body);

	application.save(function(err) {
		if (err) {
                        console.log(err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(application);
		}
	});
};

/**
 * Delete an Application
 */
exports.delete = function(req, res) {
	var application = req.application ;

	application.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(application);
		}
	});
};

/**
 * List of Applications
 */
exports.list = function(req, res) { 
	Application.find().sort('-created').exec(function(err, applications) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(applications);
		}
	});
};

exports.listByUser = function(req, res) {
        var user = req.user;
        var applications = user.applications;
        res.jsonp(applications);
};

exports.addToUser = function(req, res) {
        var user = req.user;
        var application = req.application;
        var applications = user.applications;
        console.log(application);
        console.log(user);
        var myApp = {
            id: application._id,
            name: application.name,
            logo: application.logo,
            downloaded: new Date(),
            visible: true
        };
        user.applications[user.applications.length] = myApp;
        application.users[application.users.length] = user._id;

        user.save(function(err) {
                if (err) {
                        return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                        });
                } else {
                        application.save(function(err) {
                                if (err) {
                                        return res.status(400).send({
                                                message: errorHandler.getErrorMessage(err)
                                        });
                                }
                                res.jsonp(user);
                        });
                }
        });

};

/**
 * Application middleware
 */
exports.applicationByID = function(req, res, next, id) { 
	Application.findById(id).exec(function(err, application) {
		if (err) return next(err);
		if (! application) return next(new Error('Failed to load Application ' + id));
		req.application = application ;
		next();
	});
};
