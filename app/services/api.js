// ApiService — Funifier HTTP calls
angular.module('fitness').factory('ApiService', function($http, AuthService) {
    var API = CONFIG.API;

    // BSON helpers — preserve MongoDB types (see patterns.md: Database Strict Mode)
    function bsonDate(date) {
        return { $date: (date || new Date()).toISOString() };
    }
    function readDate(field) {
        if (!field) return null;
        if (field.$date) return new Date(field.$date);
        if (typeof field === 'string') return new Date(field);
        if (typeof field === 'number') return new Date(field);
        return null;
    }

    var service = {
        // Expose helpers for controllers
        bsonDate: bsonDate,
        readDate: readDate,

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
            return $http.get(API + '/v3/database/profile__c/' + userId + '?strict=true', AuthService.authHeader());
        },
        saveProfile: function(data) {
            // Ensure created is BSON $date
            if (data.created && !data.created.$date) {
                data.created = bsonDate(new Date(data.created));
            }
            return $http.put(API + '/v3/database/profile__c', data, AuthService.authHeader());
        },
        saveCheckin: function(data) {
            // Ensure created is BSON $date
            if (data.created && !data.created.$date) {
                data.created = bsonDate(new Date(data.created));
            }
            return $http.put(API + '/v3/database/body_checkin__c', data, AuthService.authHeader());
        },
        loadWeightHistory: function(userId) {
            return $http({
                method: 'GET',
                url: API + '/v3/database/body_checkin__c?strict=true&_filter=' + encodeURIComponent(JSON.stringify({ userId: userId })) + '&_sort=-created&_limit=20',
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
            if (data.created && !data.created.$date) {
                data.created = bsonDate(new Date(data.created));
            }
            return $http.put(API + '/v3/database/testimonial__c', data, AuthService.authHeader());
        }
    };
    return service;
});
