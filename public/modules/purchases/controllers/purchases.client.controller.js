'use strict';

// Purchases controller
angular.module('purchases').controller('PurchasesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Purchases',
	function($scope, $http, $stateParams, $location, Authentication, Purchases) {
		$scope.authentication = Authentication;

                // Map reduce Purchase to get stats
                $scope.getStats = function(days) {
                        $scope.stats = {};
                        $scope.radioModel = days;
                        if ((!$scope.days) || ($scope.days !== days)) {
                                // Recover data from REST API
                                $http.get('/purchases/stats/' + days)
                                        .success(function(data, status, headers, config) {
                                                $scope.stats = data;
                                                $scope.days = days;
                                        })
                                        .error(function(data, status, headers, config) {
                                                $scope.error = data.message;
                                        });
                        }
                };

		// Create new Purchase
		$scope.create = function() {
			// Create new Purchase object
			var purchase = new Purchases ({
				name: this.name
			});

			// Redirect after save
			purchase.$save(function(response) {
				$location.path('purchases/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Purchase
		$scope.remove = function(purchase) {
			if ( purchase ) { 
				purchase.$remove();

				for (var i in $scope.purchases) {
					if ($scope.purchases [i] === purchase) {
						$scope.purchases.splice(i, 1);
					}
				}
			} else {
				$scope.purchase.$remove(function() {
					$location.path('purchases');
				});
			}
		};

		// Find a list of Purchases
		$scope.find = function() {
			$scope.purchases = Purchases.query();
		};

	}
]);
