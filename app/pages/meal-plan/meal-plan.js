angular.module('fitness').controller('MealPlanCtrl', function($scope, $rootScope, $location, ApiService, AiService) {
    $scope.showMealAdjust = false;
    $scope.mealAdjustFeedback = null;
    $scope.mealForm = { adjustText: '' };
    $scope.nextMeal = null;

    function loadMealPlan() {
        var cached = localStorage.getItem('fitness_mealplan');
        if (cached) { try { $rootScope.mealPlan = JSON.parse(cached); } catch(e) { $rootScope.mealPlan = null; } }
        $scope.showMealAdjust = false;
        $scope.mealAdjustFeedback = null;
        updateNextMeal();
    }

    function updateNextMeal() {
        if (!$rootScope.mealPlan || !$rootScope.mealPlan.meals) { $scope.nextMeal = null; return; }
        var now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes();
        $scope.nextMeal = null;
        for (var i = 0; i < $rootScope.mealPlan.meals.length; i++) {
            var parts = ($rootScope.mealPlan.meals[i].time || '12:00').split(':');
            if (parseInt(parts[0]) * 60 + parseInt(parts[1] || 0) > nowMin) { $scope.nextMeal = $rootScope.mealPlan.meals[i]; break; }
        }
        if (!$scope.nextMeal) $scope.nextMeal = $rootScope.mealPlan.meals[0];
    }

    $scope.isNextMeal = function(meal) { return $scope.nextMeal && meal.time === $scope.nextMeal.time && meal.name === $scope.nextMeal.name; };

    function mealRegKey() { return 'fitness_meals_' + new Date().toISOString().slice(0, 10); }
    $scope.isMealRegistered = function(meal) {
        try { return JSON.parse(localStorage.getItem(mealRegKey()) || '[]').indexOf(meal.time + '_' + meal.name) > -1; } catch(e) { return false; }
    };

    $scope.registerMealPhoto = function(meal) {
        $rootScope._registeringMeal = meal;
        $location.path('/meal');
    };

    $scope.regenerateMealPlan = function() {
        if (!$rootScope.profileData) return;
        $rootScope.loading = true;
        AiService.generateMealPlan($rootScope.profileData).then(function(plan) {
            $rootScope.mealPlan = plan;
            localStorage.setItem('fitness_mealplan', JSON.stringify(plan));
            $rootScope.loading = false;
            updateNextMeal();
        }).catch(function() { $rootScope.loading = false; });
    };

    $scope.toggleMealAdjust = function() { $scope.showMealAdjust = !$scope.showMealAdjust; };

    $scope.adjustMealPlan = function() {
        if (!$scope.mealForm.adjustText || !$rootScope.mealPlan) return;
        $rootScope.loading = true;
        $scope.mealAdjustFeedback = null;
        AiService.adjustMealPlan($rootScope.mealPlan, $scope.mealForm.adjustText, $rootScope.profileData).then(function(result) {
            $scope.mealAdjustFeedback = result.feedback;
            if (result.meals) {
                $rootScope.mealPlan.meals = result.meals;
                if (result.total_calories) $rootScope.mealPlan.total_calories = result.total_calories;
                $rootScope.mealPlan.date = new Date().toLocaleDateString('pt-BR');
                localStorage.setItem('fitness_mealplan', JSON.stringify($rootScope.mealPlan));
            }
            $rootScope.loading = false;
        }).catch(function() {
            $scope.mealAdjustFeedback = 'Não consegui ajustar agora. Tente novamente! 😊';
            $rootScope.loading = false;
        });
    };

    loadMealPlan();
});
