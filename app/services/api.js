// ApiService — Funifier HTTP calls
angular.module('fitness').factory('ApiService', function($http, AuthService) {
    var API = CONFIG.API;

    var service = {
        logAction: function(actionId, attributes) {
            var userId = AuthService.getUser();
            return $http.post(API + '/v3/action/log', {
                actionId: actionId,
                userId: userId,
                attributes: attributes || {}
            }, AuthService.authHeader());
        },
        loadAchievements: function(userId) {
            return $http.get(API + '/v3/achievement?userId=' + userId, AuthService.authHeader());
        },
        loadLevels: function() {
            return $http.get(API + '/v3/level', AuthService.authHeader());
        },
        loadChallenges: function() {
            return $http.get(API + '/v3/challenge', AuthService.authHeader());
        },
        loadProfile: function(userId) {
            return $http.get(API + '/v3/database/profile__c/' + userId, AuthService.authHeader());
        },
        saveProfile: function(data) {
            return $http.put(API + '/v3/database/profile__c', data, AuthService.authHeader());
        },
        saveCheckin: function(data) {
            return $http.put(API + '/v3/database/body_checkin__c', data, AuthService.authHeader());
        },
        loadWeightHistory: function(userId) {
            return $http({
                method: 'GET',
                url: API + '/v3/database/body_checkin__c?_filter=' + encodeURIComponent(JSON.stringify({ userId: userId })) + '&_sort=-created&_limit=20',
                headers: { 'Authorization': 'Bearer ' + AuthService.getToken() }
            });
        }
    };
    return service;
});
