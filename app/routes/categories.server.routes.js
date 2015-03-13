'use strict';

module.exports = function(app) {
        var categories = require('../../app/controllers/categories.server.controller');

        // Applications Routes
        app.route('/categories')
                .get(categories.list);

};
