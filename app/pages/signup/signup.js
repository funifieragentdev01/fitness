angular.module('fitness').controller('SignupCtrl', function($scope, $location, $timeout, AuthService, ApiService) {
    $scope.reg = {};
    $scope.loading = false;
    $scope.error = '';
    $scope.success = '';

    $scope.register = function() {
        if (!$scope.reg.terms) { $scope.error = 'Aceite os termos de uso.'; return; }
        if ($scope.reg.password.length < 6) { $scope.error = 'Senha deve ter no mínimo 6 caracteres.'; return; }
        if ($scope.reg.password !== $scope.reg.confirmPassword) { $scope.error = 'As senhas não coincidem.'; return; }
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
                $scope.success = 'Conta criada! Faça login para começar.';
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

    // Google Sign-Up (same flow as login — endpoint handles create-or-login)
    function handleGoogleResponse(response) {
        console.log('[Google Signup] response:', response);
        if (!response || !response.credential) {
            console.error('[Google Signup] No credential in response');
            $scope.$applyAsync(function() {
                $scope.error = 'Google nao retornou credenciais. Tente novamente.';
            });
            return;
        }
        $scope.$applyAsync(function() {
            $scope.loading = true;
            $scope.error = '';
            AuthService.loginWithGoogle(response.credential).then(function() {
                return AuthService.loadPlayer();
            }).then(function() {
                var userId = AuthService.getUser();
                return ApiService.loadProfile(userId);
            }).then(function(res) {
                if (res.data && res.data._id) {
                    $scope.$root.profileData = res.data;
                    var cachedMeal = localStorage.getItem('fitness_mealplan');
                    var cachedWorkout = localStorage.getItem('fitness_workoutplan');
                    $location.path(cachedMeal && cachedWorkout ? '/dashboard' : '/onboarding');
                } else {
                    $location.path('/onboarding');
                }
                $scope.loading = false;
            }).catch(function(err) {
                console.error('[Google Signup] Error:', err);
                var msg = (err && err.data && err.data.message) || (err && err.message) || 'Erro no cadastro com Google.';
                $scope.error = msg;
                $scope.loading = false;
            });
        });
    }

    $scope.signupWithGoogle = function() {
        if (!window.google || !window.google.accounts) {
            $scope.error = 'Google Sign-In carregando. Tente novamente em instantes.';
            return;
        }
        google.accounts.id.initialize({
            client_id: CONFIG.GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false
        });
        google.accounts.id.prompt(function(notification) {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                var container = document.getElementById('google-btn-container-signup');
                if (container) {
                    container.innerHTML = '';
                    google.accounts.id.renderButton(container, {
                        type: 'standard', size: 'large', theme: 'filled_black',
                        text: 'signup_with', shape: 'rectangular', width: 300
                    });
                    setTimeout(function() {
                        var btn = container.querySelector('[role=button]') || container.querySelector('div[tabindex]');
                        if (btn) btn.click();
                    }, 200);
                }
            }
        });
    };

    $scope.goTo = function(view) {
        $location.path('/' + (view === 'register' ? 'signup' : view === 'splash' ? 'landing' : view));
    };
});
