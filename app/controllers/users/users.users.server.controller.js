'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
        errorHandler = require('../errors.server.controller.js'),
        User = mongoose.model('User');

/**
 * List of Users
 */
exports.list = function(req, res) {
        User.find().sort('-displayName').exec(function(err, users) {
                if (err) {
                        return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                        });
                } else {
                        res.json(users);
                }
        });
};

/**
 * Delete a user
 */
exports.delete = function(req, res) {
        var user = req.user;

        user.remove(function(err) {
                if (err) {
                        return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                        });
                } else {
                        res.json(user);
                }
        });
};

/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {
        User.findById(id).exec(function(err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load user ' + id));
                req.user = user;
                next();
        });
};

