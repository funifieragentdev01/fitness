angular.module('fitness').controller('LandingCtrl', function($scope, $location, $http) {
    $scope.goTo = function(view) { $location.path('/' + (view === 'register' ? 'signup' : view)); };
    $scope.realTestimonials = [];

    var API = CONFIG.API;
    var BASIC_TOKEN = CONFIG.BASIC_TOKEN;

    // Aggregate testimonials with $lookup to get player photo
    var pipeline = [
        { "$match": { "publishOnHome": true } },
        { "$sort": { "created": -1 } },
        { "$limit": 6 },
        { "$lookup": {
            "from": "player",
            "localField": "userId",
            "foreignField": "_id",
            "as": "playerData"
        }},
        { "$unwind": { "path": "$playerData", "preserveNullAndEmptyArrays": true } },
        { "$project": {
            "text": 1,
            "rating": 1,
            "userName": 1,
            "userPhoto": { "$ifNull": ["$playerData.photo_url", "$playerData.image.medium", "$userPhoto"] },
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
});
