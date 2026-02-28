angular.module('fitness').factory('PlanService', function($rootScope) {
    var service = {
        getPlan: function() {
            if ($rootScope.player && $rootScope.player.extra && $rootScope.player.extra.plan) {
                return $rootScope.player.extra.plan;
            }
            return { type: 'standard', changesUsed: { mealPlan: 0, workoutPlan: 0, goal: 0, lastReset: new Date().toISOString().slice(0,10) } };
        },
        isPremium: function() {
            return service.getPlan().type === 'premium';
        },
        isStandard: function() {
            var type = service.getPlan().type;
            return type === 'standard' || !type;
        },
        canChange: function(changeType) {
            if (service.isPremium()) return true;
            var plan = service.getPlan();
            var changes = plan.changesUsed || {};
            var now = new Date().toISOString().slice(0,7);
            var lastReset = (changes.lastReset || '').slice(0,7);
            if (now !== lastReset) {
                changes.mealPlan = 0;
                changes.workoutPlan = 0;
                changes.goal = 0;
                changes.lastReset = new Date().toISOString().slice(0,10);
            }
            return (changes[changeType] || 0) < 1;
        },
        recordChange: function(changeType) {
            if (service.isPremium()) return;
            var plan = service.getPlan();
            if (!plan.changesUsed) plan.changesUsed = {};
            var now = new Date().toISOString().slice(0,7);
            var lastReset = (plan.changesUsed.lastReset || '').slice(0,7);
            if (now !== lastReset) {
                plan.changesUsed = { mealPlan: 0, workoutPlan: 0, goal: 0, lastReset: new Date().toISOString().slice(0,10) };
            }
            plan.changesUsed[changeType] = (plan.changesUsed[changeType] || 0) + 1;
            if ($rootScope.player && $rootScope.player.extra) {
                $rootScope.player.extra.plan = plan;
            }
        },
        canAccessCoach: function() {
            return service.isPremium();
        },
        canAccessChallenge90: function() {
            return service.isPremium();
        },
        getRemainingChanges: function(changeType) {
            if (service.isPremium()) return 'Ilimitado';
            var plan = service.getPlan();
            var changes = plan.changesUsed || {};
            var now = new Date().toISOString().slice(0,7);
            var lastReset = (changes.lastReset || '').slice(0,7);
            if (now !== lastReset) return 1;
            return Math.max(0, 1 - (changes[changeType] || 0));
        }
    };
    return service;
});
