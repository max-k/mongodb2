'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Application = mongoose.model('Application');

/**
 * Show the current Category
 */
exports.read = function(req, res) {
            res.jsonp(req.category);
};

/**
 * List of Categories
 */
exports.list = function(req, res) { 
        var labels = Application.schema.path('categories').caster.enumValues;
        var categories = [];
        for (var id = 0; id < labels.length; id++) {
            categories[id] = {id: id, label: labels[id], assignable: true};
        }
        res.jsonp(categories);
};

/**
 * Category middleware
 */
exports.categoryByID = function(req, res, next, id) {
        var labels = Application.schema.path('categories').caster.enumValues;
        var _id = parseInt(id);
        if (_id > labels.length-1) return next(new Error('Failed to load Category ' + _id));
        var category = {id: _id, label: labels[_id], assignable: true};
        req.category = category ;
        next();
};
