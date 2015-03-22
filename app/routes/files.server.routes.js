'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var formidable = require('../../app/controllers/formidable.server.controller');
	var files = require('../../app/controllers/files.server.controller');

        // Files routes
        app.route('/files')
                .post(users.requiresLogin, users.hasAuthorization(['admin']), formidable.multiParser, files.create);

        app.route('/files/:fileId')
                .get(files.read)
                .put(users.requiresLogin, users.hasAuthorization(['admin']), files.update)
                .delete(users.requiresLogin, users.hasAuthorization(['admin']), files.delete);

        // Finish by binding the File middleware
        app.param('fileId', files.fileByID);
};
