angular.module('fitness').controller('WorkoutPlanCtrl', function($scope, $rootScope, $location, ApiService, AiService) {
    $scope.showWorkoutAdjust = false;
    $scope.workoutAdjustFeedback = null;
    $scope.workoutForm = { adjustText: '' };
    $scope.workoutAdjustPhoto = null;

    function loadWorkoutPlan() {
        var cached = localStorage.getItem('fitness_workoutplan');
        if (cached) {
            try {
                $rootScope.workoutPlan = JSON.parse(cached);
                if ($rootScope.workoutPlan.days) {
                    var todayIdx = new Date().getDay();
                    var dayMap = [6, 0, 1, 2, 3, 4, 5];
                    var idx = dayMap[todayIdx];
                    if ($rootScope.workoutPlan.days[idx]) $rootScope.workoutPlan.days[idx].open = true;
                }
            } catch(e) { $rootScope.workoutPlan = null; }
        }
        $scope.showWorkoutAdjust = false;
        $scope.workoutAdjustFeedback = null;
    }

    $scope.regenerateWorkoutPlan = function() {
        if (!$rootScope.profileData) return;
        $rootScope.loading = true;
        AiService.generateWorkoutPlan($rootScope.profileData).then(function(plan) {
            $rootScope.workoutPlan = plan;
            localStorage.setItem('fitness_workoutplan', JSON.stringify(plan));
            $rootScope.loading = false;
        }).catch(function() { $rootScope.loading = false; });
    };

    $scope.markWorkoutDone = function(day) {
        day.done = true;
        ApiService.logAction('complete_workout', { day: day.day_name, focus: day.muscle_group });
        if ($rootScope.workoutPlan) localStorage.setItem('fitness_workoutplan', JSON.stringify($rootScope.workoutPlan));
    };

    $scope.toggleWorkoutAdjust = function() { $scope.showWorkoutAdjust = !$scope.showWorkoutAdjust; };

    $scope.triggerAdjustSpacePhoto = function() { document.getElementById('adjustSpacePhotoInput').click(); };
    $scope.onAdjustSpacePhoto = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) { $scope.$apply(function() { $scope.workoutAdjustPhoto = e.target.result; }); };
            reader.readAsDataURL(input.files[0]);
        }
    };

    $scope.adjustWorkoutPlan = function() {
        if (!$scope.workoutForm.adjustText || !$rootScope.workoutPlan) return;
        $rootScope.loading = true;
        $scope.workoutAdjustFeedback = null;
        AiService.adjustWorkoutPlan($rootScope.workoutPlan, $scope.workoutForm.adjustText, $rootScope.profileData, $scope.workoutAdjustPhoto).then(function(result) {
            $scope.workoutAdjustFeedback = result.feedback;
            if (result.days) {
                $rootScope.workoutPlan.days = result.days;
                $rootScope.workoutPlan.date = new Date().toLocaleDateString('pt-BR');
                localStorage.setItem('fitness_workoutplan', JSON.stringify($rootScope.workoutPlan));
            }
            $rootScope.loading = false;
        }).catch(function() {
            $scope.workoutAdjustFeedback = 'Não consegui ajustar agora. Tenta de novo! 😊';
            $rootScope.loading = false;
        });
    };

    loadWorkoutPlan();
});
