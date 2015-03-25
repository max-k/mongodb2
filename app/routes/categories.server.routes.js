'use strict';

module.exports = function(app) {
        var categories = require('../../app/controllers/categories.server.controller');

        // Categories Routes
        app.route('/categories')
                .get(categories.list);

        app.route('/categories/:categoryId')
                .get(categories.read);

        // Finish by binding the Category middleware
        app.param('categoryId', categories.categoryByID);

};
