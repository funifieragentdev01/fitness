angular.module('fitness').controller('WaterCtrl', function($scope, $rootScope, ApiService, AuthService) {
    $scope.waterCupSize = 250;
    $scope.waterGoalMl = 2800;
    $scope.waterMl = 0;
    $scope.waterCupsToday = 0;
    $scope.waterCupsGoal = 11;
    $scope.waterPercent = 0;
    $scope.waterCupsArray = [];

    $scope.setWaterCupSize = function(size) {
        $scope.waterCupSize = size;
        $scope.waterCupsGoal = Math.ceil($scope.waterGoalMl / $scope.waterCupSize);
        $scope.waterCupsArray = new Array(Math.max($scope.waterCupsToday, $scope.waterCupsGoal));
    };

    function waterKey() { return 'fitness_water_' + new Date().toISOString().slice(0, 10); }
    function waterMlKey() { return 'fitness_waterml_' + new Date().toISOString().slice(0, 10); }

    $scope.waterCheckin = null;

    function loadWater() {
        if ($rootScope.profileData && $rootScope.profileData.weight) {
            $scope.waterGoalMl = Math.round($rootScope.profileData.weight * 35);
        }
        // Load from localStorage first (fast)
        $scope.waterMl = parseInt(localStorage.getItem(waterMlKey()) || '0');
        $scope.waterCupsToday = parseInt(localStorage.getItem(waterKey()) || '0');
        $scope.waterCupsGoal = Math.ceil($scope.waterGoalMl / $scope.waterCupSize);
        $scope.waterPercent = Math.min(100, Math.round(($scope.waterMl / $scope.waterGoalMl) * 100));
        $scope.waterCupsArray = new Array(Math.max($scope.waterCupsToday, $scope.waterCupsGoal));

        // Then sync from server
        ApiService.loadCheckin('water').then(function(doc) {
            if (doc) {
                $scope.waterCheckin = doc;
                $scope.waterMl = doc.totalMl || 0;
                $scope.waterCupsToday = (doc.entries || []).length;
                $scope.waterGoalMl = doc.goalMl || $scope.waterGoalMl;
                $scope.waterPercent = Math.min(100, Math.round(($scope.waterMl / $scope.waterGoalMl) * 100));
                $scope.waterCupsGoal = Math.ceil($scope.waterGoalMl / $scope.waterCupSize);
                $scope.waterCupsArray = new Array(Math.max($scope.waterCupsToday, $scope.waterCupsGoal));
                // Sync to localStorage
                localStorage.setItem(waterKey(), $scope.waterCupsToday);
                localStorage.setItem(waterMlKey(), $scope.waterMl);
            }
        }).catch(function() {});
    }

    $scope.registerWaterCup = function() {
        $scope.waterCupsToday++;
        $scope.waterMl += $scope.waterCupSize;
        localStorage.setItem(waterKey(), $scope.waterCupsToday);
        localStorage.setItem(waterMlKey(), $scope.waterMl);
        $scope.waterPercent = Math.min(100, Math.round(($scope.waterMl / $scope.waterGoalMl) * 100));
        $scope.waterCupsGoal = Math.ceil($scope.waterGoalMl / $scope.waterCupSize);
        $scope.waterCupsArray = new Array(Math.max($scope.waterCupsToday, $scope.waterCupsGoal));
        ApiService.logAction('register_water', { cups: 1, ml: $scope.waterCupSize });

        // Persist to checkin__c
        var userId = AuthService.getUser();
        var dateStr = new Date().toISOString().slice(0, 10);
        var docId = userId + '_water_' + dateStr;
        var now = new Date().toISOString();
        var entry = { ml: $scope.waterCupSize, size: $scope.waterCupSize, ts: now };

        if (!$scope.waterCheckin) {
            $scope.waterCheckin = {
                _id: docId,
                userId: userId,
                type: 'water',
                date: ApiService.bsonDate(new Date(dateStr + 'T03:00:00.000Z')),
                entries: [],
                totalMl: 0,
                goalMl: $scope.waterGoalMl,
                completed: false,
                created: ApiService.bsonDate()
            };
        }
        $scope.waterCheckin.entries.push(entry);
        $scope.waterCheckin.totalMl = $scope.waterMl;
        $scope.waterCheckin.goalMl = $scope.waterGoalMl;
        var wasCompleted = $scope.waterCheckin.completed;
        $scope.waterCheckin.completed = $scope.waterMl >= $scope.waterGoalMl;
        if ($scope.waterCheckin.completed && !wasCompleted) {
            ApiService.logAction('complete_daily_checkin', { type: 'water', date: dateStr });
        }
        ApiService.saveCheckinDoc($scope.waterCheckin);
    };

    loadWater();
});
