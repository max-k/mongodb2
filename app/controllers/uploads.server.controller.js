'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
        fs = require('fs-extra'),
        crypto = require('crypto'),
	errorHandler = require('./errors.server.controller'),
        ObjectId = mongoose.Types.ObjectId;
 
/**
 * Globals
 */
var contentTypes = {};
contentTypes.png = 'image/png';
contentTypes.jpg = 'image/jpeg';
contentTypes.jpeg = 'image/jpeg';
contentTypes.gif = 'image/gif';

/**
 * Write a chunk
 */
exports.create = function(req, res) {
    var db = mongoose.connection.db,
        files = db.collection('fs.files'),
        chunks = db.collection('fs.chunks');

    var getExtension = function(filename) {
        return filename.split('.').pop();
    };

    var file = {
        filename: req.body.flowIdentifier,
        chunkSize: 261120,
        contentType: contentTypes[getExtension(req.body.flowFilename)],
        length: parseInt(req.body.flowTotalSize),
        metadata: {
            filename: req.body.flowFilename,
            totalChunks: req.body.flowTotalChunks
        }
    };

    fs.readFile(req.files.file.path, function(err, data) {
        if (err) return res.status(500).send('Error reading temporary file');
        files.findAndModify(file, {rating: 1}, {$setOnInsert: file}, {new: true, upsert: true}, function(err, doc) {
            if (err) return res.status(500).send(err);
                var chunk = {
                    files_id: doc._id,
                    n: parseInt(req.body.flowChunkNumber)-1,
                    data: data
                };
                chunks.findAndModify(chunk, {rating: 1}, {$setOnInsert: chunk}, {new: true, upsert: true}, function(err, subdoc) {
                    if (err) return res.status(500).send('Error persisting chunk object');
                    fs.remove(req.files.file.path, function(err) {
                    if (err) return res.status(500).send('Error removing temporary file');
                    var testChunkExists = function(files_id) {
                        var chunk = {
                            files_id: files_id,
                        };
                        chunks.count(chunk, function(err, c) {
                            if (err) return res.status(500).send('Error querying chunk count');
                            if (c && c === parseInt(req.body.flowTotalChunks)) {
                                if (! file.md5) {
                                    var hash = crypto.createHash('md5');
                                    chunks.find({files_id: chunk.files_id}).stream()
                                        .on('data', function(doc) {
                                            hash.update(doc.data.value(true));
                                        })
                                        .on('error', function(err) {
                                        return res.status(500).send('Error querying chunks data for md5');
                                        })
                                        .on('end', function() {
                                            var hash_md5 = hash.digest('hex');
                                            var date = new Date();
                                            files.findAndModify(file, {rating: 1}, {$set: {md5: hash_md5, uploadDate: date}}, function(err, ndoc) {
                                                if (err) return res.status(500).send('Error persisting md5');
                                            });
                                        });
                                }
                                return res.status(200).send(files_id);
                            }
                            return res.status(200).send();
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
                                        return res.status(204).send('Chunk not found');
                                }
                                // Ugly hack to always resend last chunk
                                if (req.body.flowChunkNumber === req.body.flowTotalChunks) {
                                        return res.status(204).send('Please resend last chunk');
                                }
                                return res.status(200).send();
                        });
                } else {
                    return res.status(204).send('File not found');
                }
        });
};
