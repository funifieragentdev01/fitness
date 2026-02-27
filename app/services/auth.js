// AuthService — token management, login, register, logout
angular.module('fitness').factory('AuthService', function($http, $rootScope) {
    var API = CONFIG.API;
    var API_KEY = CONFIG.API_KEY;
    var BASIC_TOKEN = CONFIG.BASIC_TOKEN;
    var token = localStorage.getItem('fitness_token') || localStorage.getItem('fitevolve_token') || null;

    // Migrate old keys
    (function migrateKeys() {
        var map = {
            'fitevolve_token': 'fitness_token',
            'fitevolve_user': 'fitness_user',
            'fitevolve_mealplan': 'fitness_mealplan',
            'fitevolve_workoutplan': 'fitness_workoutplan',
            'fitevolve_challenge90': 'fitness_challenge90',
            'fitevolve_measures': 'fitness_measures',
            'fitevolve_body_analysis': 'fitness_body_analysis',
            'fitevolve_analysis_logs': 'fitness_analysis_logs'
        };
        Object.keys(map).forEach(function(oldKey) {
            var val = localStorage.getItem(oldKey);
            if (val && !localStorage.getItem(map[oldKey])) {
                localStorage.setItem(map[oldKey], val);
            }
        });
        // Migrate daily keys
        Object.keys(localStorage).forEach(function(k) {
            if (k.indexOf('fitevolve_') === 0) {
                var newKey = k.replace('fitevolve_', 'fitness_');
                if (!localStorage.getItem(newKey)) {
                    localStorage.setItem(newKey, localStorage.getItem(k));
                }
            }
        });
    })();

    var service = {
        getToken: function() { return token; },
        getUser: function() { return localStorage.getItem('fitness_user'); },
        isLoggedIn: function() { return !!token; },
        authHeader: function() {
            return { headers: { 'Authorization': 'Bearer ' + token } };
        },
        login: function(credentials) {
            return $http.post(API + '/v3/auth/token', {
                apiKey: API_KEY,
                grant_type: 'password',
                username: credentials.username,
                password: credentials.password
            }).then(function(res) {
                token = res.data.access_token;
                localStorage.setItem('fitness_token', token);
                localStorage.setItem('fitness_user', credentials.username);
                return res;
            });
        },
        register: function(reg) {
            return $http.put(API + '/v3/database/signup__c', {
                _id: reg.email || reg.username,
                name: reg.name,
                email: reg.email,
                password: reg.password
            }, { headers: { 'Authorization': BASIC_TOKEN } });
        },
        logout: function() {
            localStorage.removeItem('fitness_token');
            localStorage.removeItem('fitness_user');
            token = null;
            $rootScope.player = {};
            $rootScope.profileData = null;
            $rootScope.mealPlan = null;
            $rootScope.workoutPlan = null;
        },
        loadPlayer: function() {
            var userId = service.getUser();
            if (!token || !userId) return;
            return $http.get(API + '/v3/player/' + userId, service.authHeader()).then(function(res) {
                $rootScope.player = res.data;
                return res.data;
            });
        },
        deleteAccount: function() {
            var userId = service.getUser();
            return $http.delete(API + '/v3/player/' + userId, service.authHeader()).then(function() {
                Object.keys(localStorage).forEach(function(k) {
                    if (k.indexOf('fitness') === 0 || k.indexOf('fitevolve') === 0) localStorage.removeItem(k);
                });
                token = null;
                $rootScope.player = {};
            });
        }
    };
    return service;
});
