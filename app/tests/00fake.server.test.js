'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
        mongoose = require('mongoose'),
        Grid = require('gridfs-stream');

/**
 * Globals
 */
var connected = mongoose.Connection.STATES.connected;
var db = mongoose.connection.db;
var mongo = mongoose.mongo;

/**
 * Unit tests
 */
describe('MongoDB Test:', function() {
        beforeEach(function(done) {

                setTimeout(function() {
                        var gfs = new Grid(db, mongo);
                        done();
                }, 500);
        });

        describe('Connection Availability', function() {
                it('should be able to have an active mongoose connection', function(done) {
                        done();
                });
        });
});
