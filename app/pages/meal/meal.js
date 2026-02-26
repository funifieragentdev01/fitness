angular.module('fitness').controller('MealCtrl', function($scope, $rootScope, $location, $timeout, ApiService, AiService) {
    $scope.registeringMeal = $rootScope._registeringMeal || null;
    $scope.mealType = $scope.registeringMeal ? $scope.registeringMeal.name : '';
    $scope.mealPhoto = null;
    $scope.mealAnalysis = null;

    $scope.triggerPhotoUpload = function() { document.getElementById('mealPhotoInput').click(); };

    $scope.onMealPhoto = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() { $scope.mealPhoto = e.target.result; });
                $rootScope.loading = true;
                AiService.analyzeMealPhoto(e.target.result, $scope.registeringMeal).then(function(analysis) {
                    $scope.mealAnalysis = analysis;
                    $rootScope.loading = false;
                }).catch(function() {
                    $scope.mealAnalysis = 'Não consegui analisar agora. Registre assim mesmo! 😊';
                    $rootScope.loading = false;
                });
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    $scope.submitMeal = function() {
        var mealName = $scope.mealType || ($scope.registeringMeal ? $scope.registeringMeal.name : 'Refeição');
        ApiService.logAction('register_meal', { meal_type: mealName, photo_url: $scope.mealPhoto ? 'uploaded' : '' });
        if ($scope.mealPhoto) ApiService.logAction('photo_meal', { photo_url: 'uploaded', feedback: $scope.mealAnalysis || '' });
        if ($scope.registeringMeal) {
            var key = 'fitness_meals_' + new Date().toISOString().slice(0, 10);
            var regs = []; try { regs = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
            var id = $scope.registeringMeal.time + '_' + $scope.registeringMeal.name;
            if (regs.indexOf(id) === -1) regs.push(id);
            localStorage.setItem(key, JSON.stringify(regs));
        }
        $rootScope.success = '✅ Refeição registrada! +15 XP';
        $rootScope._registeringMeal = null;
        $timeout(function() { $location.path('/meal-plan'); }, 1500);
    };
});
