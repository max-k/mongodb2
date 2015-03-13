'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
        fs = require('fs'),
        mongoose = require('mongoose'),
        Grid = require('gridfs-stream'),
        User = mongoose.model('User'),
        Binary = mongoose.model('Binary');

/**
 * Globals
 */
var user, binary, fileId;
var gfs = new Grid(mongoose.connection.db, mongoose.mongo);
var filepath = '/home/tsarboni/images/89202-arch2.png';

/**
 * Unit tests
 */
describe('Binary Model Unit Tests:', function() {

        beforeEach(function(done) {

                user = new User({
                        firstName: 'Full',
                        lastName: 'Name',
                        displayName: 'Full Name',
                        email: 'test@test.com',
                        username: 'username',
                        password: 'password'
                });

                fileId = new mongoose.Types.ObjectId();

                user.save(function() {
                        // Prepare a Binary object
                        binary = new Binary({
                                version: '0.1',
                                os_version: {os: 'android', version: '5.0'},
                                file: fileId
                        });

                        // Manage GridFS file upload
                        var writeStream = gfs.createWriteStream({
                                _id: fileId,
                                filename: fileId.toString()
                        });
                        fs.createReadStream(filepath).pipe(writeStream);
                        writeStream.on('close', function (file) {
                                should.exist(file);
                                done();
                        });
                });
        });

        describe('Method Save', function() {
                it('should be able to save without problems', function(done) {
                        return binary.save(function(err) {
                                console.log(err);
                                should.not.exist(err);
                                done();
                        });
                });

                it('should be able to show an error when try to save with an empty version', function(done) {
                        binary.version = '';

                        return binary.save(function(err) {
                                should.exist(err);
                                done();
                        });
                });

                it('should be able to show an error when try to save without os/version', function(done) {
                        binary.os_version = undefined;

                        return binary.save(function(err) {
                                should.exist(err);
                                done();
                        });
                });

                it('should be able to show an error when try to save without file', function(done) {
                        binary.file = undefined;

                        return binary.save(function(err) {
                                should.exist(err);
                                done();
                        });
                });
        });

        afterEach(function(done) {
                Binary.remove().exec();
                User.remove().exec();

                gfs.remove({ _id: fileId }, function (err) {
                        should.not.exist(err);
                        gfs.exist({ _id: fileId }, function(err, result) {
                                should.not.exist(err);
                                should.notEqual(result, true);
                                done();
                        });
                });
        });
});
