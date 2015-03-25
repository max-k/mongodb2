'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * A Validation function to limit the number of pictures
 */
var validatePicturesNumber = function(pictures) {
        return (pictures.length < 5);
};

/**
 * Application Schema
 */
var ApplicationSchema = new Schema({
	name: {
		type: String,
		required: 'Please fill Application name',
		trim: true
	},
        created: {
                type: Date,
                default: Date.now
        },
	updated: {
		type: Date,
		default: Date.now
	},
        available: {
                type: Boolean,
                default: true
        },
        categories: {
                type: [{
                        type: String,
                        enum: ['productivity', 'games', 'office', 'design']
                }],
                required: 'Please select at least one category',
        },
        price: {
                type: Number,
                default: 0
        },
        logo: {
                type: Schema.ObjectId,
                required: 'Please upload a logo'
        },
        pictures: {
                type: [Schema.ObjectId], 
                default: [],
                validate: [validatePicturesNumber, 'Four pictures max please']
        },
	binaries: {
                type: [Schema.ObjectId],
                ref: 'Binary',
                default: []
        },
        modules: {
                type: [{
                        _id: {
                                type: Schema.ObjectId,
                                ref: 'Application'
                        },
                        name: {
                                type: String
                        },
                        logo: {
                                type: Schema.ObjectId,
                                ref: 'File'
                        }
                }],
                default: []
        },
        main_app: {
                type: [{
                        _id: {
                                type: Schema.ObjectId,
                                ref: 'Application'
                        },
                        name: {
                                type: String
                        },
                        logo: {
                                type: Schema.ObjectId,
                                ref: 'File'
                        }
                }],
                default: []
        },
        users: {
                type: [Schema.ObjectId],
                ref: 'User',
                default: []
        }
});

mongoose.model('Application', ApplicationSchema);
