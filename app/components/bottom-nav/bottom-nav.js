angular.module('fitness').directive('bottomNav', function($location) {
    return {
        restrict: 'E',
        scope: { active: '=' },
        templateUrl: 'components/bottom-nav/bottom-nav.html',
        link: function(scope) {
            scope.go = function(path) { $location.path(path); };
        }
    };
});
