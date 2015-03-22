'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var formidable = require('../../app/controllers/formidable.server.controller');
	var flow = require('../../app/controllers/flow.server.controller');
	var uploads = require('../../app/controllers/uploads.server.controller');

	// Uploads Routes
	app.route('/uploads')
		.get(flow.isFlowValid, uploads.read)
		.post(users.requiresLogin, users.hasAuthorization(['admin']), formidable.multiParser, flow.isFlowValid, uploads.create);

};
