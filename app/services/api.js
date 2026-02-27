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
        },
        uploadImage: function(base64Data, filename) {
            var userId = AuthService.getUser();
            var byteString = atob(base64Data.split(',')[1]);
            var mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
            var blob = new Blob([ab], { type: mimeString });

            var formData = new FormData();
            formData.append('file', blob, filename || 'photo.jpg');
            formData.append('extra', JSON.stringify({ session: 'images', playerId: userId }));

            return $http.post(API + '/v3/upload/image', formData, {
                headers: { 'Authorization': 'Bearer ' + AuthService.getToken(), 'Content-Type': undefined },
                transformRequest: angular.identity
            });
        },
        saveTestimonial: function(data) {
            return $http.put(API + '/v3/database/testimonial__c', data, AuthService.authHeader());
        }
    };
    return service;
});
