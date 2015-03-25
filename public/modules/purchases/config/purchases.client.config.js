'use strict';

// Configuring the Purchases module
angular.module('purchases').run(['Menus',
        function(Menus) {
                // Set top bar menu items
                Menus.addMenuItem('topbar', 'Purchases', 'purchases', 'dropdown', '/purchases', null, [ 'admin' ]);
                Menus.addSubMenuItem('topbar', 'purchases', 'List Purchases', 'purchases');
        }
]);
