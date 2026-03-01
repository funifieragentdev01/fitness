angular.module('fitness').controller('DashboardCtrl', function($scope, $rootScope, $location, AuthService, ApiService, PlanService, PaymentService) {
    $scope.isPremium = PlanService.isPremium();
    var userId = AuthService.getUser();
    if (!AuthService.isLoggedIn()) { $location.path('/login'); return; }

    // Check if returning from payment
    PaymentService.checkPaymentReturn();

    // Always reload player data to ensure fresh plan info
    AuthService.loadPlayer().then(function() {
        $scope.isPremium = PlanService.isPremium();
    });

    $scope.nextMeal = null;
    $scope.nextActions = [];
    $scope.activeChallenges = [];
    $scope.waterMl = 0;
    $scope.streak = { days: 0 };

    function waterMlKey() { return 'fitness_waterml_' + new Date().toISOString().slice(0, 10); }

    function loadDashboard() {
        $scope.waterMl = parseInt(localStorage.getItem(waterMlKey()) || '0');
        updateNextMeal();

        // Load profile
        if (!$rootScope.profileData) {
            ApiService.loadProfile(userId).then(function(res) {
                if (res.data && res.data._id) $rootScope.profileData = res.data;
            });
        }

        // Load achievements
        ApiService.loadAchievements(userId).then(function(res) {
            $rootScope.playerPoints = { xp: 0, energy: 0 };
            res.data.forEach(function(a) {
                if (a.item === 'xp' && a.type === 0) $rootScope.playerPoints.xp += Math.floor(a.total || 0);
                if (a.item === 'energy' && a.type === 0) $rootScope.playerPoints.energy += Math.floor(a.total || 0);
            });
            $rootScope.updateLevelProgress();
        });

        // Load levels
        ApiService.loadLevels().then(function(res) {
            $rootScope.levels = res.data.sort(function(a, b) { return a.position - b.position; });
            $rootScope.updateLevelProgress();
        });

        // Load challenges
        ApiService.loadChallenges().then(function(res) {
            $scope.activeChallenges = res.data.slice(0, 5);
        });

        updateNextActions();
    }

    function updateNextMeal() {
        var cached = localStorage.getItem('fitness_mealplan');
        if (!cached) { $scope.nextMeal = null; return; }
        try {
            var plan = JSON.parse(cached);
            if (!plan.meals || !plan.meals.length) { $scope.nextMeal = null; return; }
            var now = new Date();
            var nowMinutes = now.getHours() * 60 + now.getMinutes();
            var next = null;
            for (var i = 0; i < plan.meals.length; i++) {
                var parts = (plan.meals[i].time || '12:00').split(':');
                var mealMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
                if (mealMinutes > nowMinutes) { next = plan.meals[i]; break; }
            }
            $scope.nextMeal = next || plan.meals[0];
        } catch(e) { $scope.nextMeal = null; }
    }

    function updateNextActions() {
        $scope.nextActions = [];
        if ($scope.nextMeal) {
            $scope.nextActions.push({
                icon: '🍽️',
                title: $scope.nextMeal.time + ' — ' + $scope.nextMeal.name,
                desc: $scope.nextMeal.description || ($scope.nextMeal.foods ? $scope.nextMeal.foods.map(function(f){return f.food;}).join(', ') : ''),
                onClick: function() { $location.path('/meal-plan'); }
            });
        }
        var waterGoalMl = ($rootScope.profileData && $rootScope.profileData.weight) ? Math.round($rootScope.profileData.weight * 35) : 2800;
        var waterPct = $scope.waterMl / waterGoalMl * 100;
        if (waterPct < 100) {
            $scope.nextActions.push({
                icon: '💧', title: 'Beber água',
                desc: ($scope.waterMl || 0) + 'ml / ' + waterGoalMl + 'ml',
                onClick: function() { $location.path('/water'); }
            });
        }
        var cachedWorkout = localStorage.getItem('fitness_workoutplan');
        if (cachedWorkout) {
            try {
                var wp = JSON.parse(cachedWorkout);
                if (wp.days) {
                    var todayNames = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
                    var todayName = todayNames[new Date().getDay()];
                    var today = null;
                    wp.days.forEach(function(d) { if (d.day_name && d.day_name.indexOf(todayName) === 0) today = d; });
                    if (today && today.muscle_group && !today.done) {
                        $scope.nextActions.push({
                            icon: '💪', title: 'Treino de hoje: ' + today.muscle_group,
                            desc: (today.exercises ? today.exercises.length : 0) + ' exercícios' + (today.duration_minutes ? ' • ~' + today.duration_minutes + 'min' : ''),
                            onClick: function() { $location.path('/workout-plan'); }
                        });
                    }
                }
            } catch(e) {}
        }
    }

    $scope.goTo = function(path) { $location.path('/' + path); };

    loadDashboard();
});
