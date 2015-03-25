'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Purchase = mongoose.model('Purchase'),
        User = mongoose.model('User'),
        _ = require('lodash');

/**
 * Create a Purchase
 */
exports.create = function(req, res) {
        var purchase = new Purchase(req.body);

        purchase.save(function(err) {
                if (err) {
                        return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                        });
                } else {
                        res.jsonp(purchase);
                }
        });
};

/**
 * Show the current Purchase
 */
exports.read = function(req, res) {
        res.jsonp(req.purchase);
};

/**
 * Update a Purchase
 */
exports.update = function(req, res) {
        var purchase = req.purchase ;

        purchase = _.extend(purchase , req.body);

        purchase.save(function(err) {
                if (err) {
                        console.log(err);
                        return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                        });
                } else {
                        res.jsonp(purchase);
                }
        });
};

/**
 * Delete a Purchase
 */
exports.delete = function(req, res) {
        var purchase = req.purchase ;

        purchase.remove(function(err) {
                if (err) {
                        return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                        });
                } else {
                        res.jsonp(purchase);
                }
        });
};

/**
 * List of Applications
 */
exports.list = function(req, res) {
        Purchase.find().sort('-created').exec(function(err, purchases) {
                if (err) {
                        return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                        });
                } else {
                        res.jsonp(purchases);
                }
        });
};

/**
 * Get the amount of money generated by the three best apps
 * and by all of the apps for the specified number of days
 */
exports.getStats = function(req, res, days) {
        var o = {};
        o.map = function() {
                var key = this.application[0]._id;
                var value = {
                        amount: this.price,
                        name: this.application[0].name,
                        logo: this.application[0].logo
                };
                emit(key, value);
        };
        o.reduce = function(key, values) {
                //return Array.sum(values);
                var result = 0;
                values.forEach(function (value) {
                        result += value.amount;
                });
                return {name:values[0].name, logo:values[0].logo, amount:result};
        };
        var today = new Date();
        var limitDate = new Date(today.getTime()-(86400000*req.days));
        o.query = {date: {'$gt': limitDate}};
        o.out = {replace: 'mapped1'};
        Purchase.mapReduce(o, function (err, model, stats) {
                if(err) {
                        return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                        });
                } else {
                        console.log(stats);
                        var bestApps = {};
                        var totalAmount = 0;
                        model.find({})
                                .sort({'value.amount': -1})
                                .limit(3).exec(function(err, mapResult) {
                                        if(err) {
                                                return res.status(400).send({
                                                        message: errorHandler.getErrorMessage(err)
                                                });
                                        } else {
                                                bestApps = mapResult;
                                                model.aggregate([ { 
                                                        $group: { 
                                                                _id: null, 
                                                                total: { 
                                                                        $sum: '$value.amount'
                                                                }
                                                        }
                                                }], function(err, aggResult) {
                                                        if (err) {
                                                                return res.status(400).send({
                                                                        message: errorHandler.getErrorMessage(err)
                                                                });
                                                        } else {
                                                                totalAmount = aggResult;
                                                                res.jsonp({
                                                                    totalAmount: totalAmount[0].total,
                                                                    bestApps: bestApps
                                                                });
                                                        }
                                                });
                                        }
                                });
                }
        });
};

/**
 * Days middleware
 */
exports.getDays = function(req, res, next, days) {
        req.days = parseInt(days);
        next();
};

/**
 * Purchase middleware
 */
exports.purchaseByID = function(req, res, next, id) {
        Purchase.findById(id).exec(function(err, purchase) {
                if (err) return next(err);
                if (! purchase) return next(new Error('Failed to load Purchase ' + id));
                req.purchase = purchase ;
                next();
        });
};
