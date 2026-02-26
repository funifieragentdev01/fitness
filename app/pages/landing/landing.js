angular.module('fitness').controller('LandingCtrl', function($scope, $location) {
    $scope.goTo = function(view) { $location.path('/' + (view === 'register' ? 'signup' : view)); };
});
