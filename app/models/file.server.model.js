'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * A Validation function to check md5sum
 */
var validateFileMD5 = function(md5) {
        return (md5.length === 32);
};

/**
 * Application Schema
 */
var FileSchema = new Schema({
        length: {
                type: Number,
                required: 'Please fill File length'
        },
        chunkSize: {
                type: Number,
                default: 255*1024
        },
        uploadDate: {
                type: Date,
                default: Date.now
        },
        md5: {
                type: String,
                validate: [validateFileMD5, 'Please fill a valid md5sum']
        },
	filename: {
		type: String,
		required: 'Please fill File name',
		trim: true
	},
        contentType: {
                type: String,
                enum: ['', 'image/jpeg', 'image/gif', 'image/png', 'image/tiff', 'image/svg+xml'],
                default: ''
        },
        metadata: {
                type: Schema.Types.Mixed,
                default: {}
        }
});

mongoose.model('File', FileSchema, 'fs.files');
