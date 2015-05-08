'use strict';

angular.module('angularify.semantic.dropdown', [])
    .controller('DropDownController', ['$scope',
        function ($scope) {
            $scope.items = [];

            this.add_item = function (scope) {
                $scope.items.push(scope);
                return $scope.items;
            };

            this.remove_item = function (scope) {
                var index = $scope.items.indexOf(scope);
                if (index !== -1)
                    $scope.items.splice(index, 1);
            };

            this.update_title = function (value, title) {
                for (var i in $scope.items) {
                    $scope.items[i].title = title;
                    $scope.items[i].value = value;
                }
            };

        }
    ])

.directive('dropdown', function () {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        controller: 'DropDownController',
        scope: {
            title: '@',
            value: '@',
            open: '@',
            model: '=ngModel'
        },
        template: '<div class="{{ dropdown_class }}">' +
                    '<div class="default text">{{ title | amDateFormat: "dddd, MMMM Do YYYY" }}</div>' +
                    '<i class="dropdown icon"></i>' +
                    '<div class="{{ menu_class }}"  ng-transclude>' +
                    '</div>' +
                '</div>',
        link: function (scope, element, attrs, DropDownController) {
            
            scope.dropdown_class = 'ui selection dropdown';
            scope.menu_class = 'menu transition hidden';
            scope.original_title = scope.title;

            if (scope.open === 'true') {
                scope.is_open = true;
                scope.dropdown_class = scope.dropdown_class + ' active visible';
                scope.menu_class = scope.menu_class + ' visible';
            } else {
                scope.is_open = false;
            }
            DropDownController.add_item(scope);

            /*
             * Watch for title changing
             */
            scope.$watch('value', function (val, oldVal) {
                if (val === undefined || val === oldVal || val === scope.original_title)
                    return;

                scope.model = val;
            });

            /*
             * Watch for ng-model changing
             */
            scope.$watch('model', function (val) {
                // update title or reset the original title if its empty
                scope.model = val;
                var title = val || scope.original_title;
                DropDownController.update_title(val, title);
            });

            /*
             * Click handler
             */
            element.bind('click', function () {
                if (scope.is_open === false) {
                    scope.$apply(function () {
                        scope.dropdown_class = 'ui selection dropdown active visible';
                        scope.menu_class = 'menu transition visible';
                    });
                } else {
                    if (scope.title !== scope.original_title)
                        scope.model = scope.value;
                    scope.$apply(function () {
                        scope.dropdown_class = 'ui selection dropdown';
                        scope.menu_class = 'menu transition hidden';
                    });
                }
                scope.is_open =! scope.is_open;
            });
        }
    };
})

.directive('dropdownGroup', function () {
    return {
        restrict: 'AE',
        replace: true,
        transclude: true,
        require: '^dropdown',
        scope: {
            title: '=title'
            ,value: '=value'
        },
        template: '<div class="item" ng-transclude >{{ item_title }}</div>',
        link: function (scope, element, attrs, DropDownController) {

            // Check if title= was set... if not take the contents of the dropdown-group tag
            // title= is for dynamic variables from something like ng-repeat {{variable}}
            if (scope.title === undefined) {
                scope.item_title = element.children()[0].innerHTML;
            } else {
                scope.item_title = scope.title;
            }

            if (scope.value === undefined) {
                scope.item_value = element.children()[0].innerHTML;
            } else {
                scope.item_value = scope.value;
            }

            //
            // Menu item click handler
            //
            element.bind('click', function () {
                DropDownController.update_title(scope.item_value, scope.item_title);
            });
        }
    };
});