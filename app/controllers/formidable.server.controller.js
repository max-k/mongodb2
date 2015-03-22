'use strict';

/**
 * Module dependencies.
 */
var formidable = require('formidable');

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
