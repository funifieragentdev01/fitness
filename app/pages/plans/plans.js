angular.module('fitness').controller('PlansCtrl', function($scope, $rootScope, $location, PlanService, PaymentService, AuthService) {
    $scope.isPremium = PlanService.isPremium();
    $scope.currentPlan = PlanService.getPlan();
    $scope.hasSubscription = false;
    $scope.planStatus = 'active';
    $scope.planStatusLabel = 'Ativo';
    $scope.planStatusClass = 'status-active';
    $scope.planEndDate = null;
    $scope.downgradeDate = null;
    $scope.subStatus = {};
    $scope.actionLoading = false;
    $scope.showReactivate = false;

    // Refresh player data
    AuthService.loadPlayer().then(function() {
        $scope.isPremium = PlanService.isPremium();
        $scope.currentPlan = PlanService.getPlan();
        checkSubscriptionStatus();
    });

    $scope.envLabel = PaymentService.getEnvLabel();

    function checkSubscriptionStatus() {
        var plan = ($rootScope.player && $rootScope.player.extra && $rootScope.player.extra.plan) || {};
        var hasSub = !!(plan.asaas_subscription_id || plan.asaas_customer_id);
        $scope.hasSubscription = hasSub;

        $scope.planStatus = plan.plan_status || 'active';
        $scope.planEndDate = plan.plan_end_date;
        $scope.downgradeDate = plan.plan_downgrade_date;

        updateStatusLabel();

        // Fetch live status from Asaas if subscription exists
        if (hasSub && plan.asaas_subscription_id) {
            PaymentService.getSubscriptionStatus().then(function(result) {
                if (result.success && result.subscription) {
                    $scope.subStatus = result.subscription;
                    if (result.subscription.asaasStatus === 'INACTIVE') {
                        $scope.planStatus = 'canceled';
                        updateStatusLabel();
                    }
                }
            }).catch(function() {});
        }
    }

    function updateStatusLabel() {
        switch ($scope.planStatus) {
            case 'active':
                $scope.planStatusLabel = 'Ativo';
                $scope.planStatusClass = 'status-active';
                break;
            case 'canceled':
                $scope.planStatusLabel = 'Cancelado';
                $scope.planStatusClass = 'status-canceled';
                break;
            case 'pending_downgrade':
                $scope.planStatusLabel = 'Downgrade agendado';
                $scope.planStatusClass = 'status-pending';
                break;
            default:
                $scope.planStatusLabel = 'Ativo';
                $scope.planStatusClass = 'status-active';
        }
    }

    $scope.formatDate = function(dateStr) {
        if (!dateStr) return '';
        var parts = dateStr.split('-');
        if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
        return dateStr;
    };

    // Coupon (use dot notation to survive ng-if child scope)
    $scope.coupon = { code: '', valid: null, info: null, error: '', checking: false };

    $scope.validateCoupon = function() {
        if (!$scope.coupon.code || $scope.coupon.code.trim().length < 3) return;
        $scope.coupon.checking = true;
        $scope.coupon.error = '';
        $scope.coupon.valid = null;

        PaymentService.validateCoupon($scope.coupon.code).then(function(result) {
            $scope.coupon.checking = false;
            if (result.valid) {
                $scope.coupon.valid = true;
                $scope.coupon.info = result;
            } else {
                $scope.coupon.valid = false;
                $scope.coupon.error = result.error || 'Cupom inválido';
            }
        }).catch(function() {
            $scope.coupon.checking = false;
            $scope.coupon.valid = false;
            $scope.coupon.error = 'Erro ao validar cupom';
        });
    };

    $scope.clearCoupon = function() {
        $scope.coupon.code = '';
        $scope.coupon.valid = null;
        $scope.coupon.info = null;
        $scope.coupon.error = '';
    };

    $scope.getPrice = function(planType) {
        if ($scope.coupon.valid && $scope.coupon.info) {
            return PaymentService.calculatePrice(planType, $scope.coupon.info.discountType, $scope.coupon.info.discountValue);
        }
        return planType === 'premium' ? 179.90 : 39.90;
    };

    $scope.getOriginalPrice = function(planType) {
        return planType === 'premium' ? 179.90 : 39.90;
    };

    $scope.hasDiscount = function(planType) {
        return $scope.coupon.valid && $scope.getPrice(planType) < $scope.getOriginalPrice(planType);
    };

    // Returns true if the coupon discount applies only to the first payment
    $scope.isFirstOnly = function() {
        return $scope.coupon.valid && $scope.coupon.info && $scope.coupon.info.discountDuration === 'FIRST_ONLY';
    };

    $scope.selectPlan = function(type) {
        var coupon = $scope.coupon.valid ? $scope.coupon.code : null;
        PaymentService.checkout(type, coupon);
    };

    // --- Subscription Management ---

    $scope.confirmDowngrade = function() {
        if (!confirm('Tem certeza que deseja mudar para o plano Standard?\n\nSeu Premium ficará ativo até o fim do ciclo atual.')) return;
        $scope.actionLoading = true;
        $scope.error = '';
        $scope.success = '';

        PaymentService.downgradeSubscription().then(function(result) {
            $scope.actionLoading = false;
            if (result.success) {
                $scope.success = '✅ ' + result.message;
                $scope.planStatus = 'pending_downgrade';
                $scope.downgradeDate = result.downgradeDate;
                updateStatusLabel();
                AuthService.loadPlayer();
            } else {
                $scope.error = result.error || 'Erro ao processar downgrade';
            }
        }).catch(function() {
            $scope.actionLoading = false;
            $scope.error = 'Erro de conexão. Tente novamente.';
        });
    };

    $scope.confirmCancel = function() {
        if (!confirm('Tem certeza que deseja cancelar sua assinatura?\n\nVocê manterá acesso até o fim do período já pago.')) return;
        if (!confirm('Esta ação cancelará a cobrança recorrente. Confirma?')) return;
        $scope.actionLoading = true;
        $scope.error = '';
        $scope.success = '';

        PaymentService.cancelSubscription().then(function(result) {
            $scope.actionLoading = false;
            if (result.success) {
                $scope.success = '✅ ' + result.message;
                $scope.planStatus = 'canceled';
                $scope.planEndDate = result.planEndDate;
                updateStatusLabel();
                AuthService.loadPlayer();
            } else {
                $scope.error = result.error || 'Erro ao cancelar assinatura';
            }
        }).catch(function() {
            $scope.actionLoading = false;
            $scope.error = 'Erro de conexão. Tente novamente.';
        });
    };

    $scope.reactivate = function(planType) {
        $scope.actionLoading = true;
        $scope.error = '';
        $scope.success = '';
        var coupon = $scope.coupon.valid ? $scope.coupon.code : null;

        PaymentService.reactivateSubscription(planType, coupon).then(function(result) {
            $scope.actionLoading = false;
            if (result.success) {
                $scope.success = '🎉 ' + result.message;
                $scope.showReactivate = false;
                if (result.invoiceUrl) {
                    window.open(result.invoiceUrl, '_blank');
                }
                AuthService.loadPlayer().then(function() {
                    $scope.isPremium = PlanService.isPremium();
                    checkSubscriptionStatus();
                });
            } else {
                $scope.error = result.error || 'Erro ao reativar assinatura';
            }
        }).catch(function() {
            $scope.actionLoading = false;
            $scope.error = 'Erro de conexão. Tente novamente.';
        });
    };
});
