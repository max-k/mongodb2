'use strict';

// Categories intersect filter
angular.module('applications').filter('catIntersect', function(){
        return function(actual, expected){
                console.log({actual:actual, expected:expected});
                if (expected === []) return true;
                actual = actual.categories;
                var cats = [];
                for (var k = 0; k < expected.length; k++) {
                        var id = expected[k].id;
                        var label = this.categories[id].label;
                        cats[cats.length] = label;
                }
                return actual.filter(function(n) {
                        return cats.indexOf(n) !== -1;
                });
        };
});
