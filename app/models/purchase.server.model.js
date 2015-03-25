'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Purchase Schema
 */
var PurchaseSchema = new Schema({
        application: {
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
        date: {
                type: Date,
                default: Date.now
        },
        price: {
                type: Number,
                default: 0
        },
});

mongoose.model('Purchase', PurchaseSchema);
