'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var purchases = require('../../app/controllers/purchases.server.controller');

	// Purchases Routes
	app.route('/purchases')
		.get(users.requiresLogin, users.hasAuthorization(['admin']), purchases.list)
		.post(users.requiresLogin, purchases.create);

	app.route('/purchases/:purchaseId')
		.get(users.requiresLogin, users.hasAuthorization(['admin']), purchases.read)
		.put(users.requiresLogin, users.hasAuthorization(['admin']), purchases.update)
		.delete(users.requiresLogin, users.hasAuthorization(['admin']), purchases.delete);

        app.route('/purchases/stats/:days')
                .get(purchases.getStats);

	// Finish by binding the Purchase and Days middlewares
	app.param('purchaseId', purchases.purchaseByID);
        app.param('days', purchases.getDays);
};
