angular.module('fitness').controller('PlansCtrl', function($scope, $rootScope, $location, PlanService, PaymentService, AuthService) {
    $scope.isPremium = PlanService.isPremium();
    $scope.currentPlan = PlanService.getPlan();

    // Refresh player data
    AuthService.loadPlayer().then(function() {
        $scope.isPremium = PlanService.isPremium();
        $scope.currentPlan = PlanService.getPlan();
    });
    $scope.envLabel = PaymentService.getEnvLabel();

    // Coupon
    $scope.couponCode = '';
    $scope.couponValid = null; // null=not checked, true/false
    $scope.couponInfo = null;
    $scope.couponError = '';
    $scope.checkingCoupon = false;

    $scope.validateCoupon = function() {
        if (!$scope.couponCode || $scope.couponCode.trim().length < 3) return;
        $scope.checkingCoupon = true;
        $scope.couponError = '';
        $scope.couponValid = null;

        PaymentService.validateCoupon($scope.couponCode).then(function(result) {
            $scope.checkingCoupon = false;
            if (result.valid) {
                $scope.couponValid = true;
                $scope.couponInfo = result;
            } else {
                $scope.couponValid = false;
                $scope.couponError = result.error || 'Cupom inválido';
            }
        }).catch(function() {
            $scope.checkingCoupon = false;
            $scope.couponValid = false;
            $scope.couponError = 'Erro ao validar cupom';
        });
    };

    $scope.clearCoupon = function() {
        $scope.couponCode = '';
        $scope.couponValid = null;
        $scope.couponInfo = null;
        $scope.couponError = '';
    };

    $scope.getPrice = function(planType) {
        if ($scope.couponValid && $scope.couponInfo) {
            return PaymentService.calculatePrice(planType, $scope.couponInfo.discountType, $scope.couponInfo.discountValue);
        }
        return planType === 'premium' ? 179.90 : 29.90;
    };

    $scope.getOriginalPrice = function(planType) {
        return planType === 'premium' ? 179.90 : 29.90;
    };

    $scope.hasDiscount = function(planType) {
        return $scope.couponValid && $scope.getPrice(planType) < $scope.getOriginalPrice(planType);
    };

    $scope.selectPlan = function(type) {
        if (type === 'standard' && PlanService.isPremium()) {
            $rootScope.success = 'Para fazer downgrade, entre em contato pelo WhatsApp.';
            return;
        }
        var coupon = $scope.couponValid ? $scope.couponCode : null;
        PaymentService.checkout(type, coupon);
    };
});
