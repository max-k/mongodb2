'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
        fs = require('fs'),
	mongoose = require('mongoose'),
        Grid = require('gridfs-stream'),
	User = mongoose.model('User'),
	Binary = mongoose.model('Binary'),
	Application = mongoose.model('Application');

/**
 * Globals
 */
var user, application, fileId;
var gfs = new Grid(mongoose.connection.db, mongoose.mongo);
var filepath = '/home/tsarboni/images/89202-arch2.png';

/**
 * Unit tests
 */
describe('Application Model Unit Tests:', function() {

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
                        // Prepare an Application object
			application = new Application({
				name: 'Application Name',
                                categories: ['games','office'],
                                logo: fileId,
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
			return application.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save with an empty name', function(done) { 
			application.name = '';

			return application.save(function(err) {
				should.exist(err);
				done();
			});
		});

                it('should be able to show an error when try to save without a category', function(done) { 
                        application.categories = [];

                        return application.save(function(err) {
                                should.exist(err);
                                done();
                        });
                });

                it('should be able to show an error when try to save without a logo', function(done) { 
                        application.logo = undefined;

                        return application.save(function(err) {
                                should.exist(err);
                                done();
                        });
                });

                it('should be able to show an error when try to save with more than 4 pictures', function(done) { 
                        application.pictures = [fileId, fileId, fileId, fileId, fileId];

                        return application.save(function(err) {
                                should.exist(err);
                                done();
                        });
                });

	});

	afterEach(function(done) { 
		Application.remove().exec();
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
