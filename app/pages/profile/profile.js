angular.module('fitness').controller('ProfileCtrl', function($scope, $rootScope, $location, AuthService, ApiService) {
    var userId = AuthService.getUser();

    function loadProfileData() {
        if (!userId) return;
        ApiService.loadProfile(userId).then(function(res) {
            if (res.data && res.data._id) {
                $rootScope.profileData = res.data;
                $rootScope.latestBodyAnalysis = localStorage.getItem('fitness_body_analysis') || null;
            }
        }).catch(function() {});
    }

    loadProfileData();

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
