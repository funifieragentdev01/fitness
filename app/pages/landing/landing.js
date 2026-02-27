angular.module('fitness').controller('LandingCtrl', function($scope, $location, $http) {
    $scope.goTo = function(view) { $location.path('/' + (view === 'register' ? 'signup' : view)); };
    $scope.realTestimonials = [];
    $scope.faqs = [];
    $scope.faqOpen = {};

    var API = CONFIG.API;
    var BASIC_TOKEN = CONFIG.BASIC_TOKEN;

    // Aggregate testimonials with $lookup on profile__c for player photo
    var pipeline = [
        { "$match": { "publishOnHome": true } },
        { "$sort": { "created": -1 } },
        { "$limit": 6 },
        { "$lookup": {
            "from": "profile__c",
            "localField": "userId",
            "foreignField": "_id",
            "as": "profile"
        }},
        { "$unwind": { "path": "$profile", "preserveNullAndEmptyArrays": true } },
        { "$project": {
            "text": 1,
            "rating": 1,
            "userName": 1,
            "userPhoto": { "$ifNull": ["$profile.photo_url", "$userPhoto"] },
            "firstPhoto": 1,
            "lastPhoto": 1,
            "created": 1
        }}
    ];

    $http.post(API + '/v3/database/testimonial__c/aggregate?strict=true', pipeline, {
        headers: { 'Authorization': BASIC_TOKEN }
    }).then(function(res) {
        if (Array.isArray(res.data)) {
            $scope.realTestimonials = res.data;
        }
    }).catch(function() {});

    // Load FAQ from Funifier
    $http.get(API + '/v3/database/faq__c?sort=order:1&q=active:true', {
        headers: { 'Authorization': BASIC_TOKEN }
    }).then(function(res) {
        if (Array.isArray(res.data)) {
            $scope.faqs = res.data;
        }
    }).catch(function() {});

    $scope.toggleFaq = function(id) {
        $scope.faqOpen[id] = !$scope.faqOpen[id];
    };
});
