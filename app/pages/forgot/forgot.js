angular.module('fitness').controller('ForgotCtrl', function($scope, $location, $http) {
    $scope.step = 1;
    $scope.email = '';
    $scope.code = '';
    $scope.newPassword = '';
    $scope.confirmPassword = '';
    $scope.loading = false;
    $scope.error = '';
    $scope.success = '';

    var basicToken = 'Basic ' + btoa(CONFIG.API_KEY + ':');

    $scope.requestCode = function() {
        if (!$scope.email) { $scope.error = 'Digite seu email.'; return; }
        $scope.loading = true;
        $scope.error = '';
        $scope.success = '';

        $http.get(CONFIG.API_URL + '/v3/player/password/change', {
            params: { player: $scope.email },
            headers: { 'Authorization': basicToken }
        }).then(function() {
            $scope.success = 'Código enviado! Verifique seu email.';
            $scope.step = 2;
            $scope.loading = false;
        }).catch(function(err) {
            var msg = (err.data && err.data.message) || 'Erro ao enviar código. Verifique o email.';
            $scope.error = msg;
            $scope.loading = false;
        });
    };

    $scope.resetPassword = function() {
        if (!$scope.code) { $scope.error = 'Digite o código recebido.'; return; }
        if (!$scope.newPassword || $scope.newPassword.length < 8) {
            $scope.error = 'Senha deve ter no mínimo 8 caracteres.'; return;
        }
        if ($scope.newPassword !== $scope.confirmPassword) {
            $scope.error = 'As senhas não coincidem.'; return;
        }
        $scope.loading = true;
        $scope.error = '';

        $http.put(CONFIG.API_URL + '/v3/player/password', null, {
            params: {
                player: $scope.email,
                code: $scope.code,
                new_password: $scope.newPassword
            },
            headers: { 'Authorization': basicToken }
        }).then(function() {
            $scope.step = 3;
            $scope.loading = false;
        }).catch(function(err) {
            var msg = (err.data && err.data.message) || 'Código inválido ou expirado. Tente novamente.';
            $scope.error = msg;
            $scope.loading = false;
        });
    };

    $scope.goTo = function(view) {
        $location.path('/' + (view === 'register' ? 'signup' : view === 'splash' ? 'landing' : view));
    };
});
