'use strict';

// groupBy filter
angular.module('applications').filter('groupBy', ['_',
        function(_) {
                return _.memoize(function(items, field) {
                        return _.groupBy(items, field);
                });
        }
]);
