'use strict';

var path = require('path');
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var saveFolder = path.resolve(path.join('../../', 'uploads'));
var temporaryFolder = path.resolve(path.join('../../', 'uploads-tmp'));
var flow = require('flowjs-express')(temporaryFolder);

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var files = require('../../app/controllers/files.server.controller');

	// Pictures Routes
	app.route('/files')
		.get(files.isFlowValid, files.read)
		.post(users.requiresLogin, users.hasAuthorization(['admin']), files.multiParser, files.isFlowValid, files.create);

};
