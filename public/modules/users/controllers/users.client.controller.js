'use strict';

angular.module('users').controller('UsersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Users2',
        function($scope, $stateParams, $location, Authentication, Users) {
                $scope.authentication = Authentication;

                $scope.remove = function(user) {
                        if (user) {
                                user.$remove();

                                for (var i in $scope.users) {
                                        if ($scope.users[i] === user) {
                                                $scope.users.splice(i, 1);
                                        }
                                }
                        } else {
                                $scope.user.$remove(function() {
                                        $location.path('users');
                                });
                        }
                };

                $scope.find = function() {
                        $scope.users = Users.query();
                };

        }
]);
