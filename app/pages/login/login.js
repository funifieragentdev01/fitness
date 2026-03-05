angular.module('fitness').controller('LoginCtrl', function($scope, $location, AuthService, ApiService) {
    $scope.credentials = {};
    $scope.loading = false;
    $scope.error = '';

    // Post-login navigation (shared by email and Google login)
    function navigateAfterLogin() {
        AuthService.loadPlayer().then(function() {
            var userId = AuthService.getUser();
            ApiService.loadProfile(userId).then(function(res) {
                if (res.data && res.data._id) {
                    $scope.$root.profileData = res.data;
                    var cachedMeal = localStorage.getItem('fitness_mealplan');
                    var cachedWorkout = localStorage.getItem('fitness_workoutplan');
                    $location.path(cachedMeal && cachedWorkout ? '/dashboard' : '/onboarding');
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
    }

    $scope.login = function() {
        $scope.loading = true;
        $scope.error = '';
        AuthService.login($scope.credentials).then(function() {
            navigateAfterLogin();
        }).catch(function() {
            $scope.error = 'Usuário ou senha incorretos.';
            $scope.loading = false;
        });
    };

    // Initialize Google Sign-In
    function initGoogleSignIn() {
        if (!window.google || !window.google.accounts) return;
        google.accounts.id.initialize({
            client_id: CONFIG.GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false
        });
    }

    function handleGoogleResponse(response) {
        console.log('[Google Login] response:', response);
        if (!response || !response.credential) {
            console.error('[Google Login] No credential in response');
            $scope.$applyAsync(function() {
                $scope.error = 'Google nao retornou credenciais. Tente novamente.';
            });
            return;
        }
        $scope.$applyAsync(function() {
            $scope.loading = true;
            $scope.error = '';
            AuthService.loginWithGoogle(response.credential).then(function() {
                navigateAfterLogin();
            }).catch(function(err) {
                console.error('[Google Login] Error:', err);
                var msg = (err && err.data && err.data.message) || (err && err.message) || 'Erro no login com Google.';
                $scope.error = msg;
                $scope.loading = false;
            });
        });
    }

    // Render official Google button directly (works reliably on mobile)
    function renderGoogleButton() {
        if (!window.google || !window.google.accounts) return;
        initGoogleSignIn();
        var container = document.getElementById('google-btn-container');
        if (container) {
            google.accounts.id.renderButton(container, {
                type: 'standard', size: 'large', theme: 'filled_black',
                text: 'signin_with', shape: 'rectangular', width: 300, locale: 'pt-BR'
            });
        }
    }

    var gsiInterval = setInterval(function() {
        if (window.google && window.google.accounts) {
            renderGoogleButton();
            clearInterval(gsiInterval);
        }
    }, 200);
    $scope.$on('$destroy', function() { clearInterval(gsiInterval); });

    $scope.goTo = function(view) {
        $location.path('/' + (view === 'register' ? 'signup' : view === 'splash' ? 'landing' : view));
    };
});
