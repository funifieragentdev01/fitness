angular.module('fitness').controller('Challenge90Ctrl', function($scope, $rootScope, $location, AuthService, ApiService) {
    $scope.weightHistory = [];

    var userId = AuthService.getUser();

    ApiService.loadWeightHistory(userId).then(function(res) {
        if (Array.isArray(res.data)) {
            $scope.weightHistory = res.data.map(function(w) {
                return { date: new Date(w.created).toLocaleDateString('pt-BR'), weight: w.weight };
            });
        }
    }).catch(function() {});

    $scope.shareChallenge = function() {
        var text = '🏆 Estou no Desafio 90 Dias do FitEvolve! Bora evoluir juntos? 💪';
        if (navigator.share) {
            navigator.share({ title: 'Desafio 90 Dias', text: text });
        } else {
            prompt('Copie e compartilhe:', text);
        }
    };

    $scope.quitChallenge90 = function() {
        if (!confirm('Tem certeza que quer desistir do desafio?')) return;
        $rootScope.challenge90 = null;
        localStorage.removeItem('fitness_challenge90');
        $location.path('/dashboard');
    };
});
