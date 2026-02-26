angular.module('fitness').controller('WaterCtrl', function($scope, $rootScope, ApiService) {
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

    function loadWater() {
        if ($rootScope.profileData && $rootScope.profileData.weight) {
            $scope.waterGoalMl = Math.round($rootScope.profileData.weight * 35);
        }
        $scope.waterMl = parseInt(localStorage.getItem(waterMlKey()) || '0');
        $scope.waterCupsToday = parseInt(localStorage.getItem(waterKey()) || '0');
        $scope.waterCupsGoal = Math.ceil($scope.waterGoalMl / $scope.waterCupSize);
        $scope.waterPercent = Math.min(100, Math.round(($scope.waterMl / $scope.waterGoalMl) * 100));
        $scope.waterCupsArray = new Array(Math.max($scope.waterCupsToday, $scope.waterCupsGoal));
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
    };

    loadWater();
});
