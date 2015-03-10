'use strict';

// Users service used for communicating with the Users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users/:userId', {
                        userId: '@_id'
                });
	}
]);
