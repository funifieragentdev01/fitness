angular.module('fitness').controller('ProgressCtrl', function($scope, $rootScope, AuthService, ApiService) {
    $scope.allLevels = [];
    $scope.xpBars = [];
    $scope.completedChallenges = 0;
    $scope.activeChallengesCount = 0;
    $scope.weightHistory = [];

    var userId = AuthService.getUser();
    if (!userId) return;

    ApiService.loadAchievements(userId).then(function(res) {
        $rootScope.playerPoints = { xp: 0, energy: 0 };
        res.data.forEach(function(a) {
            if (a.item === 'xp' && a.type === 0) $rootScope.playerPoints.xp += Math.floor(a.total || 0);
            if (a.item === 'energy' && a.type === 0) $rootScope.playerPoints.energy += Math.floor(a.total || 0);
        });
        var total = $rootScope.playerPoints.xp || 0;
        var weeks = ['S1', 'S2', 'S3', 'S4'];
        var maxBar = Math.max(total, 1);
        $scope.xpBars = weeks.map(function(w, i) {
            var val = i === weeks.length - 1 ? total : Math.floor(Math.random() * total * 0.3);
            return { label: w, value: val, pct: Math.min(100, (val / maxBar) * 100) };
        });
        $rootScope.updateLevelProgress();
    });

    ApiService.loadLevels().then(function(res) {
        $rootScope.levels = res.data.sort(function(a, b) { return a.position - b.position; });
        var xp = $rootScope.playerPoints.xp || 0;
        $scope.allLevels = $rootScope.levels.map(function(lv) {
            return { level: lv.level, minPoints: lv.minPoints, reached: xp >= lv.minPoints, current: false };
        });
        for (var i = $scope.allLevels.length - 1; i >= 0; i--) {
            if ($scope.allLevels[i].reached) { $scope.allLevels[i].current = true; break; }
        }
        $rootScope.updateLevelProgress();
    });

    ApiService.loadChallenges().then(function(res) {
        $scope.activeChallengesCount = res.data.length;
        $scope.completedChallenges = res.data.filter(function(c) { return c.completed; }).length;
    });

    ApiService.loadWeightHistory(userId).then(function(res) {
        if (Array.isArray(res.data)) {
            $scope.weightHistory = res.data.map(function(w) {
                return { date: new Date(w.created).toLocaleDateString('pt-BR'), weight: w.weight };
            });
        }
    }).catch(function() { $scope.weightHistory = []; });
});
