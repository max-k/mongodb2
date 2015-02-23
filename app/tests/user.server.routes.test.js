'use strict';

var _ = require('lodash'),
        should = require('should'),
        request = require('supertest'),
        app = require('../../server'),
        mongoose = require('mongoose'),
        User = mongoose.model('User'),
        agent = request.agent(app);

/**
 * Globals
 */
var credentials, user;

/**
 * Application routes tests
 */
describe('User CRUD tests', function() {
        beforeEach(function(done) {
                // Create user credentials
                credentials = {
                        username: 'user',
                        password: 'password'
                };

                // Create a new user
                user = new User({
                        firstName: 'Full',
                        lastName: 'Name',
                        displayName: 'Full Name',
                        email: 'test@test.com',
                        username: credentials.username,
                        password: credentials.password,
                        roles: ['user', 'admin'],
                        provider: 'local',
                });

                // Save an user to the test db
                user.save(function(){
                        done();   
                });

        });

        it('should be able to get a list of users if admin', function(done) {
                agent.post('/auth/signin')
                     .send(credentials)
                     .expect(200)
                     .end(function(signinErr, signinRes) {
                             // Handle signin error
                             if (signinErr) done(signinErr);

                             // Request Users
                             agent.get('/users')
                                     .end(function(userGetErr, userGetRes) {
                                             // Set assertion
                                             userGetRes.body.should.be.an.Array.with.lengthOf(1);

                                             // Call the assertion callback
                                             done();
                                     });
                     });

        });

        it('should not be able to get a list of users if not admin', function(done) {
                // Remove admin role
                user.roles = ['user'];

                agent.post('/auth/signin')
                        .send(credentials)
                        .expect(200)
                        .end(function(signinErr, signinRes) {
                                // Hande signin error
                                if (signinErr) done(signinErr);

                                // Update User
                                agent.put('/users')
                                        .send(user)
                                        .expect(200)
                                        .end(function(updateUserErr, updateUserRes) {
                                                // Handle signin error
                                                if (updateUserErr) done(updateUserErr);

                                                // Request Users
                                                agent.get('/users')
                                                        .end(function(userGetErr, userGetRes) {
                                                                // Set assertion
                                                                userGetRes.body.message.should.match('User is not authorized');

                                                                // Call the assertion callback
                                                                done();
                                                        });
                                        });
                     });

        });

        it('should be able to delete User instance if admin', function(done) {
                agent.post('/auth/signin')
                        .send(credentials)
                        .expect(200)
                        .end(function(signinErr, signinRes) {
                                // Handle signin error
                                if (signinErr) done(signinErr);

                                // Get the userId
                                var userId = user.id;

                                // Delete User
                                agent.delete('/users/' + userId)
                                        .send(user)
                                        .expect(200)
                                        .end(function(userDeleteErr, userDeleteRes) {
                                                // Handle Application save error
                                                if (userDeleteErr) done(userDeleteErr);
                                                // Set assertions
                                                (userDeleteRes.body._id).should.equal(userId);

                                                // Call the assertion callback
                                                done();
                                        });
                        });
        });

        it('should not be able to delete User instance if not admin', function(done) {
                // Remove admin role
                user.roles = ['user'];

                agent.post('/auth/signin')
                        .send(credentials)
                        .expect(200)
                        .end(function(signinErr, signinRes) {
                                // Hande signin error
                                if (signinErr) done(signinErr);

                                // Get the userId
                                var userId = user.id;

                                // Update User
                                agent.put('/users')
                                        .send(user)
                                        .expect(200)
                                        .end(function(updateUserErr, updateUserRes) {
                                                // Handle signin error
                                                if (updateUserErr) done(updateUserErr);

                                                // Delete User
                                                agent.delete('/users/' + userId)
                                                        .end(function(userDelErr, userDelRes) {
                                                                // Set assertion
                                                                userDelRes.body.message.should.match('User is not authorized');

                                                                // Call the assertion callback
                                                                done();
                                                        });
                                        });
                     });

        });

        afterEach(function(done) {
                User.remove().exec();
                done();
        });

});
