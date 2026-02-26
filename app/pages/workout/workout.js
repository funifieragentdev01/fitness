angular.module('fitness').controller('WorkoutCtrl', function($scope, $rootScope, $location, $timeout, ApiService) {
    $scope.workoutLog = {};
    $scope.workoutTypes = [
        { id: 'musculacao', name: 'Musculação', icon: '🏋️' },
        { id: 'cardio', name: 'Cardio', icon: '🏃' },
        { id: 'funcional', name: 'Funcional', icon: '⚡' },
        { id: 'yoga', name: 'Yoga/Alongamento', icon: '🧘' },
        { id: 'luta', name: 'Luta', icon: '🥊' },
        { id: 'esporte', name: 'Esporte', icon: '⚽' }
    ];

    $scope.submitWorkout = function() {
        if (!$scope.workoutLog.type || !$scope.workoutLog.duration) return;
        $rootScope.loading = true;
        ApiService.logAction('complete_workout', {
            type: $scope.workoutLog.type,
            duration: $scope.workoutLog.duration,
            notes: $scope.workoutLog.notes || ''
        }).then(function() {
            $rootScope.success = '✅ Treino registrado! +20 XP 💪';
            $rootScope.loading = false;
            $timeout(function() { $location.path('/dashboard'); }, 1500);
        }).catch(function() {
            $rootScope.success = '✅ Treino registrado!';
            $rootScope.loading = false;
            $timeout(function() { $location.path('/dashboard'); }, 1500);
        });
    };
});
