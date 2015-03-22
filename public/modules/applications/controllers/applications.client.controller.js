'use strict';

// Applications controller
angular.module('applications').controller('ApplicationsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Applications', 'Categories',
	function($scope, $stateParams, $location, Authentication, Applications, Categories) {
		$scope.authentication = Authentication;

                // Unneeded but interesting:
                //$scope.orderProp = "-created";

		// Create new Application
		$scope.create = function() {
                        // Recover pictures
                        var flowPics = this.flow.pics.files || [];
                        var pictures = [];
                        if (flowPics.length > 0) {
                                for (var i = 0; i < flowPics.length; i++) {
                                        var oid = flowPics[i].id;
                                        pictures[pictures.length] = oid;
                                }
                        }

                        // Recover logo
                        var logo = null;
                        if( this.flow.logo.files.length > 0) {
                                logo = this.flow.logo.files[0].id;
                        }

                        // Recover categories
                        var selectedCats = this.selectedCategories;
                        var categories = [];
                        if (selectedCats.length > 0) {
                                for (var j = 0; j < selectedCats.length; j++) {
                                        var id = selectedCats[j].id;
                                        var label = this.categories[id].label;
                                        categories[categories.length] = label;
                                }
                        }

			// Create new Application object
			var application = new Applications ({
				name: this.name,
                                logo: logo,
                                categories: categories,
                                pictures: pictures
			});

			// Redirect after save
			application.$save(function(response) {
				$location.path('applications/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Application
		$scope.remove = function(application) {
			if ( application ) { 
				application.$remove();

				for (var i in $scope.applications) {
					if ($scope.applications [i] === application) {
						$scope.applications.splice(i, 1);
					}
				}
			} else {
				$scope.application.$remove(function() {
					$location.path('applications');
				});
			}
		};

		// Update existing Application
		$scope.update = function() {
			var application = $scope.application;

			application.$update(function() {
				$location.path('applications/' + application._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Applications
		$scope.find = function() {
			$scope.applications = Applications.query();
		};

		// Find existing Application
		$scope.findOne = function() {
			$scope.application = Applications.get({ 
				applicationId: $stateParams.applicationId
			});
		};

                // Initialize application creation scope
                $scope.initCreateScope = function() {
                        // Initialize Categories dropdown
                        $scope.categories = Categories.query();
                        $scope.selectedCategories = [];
                        $scope.categoriesSettings = {
                        //        smartButtonMaxItems: 3,
                        //        smartButtonTextConverter: function(itemText, originalItem) {
                        //                return itemText;
                        //        }
                        };
                        $scope.categoriesTexts = {
                                buttonDefaultText: 'Categories'
                        };

                        // Create parent flow object for ng-flow
                        $scope.flow = {};
                };

                // Add gridFS id to an ng-flow file object
                $scope.addFileIdToFlow = function(flow, file, id) {
                        for (var k = 0; k < flow.files.length; k++) {
                                if (flow.files[k].uniqueIdentifier === file.uniqueIdentifier) {
                                        flow.files[k].id = id.replace(/\"/g, '');
                                }
                        }
                };

	}
]);
