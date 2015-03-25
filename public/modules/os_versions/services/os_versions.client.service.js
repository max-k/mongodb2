'use strict';

//OS/Versions service used to communicate OS/Versions REST endpoints
angular.module('os_versions').factory('OsVersions', ['$resource',
        function($resource) {
                return $resource('os_versions/:os_versionId', {
                        categoryId: '@_id'
                });
        }
]);
