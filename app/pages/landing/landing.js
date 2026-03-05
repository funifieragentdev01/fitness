angular.module('fitness').controller('LandingCtrl', function($scope, $location, $http) {
    $scope.goTo = function(view) { $location.path('/' + (view === 'register' ? 'signup' : view)); };

    // PWA Install
    $scope.canInstall = !!window.deferredInstallPrompt;
    // Also check if already installed (standalone mode)
    $scope.isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    // Re-check periodically since beforeinstallprompt may fire after controller init
    var installCheck = setInterval(function() {
        var canNow = !!window.deferredInstallPrompt;
        if (canNow !== $scope.canInstall) {
            $scope.canInstall = canNow;
            $scope.$applyAsync();
        }
    }, 1000);
    $scope.$on('$destroy', function() { clearInterval(installCheck); });

    $scope.installApp = function() {
        if (!window.deferredInstallPrompt) { return; }
        window.deferredInstallPrompt.prompt();
        window.deferredInstallPrompt.userChoice.then(function(result) {
            if (result.outcome === 'accepted') {
                $scope.canInstall = false;
                $scope.isInstalled = true;
                $scope.$applyAsync();
            }
            window.deferredInstallPrompt = null;
        });
    };

    $scope.scrollTo = function(className) {
        var el = document.querySelector('.' + className);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
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
