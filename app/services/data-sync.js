// DataSyncService — syncs localStorage data to Funifier DB (profile__c)
// Ensures data persists across devices and is available to Coach
angular.module('fitness').factory('DataSyncService', function($http, $q, $rootScope, AuthService, ApiService) {

    // Map: localStorage key → profile__c field name
    var SYNC_MAP = {
        'fitness_body_analysis': 'body_analysis',
        'fitness_measures': 'measures',
        'fitness_ai_goal': 'ai_goal',
        'fitness_mealplan': 'mealplan',
        'fitness_workoutplan': 'workoutplan',
        'fitness_challenge90': 'challenge90',
        'fitness_notif_prefs': 'notif_prefs'
    };

    var service = {
        // Sync ALL mapped localStorage data to profile__c (single write)
        syncAll: function() {
            var userId = AuthService.getUser();
            if (!userId) return $q.resolve();

            return ApiService.loadProfile(userId).then(function(res) {
                var profile = res.data || { _id: userId };
                var changed = false;

                angular.forEach(SYNC_MAP, function(dbField, localKey) {
                    var raw = localStorage.getItem(localKey);
                    if (raw !== null) {
                        var val;
                        try { val = JSON.parse(raw); } catch(e) { val = raw; }
                        profile[dbField] = val;
                        changed = true;
                    }
                });

                if (changed) {
                    return ApiService.saveProfile(profile).then(function() {
                        console.log('[DataSync] Profile synced to DB');
                    }).catch(function(err) {
                        console.warn('[DataSync] Sync failed:', err);
                    });
                }
            }).catch(function(err) {
                console.warn('[DataSync] Load profile failed:', err);
            });
        },

        // Sync a single field to DB (for incremental updates)
        syncField: function(localKey) {
            var dbField = SYNC_MAP[localKey];
            if (!dbField) return $q.resolve();

            var userId = AuthService.getUser();
            if (!userId) return $q.resolve();

            var raw = localStorage.getItem(localKey);
            if (raw === null) return $q.resolve();

            var val;
            try { val = JSON.parse(raw); } catch(e) { val = raw; }

            return ApiService.loadProfile(userId).then(function(res) {
                var profile = res.data || { _id: userId };
                profile[dbField] = val;
                return ApiService.saveProfile(profile);
            }).then(function() {
                console.log('[DataSync] Field synced:', dbField);
            }).catch(function(err) {
                console.warn('[DataSync] Field sync failed:', dbField, err);
            });
        },

        // Load from DB → populate localStorage + $rootScope (call on login)
        // DB is ALWAYS the source of truth
        loadFromDB: function() {
            var userId = AuthService.getUser();
            if (!userId) return $q.resolve();

            return ApiService.loadProfile(userId).then(function(res) {
                var profile = res.data;
                if (!profile) {
                    console.log('[DataSync] No profile__c found for', userId);
                    return null;
                }

                console.log('[DataSync] Loading from DB for', userId);
                angular.forEach(SYNC_MAP, function(dbField, localKey) {
                    if (profile[dbField] !== undefined && profile[dbField] !== null) {
                        // DB has data → populate localStorage
                        var val = profile[dbField];
                        localStorage.setItem(localKey, typeof val === 'string' ? val : JSON.stringify(val));
                        console.log('[DataSync] Loaded from DB:', localKey);
                    } else {
                        // DB has NO data → clear localStorage to prevent stale data from another user
                        localStorage.removeItem(localKey);
                        console.log('[DataSync] Cleared (not in DB):', localKey);
                    }
                });

                // Update $rootScope with loaded data
                service.refreshRootScope();

                return profile;
            }).catch(function(err) {
                console.warn('[DataSync] Load from DB failed:', err);
                return null;
            });
        },

        // Refresh $rootScope variables from localStorage (after DB load)
        refreshRootScope: function() {
            try {
                var c90 = localStorage.getItem('fitness_challenge90');
                $rootScope.challenge90 = c90 ? JSON.parse(c90) : null;
            } catch(e) { $rootScope.challenge90 = null; }

            try {
                var m = localStorage.getItem('fitness_measures');
                $rootScope.manualMeasures = m ? JSON.parse(m) : {};
            } catch(e) { $rootScope.manualMeasures = {}; }

            $rootScope.latestBodyAnalysis = localStorage.getItem('fitness_body_analysis') || null;

            console.log('[DataSync] $rootScope refreshed — challenge90:', !!$rootScope.challenge90,
                'measures:', Object.keys($rootScope.manualMeasures || {}).length,
                'bodyAnalysis:', !!$rootScope.latestBodyAnalysis);
        },

        // Check if user has completed onboarding (using DB data)
        hasCompletedOnboarding: function() {
            return !!(localStorage.getItem('fitness_mealplan') && localStorage.getItem('fitness_workoutplan'));
        }
    };

    return service;
});
