'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
        _ = require('lodash'),
        fs = require('fs-extra'),
	errorHandler = require('./errors.server.controller'),
        File = mongoose.model('File'),
        Grid = require('gridfs-stream');
 
/**
 * Globals
 */
var gfs = new Grid(mongoose.connection.db, mongoose.mongo);

/**
 * Create a File
 */
exports.create = function(req, res) {
        var _id = new mongoose.Types.ObjectId();
        var writestream = gfs.createWriteStream({
                _id: _id,
                filename: req.body.filename
        });
        fs.createReadStream(req.files.file.path)
                .on('end', function() {
                        fs.remove(req.files.path);
                        return res.status(200).send();
                })
                .on('error', function(err) {
                        return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                        });
                })
                .pipe(writestream);
};

/**
 * Show the current File
 */
exports.read = function(req, res) {
        var file = req.file;

        res.set('Content-Type', file.contentType);
        gfs.createReadStream({
                filename: file.metadata.filename
        }).pipe(res);
};

/**
 * Update a File
 */
exports.update = function(req, res) {
        var file = req.file;

        file = _.extend(file, req.file);

        file.save(function(err) {
                if (err) {
                        return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                        });
                } else {
                        res.jsonp(file);
                }
        });
};

/**
 * Delete a File
 */
exports.delete = function(req, res) {
        var file = req.file;

        gfs.remove({_id: file._id}, function(err) {
                if (err) {
                        return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                        });
                } else {
                        res.jsonp(file);
                }
        });
};

/**
 * File middleware
 */
exports.fileByID = function(req, res, next, id) { 
        File.findById(id).exec(function(err, file) {
                if (err) return next(err);
                if (! file) return next(new Error('Failed to load File' + id));
                req.file = file;
                next();
        });
};
