'use strict';

// Applications controller
angular.module('applications').controller('ApplicationsController', ['$scope', '$stateParams', '$location', '_', 'Authentication', 'Applications', 'Categories', 'OsVersions', 'Users', 'Purchases',
	function($scope, $stateParams, $location, _, Authentication, Applications, Categories, OsVersions, Users, Purchases) {
		$scope.authentication = Authentication;

                // Unneeded but interesting:
                //$scope.orderProp = "-created";

		// Create new Application
		$scope.create = function() {
                        var pictures = [],
                            logo = '',
                            categories = [],
                            main_app = [];

                        // Check for flow.logo to ensure tests pass
                        if (this.flow && this.flow.pics) {
                                // Recover pictures
                                var flowPics = this.flow.pics.files || [];
                                if (flowPics.length > 0) {
                                        for (var i = 0; i < flowPics.length; i++) {
                                                var oid = flowPics[i].id;
                                                pictures[pictures.length] = oid;
                                        }
                                }
                        }

                        // Check for flow.logo to ensure tests pass
                        if (this.flow && this.flow.logo) {
                                // Recover logo
                                if( this.flow.logo.files.length > 0) {
                                        logo = this.flow.logo.files[0].id || null;
                                }
                        }

                        var selectedCats = this.selectedCategories;
                        // Check for selectedCats to ensure tests pass
                        if (selectedCats) {
                                // Recover categories
                                if (selectedCats.length > 0) {
                                        for (var j = 0; j < selectedCats.length; j++) {
                                                var id = selectedCats[j].id;
                                                var label = this.categories[id].label;
                                                categories[categories.length] = label;
                                        }
                                }
                        }

                        var parentModule = this.module.selected;
                        // Check for parentModule to ensure tests pass
                        if (parentModule) {
                                // Recover parent module
                                main_app = [{
                                        _id: parentModule._id,
                                        name: parentModule.name,
                                        logo: parentModule.logo
                                }];
                        }

			// Create new Application object
			var application = new Applications ({
				name: this.name,
                                price: this.price,
                                logo: logo,
                                categories: categories,
                                pictures: pictures,
                                main_app: main_app
			});

			// Redirect after save
			application.$save(function(response) {
                                if (main_app) {
                                        Applications.get({ 
                                                applicationId: main_app._id
                                        })
                                        .$promise.then(function (parentApp) {
                                                var newModule = {
                                                        _id: response._id,
                                                        name: response.name,
                                                        logo: response.logo
                                                };
                                                parentApp.modules[parentApp.modules.length] = newModule;
                                                parentApp.$update(function() {
                                                        $location.path('applications/' + response._id);
                                                }, function(error2) {
                                                        $scope.error = error2.data.message;
                                                });
                                        });
                                }
                                $location.path('applications/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(error) {
				$scope.error = error.data.message;
			});
		};

		// Remove existing Application
		$scope.remove = function(application) {
			if ( application ) { 
                                if (application.modules.length > 0) {
                                        $scope.error = 'please remove modules first';
                                } else {
				        application.$remove();

				        for (var j in $scope.applications) {
					        if ($scope.applications [j] === application) {
						        $scope.applications.splice(j, 1);
					        }
				        }
                                }
			} else {
                                if ($scope.application.modules.length > 0) {
                                        $scope.error = 'please remove modules first';
                                } else {
				        $scope.application.$remove(function() {
					        $location.path('applications');
				        });
                                }
			}
		};

                // Disable or enable Application
                $scope.switchAvailability = function() {
                        var application = $scope.application;
                        if (application.main_app.length > 0) {
                                Applications.get({
                                        applicationId: $stateParams.applicationId
                                })
                                .$promise.then(function (parentApp) {
                                        if (parentApp.available) {
                                                application.available = (!application.available);
                                                application.$update(function() {
                                                        $location.path('applications/' + application._id);
                                                }, function(errorResponse) {
                                                        $scope.error = errorResponse.data.message;
                                                });
                                        }
                                }, function(error) {

                                });
                        } else {
                                application.available = (!application.available);
                                application.$update(function() {
                                        $location.path('applications/' + application._id);
                                }, function(errorResponse) {
                                                $scope.error = errorResponse.data.message;
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
                                buttonDefaultText: '0 checked'
                        };
                        $scope.checkCategories = function(actual, expected){
                                var cats = [];
                                for (var j = 0; j < expected.length; j++) {
                                        var id = expected[j].id;
                                        var label = this.categories[id].label;
                                        cats[cats.length] = label;
                                }
                                var int1 = (_.intersection(actual, cats).length > 0);
                                var int2 = (cats.length === 0);
                                return(int1 || int2);
                        };
		};

		// Find existing Application
		$scope.findOne = function() {
                        var arrayUnique = function(array) {
                                var a = array.concat();
                                for(var i=0; i<a.length; ++i) {
                                        for(var j=i+1; j<a.length; ++j) {
                                                if(a[i] === a[j]) {
                                                        a.splice(j--, 1);
                                                }
                                        }
                                }
                                return a;
                        };
			Applications.get({ 
				applicationId: $stateParams.applicationId
			})
                        .$promise.then(function (application) {
                                $scope.application = application;
                                $scope.mainImageUrl = application.logo;
                                $scope.images = arrayUnique([application.logo].concat(application.pictures));
                                $scope.setPicture = function (picture) {
                                        $scope.mainImageUrl = picture;
                                };
                                var applications = $scope.authentication.user.applications;
                                $scope.ownApp = false;
                                for (var app = 0; app < applications.length; app++) {
                                        if (applications[app].id === application._id) {
                                                $scope.ownApp = true;
                                        }
                                }
                        }, function(error) {
                                $scope.error = error.data.message;
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

                        // Initialize OS/Versions dropdown
                        //$scope.os_versions = OsVersions.query();
                        //$scope.selectedOsVersion = {};
                        //$scope.os_versionsSettings = {};
                        //$scope.os_versionsTexts = {
                        //        buttonDefaultText: 'Os/Version'
                        //};

                        // Initialize module selector
                        $scope.applications = Applications.query();
                        $scope.module = {};
                        $scope.disabled = undefined;
                        $scope.enable = function() {
                                $scope.disabled = false;
                        };
                        $scope.disable = function() {
                                $scope.disabled = true;
                        };
                        $scope.clear = function() {
                                $scope.module.selected = undefined;
                        };

                        // Initialize ng-flow uploader
                        $scope.flow = {};
                        $scope.binaries = [{'id': 0}];
                        $scope.addBinary = function() {
                                var nb = $scope.binaries.length;
                                $scope.binaries.push({'id':nb});
                        };
                        $scope.removeBinary = function(binary) {
                                for (var l = 0; l<$scope.binaries.length; l++) {
                                        if (binary.id === $scope.choices[l].id) {
                                                $scope.binaries.splice(l, 1);
                                                break;
                                        }
                                }
                        };
                        $scope.showAdd = function(binary) {
                              return binary.id === $scope.binaries[$scope.binaries.length-1].id;
                        };
                };

                // Update existing Application
                $scope.addToUser = function() {
                        var user = new Users($scope.authentication.user);
                        var application = $scope.application;
                        var user_id = $scope.authentication.user._id;

                        var myApp = {
                                id: application._id,
                                name: application.name,
                                logo: application.logo,
                                downloaded: new Date(),
                                visible: true
                        };

                        if (user.applications.length === 0) {
                                user.applications = [];
                        }
                        user.applications[user.applications.length] = myApp;

                        user.$update(function(response) {
                        Authentication.user = response;
                                // Create a new Purchase entry
                                var purchase = new Purchases({
                                        application: [{
                                                _id: application._id,
                                                name: application.name,
                                                logo: application.logo
                                        }],
                                        date: new Date(),
                                        price: application.price
                                });
                                purchase.$save(function(response) {
                                        $scope.ownApp = true;
                                        $location.path('applications/' + application._id);
                                }, function(error) {
                                        $scope.error = error.data.message;
                                });
                        }, function(errorResponse) {
                                $scope.error = errorResponse.data.message;
                        });
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
