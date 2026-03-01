angular.module('fitness').controller('ProfileCtrl', function($scope, $rootScope, $location, AuthService, ApiService, PlanService) {
    var userId = AuthService.getUser();
    $scope.profilePhoto = null;
    $scope.aiGoal = null;
    $scope.isPremium = PlanService.isPremium();

    // Refresh player data to ensure plan is up-to-date
    AuthService.loadPlayer().then(function() {
        $scope.isPremium = PlanService.isPremium();
    });

    function loadProfileData() {
        if (!userId) return;
        ApiService.loadProfile(userId).then(function(res) {
            if (res.data && res.data._id) {
                $rootScope.profileData = res.data;
                $rootScope.latestBodyAnalysis = localStorage.getItem('fitness_body_analysis') || null;
                $scope.profilePhoto = res.data.photo_url || null;
                $scope.aiGoal = res.data.aiGoal || JSON.parse(localStorage.getItem('fitness_ai_goal') || 'null');
            }
        }).catch(function() {});
    }
    loadProfileData();

    // Format training time - handle Date objects, ISO strings, and plain time strings
    $scope.formatTime = function(time) {
        if (!time) return '';
        if (typeof time === 'string') {
            // ISO date string like "1970-01-01T10:00:00.000Z"
            if (time.indexOf('T') > -1) {
                var d = new Date(time);
                return d.getUTCHours().toString().padStart(2, '0') + ':' + d.getUTCMinutes().toString().padStart(2, '0');
            }
            // Already "HH:MM" format
            if (/^\d{2}:\d{2}/.test(time)) return time.substring(0, 5);
            return time;
        }
        if (time instanceof Date) {
            return time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0');
        }
        return String(time);
    };

    // Profile photo upload
    $scope.triggerProfilePhoto = function() {
        document.getElementById('profilePhotoInput').click();
    };

    $scope.onProfilePhoto = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() {
                    var dataUri = e.target.result;
                    $scope.profilePhoto = dataUri;
                    // Upload to Funifier
                    ApiService.uploadImage(dataUri, 'profile-' + userId + '-' + Date.now() + '.jpg')
                        .then(function(res) {
                            if (res.data && res.data.uploads && res.data.uploads[0]) {
                                var url = res.data.uploads[0].url;
                                $scope.profilePhoto = url;
                                // Save URL in profile
                                var profileUpdate = angular.copy($rootScope.profileData) || {};
                                profileUpdate._id = userId;
                                profileUpdate.photo_url = url;
                                ApiService.saveProfile(profileUpdate);
                                $rootScope.profileData.photo_url = url;
                            }
                        });
                });
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    // Redefine goal - navigate to onboarding step 7 (goal)
    $scope.redefineGoal = function() {
        if (!PlanService.canChange('goal')) {
            $rootScope.openUpgrade('Você já alterou sua meta este mês. Seja Premium para alterações ilimitadas!');
            return;
        }
        PlanService.recordChange('goal');
        $location.path('/onboarding').search({ step: '7' });
    };

    $scope.logout = function() {
        AuthService.logout();
        $location.path('/login');
    };

    $scope.confirmDeleteAccount = function() {
        if (!confirm('Tem certeza que deseja excluir sua conta? Todos os seus dados serão apagados permanentemente.')) return;
        if (!confirm('Esta ação não pode ser desfeita. Confirma a exclusão?')) return;
        AuthService.deleteAccount().then(function() {
            $location.path('/landing');
            alert('Conta excluída com sucesso.');
        }).catch(function() {
            alert('Erro ao excluir conta. Tente novamente.');
        });
    };
});
