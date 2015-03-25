'use strict';

module.exports = function(app) {
        var os_versions = require('../../app/controllers/os_versions.server.controller');

        // OS/Versions Routes
        app.route('/os_versions')
                .get(os_versions.list);

        app.route('/os_versions/:os_versionId')
                .get(os_versions.read);

        // Finish by binding the OS/Version middleware
        app.param('os_versionId', os_versions.os_versionByID);

};
