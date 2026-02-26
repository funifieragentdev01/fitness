angular.module('fitness').controller('LoginCtrl', function($scope, $location, AuthService, ApiService) {
    $scope.credentials = {};
    $scope.loading = false;
    $scope.error = '';

    $scope.login = function() {
        $scope.loading = true;
        $scope.error = '';
        AuthService.login($scope.credentials).then(function() {
            AuthService.loadPlayer().then(function() {
                var userId = AuthService.getUser();
                ApiService.loadProfile(userId).then(function(res) {
                    if (res.data && res.data._id) {
                        $scope.$root.profileData = res.data;
                        var cachedMeal = localStorage.getItem('fitness_mealplan');
                        var cachedWorkout = localStorage.getItem('fitness_workoutplan');
                        if (cachedMeal && cachedWorkout) {
                            $location.path('/dashboard');
                        } else {
                            $location.path('/onboarding');
                        }
                    } else {
                        $location.path('/onboarding');
                    }
                    $scope.loading = false;
                }).catch(function() {
                    $location.path('/onboarding');
                    $scope.loading = false;
                });
            }).catch(function() {
                $scope.error = 'Erro ao carregar dados do jogador.';
                $scope.loading = false;
            });
        }).catch(function() {
            $scope.error = 'Usuário ou senha incorretos.';
            $scope.loading = false;
        });
    };

    $scope.goTo = function(view) {
        $location.path('/' + (view === 'register' ? 'signup' : view === 'splash' ? 'landing' : view));
    };
});
