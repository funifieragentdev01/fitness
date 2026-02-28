angular.module('fitness').controller('MealCtrl', function($scope, $rootScope, $location, $timeout, ApiService, AiService, AuthService, FeedbackService) {
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

            // Persist to checkin__c
            var userId = AuthService.getUser();
            var dateStr = new Date().toISOString().slice(0, 10);
            var docId = userId + '_meal_' + dateStr;
            var now = new Date().toISOString();
            var entry = { id: id, time: $scope.registeringMeal.time, name: $scope.registeringMeal.name, photo: !!$scope.mealPhoto, ts: now };
            var totalMeals = ($rootScope.mealPlan && $rootScope.mealPlan.meals) ? $rootScope.mealPlan.meals.length : 6;

            ApiService.loadCheckin('meal').then(function(doc) {
                if (!doc) {
                    doc = {
                        _id: docId,
                        userId: userId,
                        type: 'meal',
                        date: ApiService.bsonDate(new Date(dateStr + 'T03:00:00.000Z')),
                        entries: [],
                        completed: false,
                        total: totalMeals,
                        created: ApiService.bsonDate()
                    };
                }
                // Avoid duplicate entries
                var exists = false;
                for (var i = 0; i < doc.entries.length; i++) {
                    if (doc.entries[i].id === id) { exists = true; break; }
                }
                if (!exists) doc.entries.push(entry);
                doc.total = totalMeals;
                var wasCompleted = doc.completed;
                doc.completed = doc.entries.length >= totalMeals;
                if (doc.completed && !wasCompleted) {
                    ApiService.logAction('complete_daily_checkin', { type: 'meal', date: dateStr });
                    FeedbackService.dailyCompleteFeedback();
                }
                // Save and propagate to rootScope for meal-plan to pick up
                $rootScope._mealCheckin = doc;
                return ApiService.saveCheckinDoc(doc);
            }).catch(function() {});
        }
        $rootScope.success = '✅ Refeição registrada! +15 XP';
        FeedbackService.mealFeedback();
        $rootScope._registeringMeal = null;
        $timeout(function() { $location.path('/meal-plan'); }, 1500);
    };
});
