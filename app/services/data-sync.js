// DataSyncService — syncs localStorage data to Funifier DB (profile__c)
// Ensures data persists across devices and is available to Coach
angular.module('fitness').factory('DataSyncService', function($http, $rootScope, AuthService, ApiService) {

    // Map: localStorage key → profile__c field name
    var SYNC_MAP = {
        'fitness_body_analysis': 'body_analysis',
        'fitness_measures': 'measures',
        'fitness_ai_goal': 'ai_goal',
        'fitness_mealplan': 'mealplan',
        'fitness_workoutplan': 'workoutplan'
    };

    var service = {
        // Sync ALL mapped localStorage data to profile__c (single write)
        syncAll: function() {
            var userId = AuthService.getUser();
            if (!userId) return;

            ApiService.loadProfile(userId).then(function(res) {
                var profile = res.data || { _id: userId };
                var changed = false;

                angular.forEach(SYNC_MAP, function(dbField, localKey) {
                    var raw = localStorage.getItem(localKey);
                    if (raw !== null) {
                        // Try to parse JSON, fallback to string
                        var val;
                        try { val = JSON.parse(raw); } catch(e) { val = raw; }
                        profile[dbField] = val;
                        changed = true;
                    }
                });

                if (changed) {
                    ApiService.saveProfile(profile).then(function() {
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
            if (!dbField) return;

            var userId = AuthService.getUser();
            if (!userId) return;

            var raw = localStorage.getItem(localKey);
            if (raw === null) return;

            var val;
            try { val = JSON.parse(raw); } catch(e) { val = raw; }

            ApiService.loadProfile(userId).then(function(res) {
                var profile = res.data || { _id: userId };
                profile[dbField] = val;
                return ApiService.saveProfile(profile);
            }).then(function() {
                console.log('[DataSync] Field synced:', dbField);
            }).catch(function(err) {
                console.warn('[DataSync] Field sync failed:', dbField, err);
            });
        },

        // Load from DB → populate localStorage (call on login)
        // DB is ALWAYS source of truth — overwrites localStorage
        // Only syncs UP if DB is missing data AND localStorage has it for the SAME user
        loadFromDB: function() {
            var userId = AuthService.getUser();
            if (!userId) return Promise.resolve();

            return ApiService.loadProfile(userId).then(function(res) {
                var profile = res.data;
                if (!profile) return;

                var needsSync = false;
                angular.forEach(SYNC_MAP, function(dbField, localKey) {
                    if (profile[dbField] !== undefined && profile[dbField] !== null) {
                        // DB has data → ALWAYS overwrite localStorage
                        var val = profile[dbField];
                        localStorage.setItem(localKey, typeof val === 'string' ? val : JSON.stringify(val));
                        console.log('[DataSync] Loaded from DB:', localKey);
                    } else {
                        // DB doesn't have this field
                        var localVal = localStorage.getItem(localKey);
                        if (localVal) {
                            // localStorage has data but DB doesn't → sync up
                            needsSync = true;
                        }
                    }
                });

                // Update $rootScope with loaded data
                try { $rootScope.challenge90 = JSON.parse(localStorage.getItem('fitness_challenge90')); } catch(e) {}
                try { var m = JSON.parse(localStorage.getItem('fitness_measures')); if (m) $rootScope.manualMeasures = m; } catch(e) {}
                $rootScope.latestBodyAnalysis = localStorage.getItem('fitness_body_analysis') || null;
                try { $rootScope.mealPlan = JSON.parse(localStorage.getItem('fitness_mealplan')); } catch(e) {}
                try { $rootScope.workoutPlan = JSON.parse(localStorage.getItem('fitness_workoutplan')); } catch(e) {}

                // Auto-sync localStorage → DB if DB is missing some data
                if (needsSync) {
                    console.log('[DataSync] DB missing some fields, syncing localStorage → DB...');
                    service.syncAll();
                }

                return profile;
            }).catch(function(err) {
                console.warn('[DataSync] Load from DB failed:', err);
            });
        }
    };

    return service;
});
