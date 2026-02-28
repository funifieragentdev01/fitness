angular.module('fitness').controller('PlansCtrl', function($scope, $rootScope, $location, PlanService, PaymentService) {
    $scope.isPremium = PlanService.isPremium();
    $scope.currentPlan = PlanService.getPlan();
    $scope.paymentConfigured = PaymentService.isConfigured();
    $scope.envLabel = PaymentService.getEnvLabel();

    $scope.selectPlan = function(type) {
        if (type === 'standard' && PlanService.isPremium()) {
            $rootScope.success = 'Para fazer downgrade, entre em contato pelo WhatsApp.';
            return;
        }
        if (type === 'standard' && !PlanService.isPremium()) {
            // Already on standard — open checkout to activate/renew
            PaymentService.checkout('standard');
            return;
        }
        if (type === 'premium') {
            PaymentService.checkout('premium');
        }
    };
});
