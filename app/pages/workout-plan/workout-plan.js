angular.module('fitness').controller('WorkoutPlanCtrl', function($scope, $rootScope, $location, ApiService, AiService, AuthService, FeedbackService, PlanService) {
    $scope.showWorkoutAdjust = false;
    $scope.workoutAdjustFeedback = null;
    $scope.workoutForm = { adjustText: '' };
    $scope.workoutAdjustPhoto = null;
    $scope.workoutCheckin = null;

    function loadWorkoutPlan() {
        var cached = localStorage.getItem('fitness_workoutplan');
        if (cached) {
            try {
                $rootScope.workoutPlan = JSON.parse(cached);
                if ($rootScope.workoutPlan.days) {
                    // Sort days: Segunda first, Domingo last
                    var dayOrder = {'Segunda':0,'Terça':1,'Terca':1,'Quarta':2,'Quinta':3,'Sexta':4,'Sábado':5,'Sabado':5,'Domingo':6};
                    $rootScope.workoutPlan.days.sort(function(a, b) {
                        var aO = 99, bO = 99;
                        Object.keys(dayOrder).forEach(function(k) { if (a.day_name && a.day_name.indexOf(k) === 0) aO = dayOrder[k]; });
                        Object.keys(dayOrder).forEach(function(k) { if (b.day_name && b.day_name.indexOf(k) === 0) bO = dayOrder[k]; });
                        return aO - bO;
                    });
                    // Reset all day.done — will restore from today's checkin
                    $rootScope.workoutPlan.days.forEach(function(day) { day.done = false; });
                    // Open today's card
                    var todayNames = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
                    var todayName = todayNames[new Date().getDay()];
                    $rootScope.workoutPlan.days.forEach(function(day) {
                        if (day.day_name && day.day_name.indexOf(todayName) === 0) day.open = true;
                    });
                }
            } catch(e) { $rootScope.workoutPlan = null; }
        }
        $scope.showWorkoutAdjust = false;
        $scope.workoutAdjustFeedback = null;

        // Load today's workout checkin from server
        ApiService.loadCheckin('workout').then(function(doc) {
            if (doc) {
                $scope.workoutCheckin = doc;
                // Restore day.done from today's checkin entries
                if ($rootScope.workoutPlan && $rootScope.workoutPlan.days && doc.entries) {
                    doc.entries.forEach(function(entry) {
                        $rootScope.workoutPlan.days.forEach(function(day) {
                            if (day.day_name === entry.day_name) day.done = true;
                        });
                    });
                }
            }
        }).catch(function() {});
    }

    $scope.regenerateWorkoutPlan = function() {
        if (!$rootScope.profileData) return;
        if (!PlanService.canChange('workoutPlan')) {
            $rootScope.openUpgrade('Você já alterou seu plano de treino este mês. Seja Premium para alterações ilimitadas!');
            return;
        }
        $rootScope.loading = true;
        AiService.generateWorkoutPlan($rootScope.profileData).then(function(plan) {
            $rootScope.workoutPlan = plan;
            localStorage.setItem('fitness_workoutplan', JSON.stringify(plan));
            PlanService.recordChange('workoutPlan');
            $rootScope.loading = false;
        }).catch(function() { $rootScope.loading = false; });
    };

    $scope.markWorkoutDone = function(day) {
        day.done = true;
        FeedbackService.workoutFeedback();
        ApiService.logAction('complete_workout', { day: day.day_name, focus: day.muscle_group });

        // Persist to checkin__c
        var userId = AuthService.getUser();
        var dateStr = new Date().toISOString().slice(0, 10);
        var docId = userId + '_workout_' + dateStr;
        var now = new Date().toISOString();
        var entry = { day_name: day.day_name, muscle_group: day.muscle_group || '', ts: now };

        if (!$scope.workoutCheckin) {
            $scope.workoutCheckin = {
                _id: docId,
                userId: userId,
                type: 'workout',
                date: ApiService.bsonDate(new Date(dateStr + 'T03:00:00.000Z')),
                entries: [],
                completed: false,
                created: ApiService.bsonDate()
            };
        }
        // Avoid duplicates
        var exists = false;
        for (var i = 0; i < $scope.workoutCheckin.entries.length; i++) {
            if ($scope.workoutCheckin.entries[i].day_name === day.day_name) { exists = true; break; }
        }
        if (!exists) $scope.workoutCheckin.entries.push(entry);
        $scope.workoutCheckin.completed = true;
        ApiService.logAction('complete_daily_checkin', { type: 'workout', date: dateStr });
        FeedbackService.dailyCompleteFeedback();
        ApiService.saveCheckinDoc($scope.workoutCheckin);
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
        if (!PlanService.canChange('workoutPlan')) {
            $rootScope.openUpgrade('Você já alterou seu plano de treino este mês. Seja Premium para alterações ilimitadas!');
            return;
        }
        $rootScope.loading = true;
        $scope.workoutAdjustFeedback = null;
        AiService.adjustWorkoutPlan($rootScope.workoutPlan, $scope.workoutForm.adjustText, $rootScope.profileData, $scope.workoutAdjustPhoto).then(function(result) {
            $scope.workoutAdjustFeedback = result.feedback;
            if (result.days) {
                $rootScope.workoutPlan.days = result.days;
                $rootScope.workoutPlan.date = new Date().toLocaleDateString('pt-BR');
                localStorage.setItem('fitness_workoutplan', JSON.stringify($rootScope.workoutPlan));
                PlanService.recordChange('workoutPlan');
            }
            $rootScope.loading = false;
        }).catch(function() {
            $scope.workoutAdjustFeedback = 'Não consegui ajustar agora. Tenta de novo! 😊';
            $rootScope.loading = false;
        });
    };

    loadWorkoutPlan();
});
