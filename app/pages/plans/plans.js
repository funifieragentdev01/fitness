angular.module('fitness').controller('PlansCtrl', function($scope, $rootScope, $location, PlanService) {
    $scope.isPremium = PlanService.isPremium();
    $scope.currentPlan = PlanService.getPlan();

    $scope.selectPlan = function(type) {
        if (type === 'premium' && !PlanService.isPremium()) {
            $rootScope.success = '🚧 Pagamento será integrado em breve!';
        } else if (type === 'standard' && PlanService.isPremium()) {
            $rootScope.success = 'Para fazer downgrade, entre em contato pelo WhatsApp.';
        }
    };
});
