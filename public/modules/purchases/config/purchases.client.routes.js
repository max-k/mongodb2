'use strict';

//Setting up route
angular.module('purchases').config(['$stateProvider',
        function($stateProvider) {
                // Applications state routing
                $stateProvider.
                state('listPurchases', {
                        url: '/purchases',
                        templateUrl: 'modules/purchases/views/list-purchases.client.view.html'
                });
        }
]);
