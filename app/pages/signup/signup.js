angular.module('fitness').controller('SignupCtrl', function($scope, $location, $timeout, AuthService) {
    $scope.reg = {};
    $scope.loading = false;
    $scope.error = '';
    $scope.success = '';

    $scope.register = function() {
        if (!$scope.reg.terms) { $scope.error = 'Aceite os termos de uso.'; return; }
        if ($scope.reg.password.length < 6) { $scope.error = 'Senha deve ter no mínimo 6 caracteres.'; return; }
        $scope.loading = true;
        $scope.error = '';
        $scope.success = '';

        AuthService.register({
            username: $scope.reg.email,
            name: $scope.reg.name,
            email: $scope.reg.email,
            password: $scope.reg.password
        }).then(function(res) {
            if (res.data && res.data.status === 'OK') {
                $scope.success = 'Conta criada! Faça login para começar. 🎉';
                $timeout(function() { $location.path('/login'); }, 1500);
            } else {
                $scope.error = res.data.message || 'Erro ao criar conta.';
            }
            $scope.loading = false;
        }).catch(function() {
            $scope.error = 'Erro ao criar conta. Tente novamente.';
            $scope.loading = false;
        });
    };

    $scope.goTo = function(view) {
        $location.path('/' + (view === 'register' ? 'signup' : view === 'splash' ? 'landing' : view));
    };
});
