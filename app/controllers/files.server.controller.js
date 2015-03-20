'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
        fs = require('fs'),
        formidable = require('formidable'),
	errorHandler = require('./errors.server.controller'),
	Application = mongoose.model('Application'),
        maxFileSize = null,
        ObjectId = mongoose.Types.ObjectId;
 
/**
 * Write a chunk
 */
exports.create = function(req, res) {
        var db = mongoose.connection.db,
                files = db.collection('fs.files'),
                chunks = db.collection('fs.chunks');

        var file = {
                length: req.body.flowTotalSize,
                filename: req.body.flowIdentifier,
                metadata: {
                        filename: req.body.flowFilename,
                        totalChunks: req.body.flowTotalChunks
                }
        };

        fs.readFile(req.files.file.path, function(err, data) {
                if (err) return res.status(500).send('Error reading temporary file');
                files.findAndModify(file, {rating:1}, {$setOnInsert: file}, {new:true, upsert:true}, function(err, doc) {
                        if (err) return res.status(500).send(err);
                        var chunk = {
                                files_id: doc._id,
                                n: parseInt(req.body.flowChunkNumber)-1,
                                data: data
                        };
                        chunks.insert(chunk, function(err, result) {
                                if (err) return res.status(500).send('Error persisting chunk object');
                                fs.remove(req.files.file.path, function(err) {
                                        if (err) return res.status(500).send('Error removing temporary file');
                                        var currentTestChunk = 0;
                                        var testChunkExists = function(file_id) {
                                                var chunk = {
                                                        file_id: file_id,
                                                        n: currentTestChunk
                                                };
                                                chunks.findOne(chunk, function(err, doc) {
                                                        if (err) return res.status(500).send('Error querying chunk collection');
                                                        if (! doc) return res.status(200).send();
                                                        currentTestChunk++;
                                                        if(currentTestChunk === req.body.flowTotalChunks) {
                                                                console.log('Upload Done');
                                                                return res.status(200).send();
                                                        }
                                                        testChunkExists(file_id);
                                                });
                                        };
                                        testChunkExists(doc._id);
                                });
                        });
                });
        });
};

/**
 * Check if a chunk exists
 */
exports.read = function(req, res) {
        var db = mongoose.connection.db,
                files = db.collection('fs.files'),
                chunks = db.collection('fs.chunks');

        var file = {
                length: req.body.flowTotalSize,
                filename: req.body.flowIdentifier,
                metadata: {
                        filename: req.body.flowFilename,
                        totalChunks: req.body.flowTotalChunks
                }
        };

        files.findOne(file, function(err, doc) {
                if (err) return res.status(500).send('Error querying files collection');
                if (doc) {
                        var chunk = {
                                files_id: doc._id,
                                n: parseInt(req.body.flowChunkNumber)-1
                        };
                        chunks.findOne(chunk, function(err, subdoc) {
                                if (err) return res.status(500).send('Error querying chunks collection');
                                if (! subdoc) {
                                        return res.status(400).send();
                                }
                                return res.status(200).send();
                        });
                } else {
                    return res.status(400).send('File not found');
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
 * Multipart parser middleware
 */
exports.multiParser = function(req, res, next) { 
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
                if (err) return next(err);
                req.body = fields;
                req.files = files;
                next();
        });
};

/**
 * Flow validation middleware
 */
exports.isFlowValid = function(req, res, next) {
        var fileSize;

        var cleanIdentifier = function (identifier) {
                return identifier.replace(/[^0-9A-Za-z_-]/g, '');
        };

        if (req.method.toLowerCase() === 'get') {
                req.body.flowChunkNumber = req.param('flowChunkNumber', 0);
                req.body.flowChunkSize = req.param('flowChunkSize', 0);
                req.body.flowCurrentChunkSize = req.param('flowCurrentChunkSize', 0);
                req.body.flowTotalSize = req.param('flowTotalSize', 0);
                req.body.flowIdentifier = req.param('flowIdentifier', '');
                req.body.flowFilename = req.param('flowFilename', '');
                req.body.flowTotalChunks = req.param('flowTotalChunks', 0);
        }

        if (req.method.toLowerCase() === 'post') {
                if (!req.files.file || !req.files.file.size) {
                        return res.status(500).send('No file in request');
                }
                fileSize = req.files.file.size.toString();
        }

        var chunkNumber = req.body.flowChunkNumber;
        var chunkSize = req.body.flowChunkSize;
        var currentChunkSize = req.body.flowCurrentChunkSize;
        var totalSize = req.body.flowTotalSize;
        var identifier = cleanIdentifier(req.body.flowIdentifier);
        var filename = req.body.flowFilename;
        var totalChunks = req.body.flowTotalChunks;

        var numberOfChunks = Math.ceil(totalSize / chunkSize).toString();

        if (chunkNumber === 0 || chunkSize === 0 || currentChunkSize === 0 || totalSize === 0 || identifier.length === 0 || filename.length === 0 || totalChunks === 0) {
                return res.status(400).send('Invalid request');
        }

        if (totalChunks !== numberOfChunks) {
                return res.status(400).send('Invalid number of chunks');
        }

        if (chunkNumber > numberOfChunks) {
                return res.status(400).send('Invalid chunk number');
        }

        if (maxFileSize && totalSize > maxFileSize) {
                return res.status(400).send('File is too big');
        }

        if (totalChunks === 1 && currentChunkSize !== totalSize) {
                return res.status(400).send('Invalid single chunk size');
        }

        if (totalChunks !== 1) {
                if (chunkNumber !== totalChunks && currentChunkSize !== chunkSize) {
                        return res.status(400).send('Invalid first chunk size');
                }
                if (chunkNumber === totalChunks && currentChunkSize > chunkSize) {
                        return res.status(400).send('Invalid last chunk size');
                }
        }

        if (typeof(fileSize) !== 'undefined') {
                if (fileSize !== currentChunkSize) {
                        return res.status(400).send('Invalid chunk data size');
                }
        }

        // Inject new or corrected fields in request object
        req.body.flowIdentifier = identifier;

	next();
};


