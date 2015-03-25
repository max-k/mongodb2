'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var applications = require('../../app/controllers/applications.server.controller');

	// Applications Routes
	app.route('/applications')
		.get(applications.list)
		.post(users.requiresLogin, users.hasAuthorization(['admin']), applications.create);

	app.route('/applications/:applicationId')
		.get(applications.read)
		.put(users.requiresLogin, users.hasAuthorization(['admin']), applications.update)
		.delete(users.requiresLogin, users.hasAuthorization(['admin']), applications.delete);

        app.route('/applications/by_user/:userId')
                .get(users.requiresLogin, applications.listByUser);

        app.route('/applications/:applicationId/:userId')
                .post(users.requiresLogin, applications.addToUser);

	// Finish by binding the Application and User middlewares
	app.param('applicationId', applications.applicationByID);
        app.param('userId', users.userByID);
};
