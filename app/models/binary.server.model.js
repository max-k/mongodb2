'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Binary Schema
 */
var BinarySchema = new Schema({
	version: {
		type: String,
		required: 'Please fill in a Binary version',
		trim: true,
                match: [/[0-9]*\.*[0-9]*\.*[0-9]*/, 'Please fill a valid Binary version']
	},
        os_version: {
                type: {
                        os: {
                                type: String,
                        },
                        version: {
                                type: String
                        }
                },
                enum: [
                        {os: 'android', version: 'any'},
                        {os: 'android', version: '4.2'},
                        {os: 'android', version: '4.4'},
                        {os: 'android', version: '5.0'},
                        {os: 'ios', version: 'any'},
                        {os: 'ios', version: '5'},
                        {os: 'ios', version: '6'},
                        {os: 'ios', version: '7'}
                ],
                required: 'Please fill in a Binary os/version'
        },
        file: {
                type: Schema.Types.ObjectId,
                required: 'Please upload a file'
        }
});

mongoose.model('Binary', BinarySchema);
