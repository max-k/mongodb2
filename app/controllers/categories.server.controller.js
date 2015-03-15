'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Application = mongoose.model('Application'),
        _ = require('lodash');

/**
 * List of Categories
 */
exports.list = function(req, res) { 
        var categories = Application.schema.path('categories').caster.enumValues;
        var _cats = [];
        for (var i = 0; i<categories.length; i++) {
            _cats[i] = {'id':i, 'label':categories[i], 'assignable': true};
        }
        res.jsonp(_cats);
};

