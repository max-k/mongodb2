'use strict';

/**
 * Globals
 */
var maxFileSize = null;

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

        if (maxFileSize && parseInt(totalSize) > maxFileSize) {
                return res.status(400).send('File is too big');
        }

        if (totalChunks === 1 && currentChunkSize !== totalSize) {
                return res.status(400).send('Invalid single chunk size');
        }

        if (totalChunks !== 1) {
                if (chunkNumber !== totalChunks && currentChunkSize !== chunkSize) {
                        return res.status(400).send('Invalid first chunk size');
                }
                if (chunkNumber === totalChunks && parseInt(currentChunkSize) > parseInt(chunkSize)) {
                        console.log({
                            chunkSize: chunkSize,
                            currentChunkSize: currentChunkSize,
                            currentChunkSizeSupchunkSize: currentChunkSize>chunkSize
                        });
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
