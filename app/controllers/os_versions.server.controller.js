'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Binary = mongoose.model('Binary');

/**
 * Show the current OS/Version
 */
exports.read = function(req, res) {
            res.jsonp(req.os_version);
};

/**
 * List of OS/Versions
 */
exports.list = function(req, res) { 
        console.log(Binary.schema.path('os_version'));
        var elements = Binary.schema.path('os_version').caster.enumValues;
        var os_versions = [];
        for (var id = 0; id < elements.length; id++) {
                os_versions[id] = {
                        id: id,
                        os: elements[id].os,
                        version: elements[id].version,
                        assignable: true
                };
        }
        res.jsonp(os_versions);
};

/**
 * OS/Version middleware
 */
exports.os_versionByID = function(req, res, next, id) {
        var elements = Binary.schema.path('os_version').caster.enumValues;
        var _id = parseInt(id);
        if (_id > elements.length-1)
            return next(new Error('Failed to load OS/Version ' + _id));
        var os_version = {
                id: _id,
                os: elements[_id].os,
                version: elements[_id].version,
                assignable: true};
        req.os_version = os_version;
        next();
};
