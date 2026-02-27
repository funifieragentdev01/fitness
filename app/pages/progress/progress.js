angular.module('fitness').controller('ProgressCtrl', function($scope, $rootScope, $timeout, AuthService, ApiService) {
    $scope.completedChallenges = 0;
    $scope.activeChallengesCount = 0;
    $scope.weightHistory = [];
    $scope.photoTimeline = [];

    var userId = AuthService.getUser();
    if (!userId) return;

    ApiService.loadAchievements(userId).then(function(res) {
        $rootScope.playerPoints = { xp: 0, energy: 0 };
        res.data.forEach(function(a) {
            if (a.item === 'xp' && a.type === 0) $rootScope.playerPoints.xp += Math.floor(a.total || 0);
            if (a.item === 'energy' && a.type === 0) $rootScope.playerPoints.energy += Math.floor(a.total || 0);
        });
        $rootScope.updateLevelProgress();
    });

    ApiService.loadLevels().then(function(res) {
        $rootScope.levels = res.data.sort(function(a, b) { return a.position - b.position; });
        $rootScope.updateLevelProgress();
    });

    ApiService.loadChallenges().then(function(res) {
        $scope.activeChallengesCount = res.data.length;
        $scope.completedChallenges = res.data.filter(function(c) { return c.completed; }).length;
    });

    ApiService.loadWeightHistory(userId).then(function(res) {
        if (Array.isArray(res.data)) {
            $scope.weightHistory = res.data.map(function(w) {
                return { date: ApiService.readDate(w.created).toLocaleDateString('pt-BR'), weight: w.weight };
            });

            $scope.photoTimeline = [];
            res.data.forEach(function(w) {
                var dateStr = ApiService.readDate(w.created).toLocaleDateString('pt-BR');
                if (w.photo_front_url) {
                    $scope.photoTimeline.push({ url: w.photo_front_url, date: dateStr, type: 'Frente' });
                }
                if (w.photo_side_url) {
                    $scope.photoTimeline.push({ url: w.photo_side_url, date: dateStr, type: 'Lateral' });
                }
            });

            $timeout(function() { drawWeightChart(); }, 100);
        }
    }).catch(function() { $scope.weightHistory = []; });

    function drawWeightChart() {
        var canvas = document.getElementById('weightChart');
        if (!canvas || !$scope.weightHistory.length) return;
        var ctx = canvas.getContext('2d');
        var data = $scope.weightHistory.slice().reverse();
        if (data.length < 2) return;

        var w = canvas.parentElement.offsetWidth;
        var h = 200;
        canvas.width = w * 2; canvas.height = h * 2;
        canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
        ctx.scale(2, 2);

        var weights = data.map(function(d) { return d.weight; });
        var minW = Math.min.apply(null, weights) - 1;
        var maxW = Math.max.apply(null, weights) + 1;
        var range = maxW - minW || 1;
        var padX = 40, padY = 20;
        var chartW = w - padX * 2, chartH = h - padY * 2;

        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (var i = 0; i <= 4; i++) {
            var y = padY + (chartH / 4) * i;
            ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(w - padX, y); ctx.stroke();
            ctx.fillStyle = '#7F8C8D'; ctx.font = '10px Inter'; ctx.textAlign = 'right';
            ctx.fillText((maxW - (range / 4) * i).toFixed(1), padX - 6, y + 4);
        }

        ctx.strokeStyle = '#FF6B00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach(function(d, idx) {
            var x = padX + (chartW / (data.length - 1)) * idx;
            var y = padY + chartH - ((d.weight - minW) / range) * chartH;
            if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();

        data.forEach(function(d, idx) {
            var x = padX + (chartW / (data.length - 1)) * idx;
            var y = padY + chartH - ((d.weight - minW) / range) * chartH;
            ctx.fillStyle = '#FF6B00';
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111111';
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        });

        ctx.fillStyle = '#7F8C8D'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
        ctx.fillText(data[0].date, padX, h - 4);
        ctx.fillText(data[data.length - 1].date, w - padX, h - 4);
    }
});
