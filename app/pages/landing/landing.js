angular.module('fitness').controller('LandingCtrl', function($scope, $location, $http) {
    $scope.goTo = function(view) { $location.path('/' + (view === 'register' ? 'signup' : view)); };
    $scope.realTestimonials = [];

    // Load published testimonials
    var API = CONFIG.API;
    var BASIC_TOKEN = CONFIG.BASIC_TOKEN;
    $http.get(API + '/v3/database/testimonial__c?_sort=-created&_limit=6&publishOnHome=true&strict=true', {
        headers: { 'Authorization': BASIC_TOKEN }
    }).then(function(res) {
        if (Array.isArray(res.data)) {
            $scope.realTestimonials = res.data;
        }
    }).catch(function() {});
});
