// PaymentService — Asaas payment gateway via Funifier public endpoints
angular.module('fitness').factory('PaymentService', function($http, $rootScope, AuthService) {
    var PUB_URL = CONFIG.API + '/v3/pub/' + CONFIG.API_KEY;

    var service = {
        /**
         * Validate a coupon code
         * @returns Promise<{ valid, discountType, discountValue, description, error }>
         */
        validateCoupon: function(couponCode) {
            return $http.post(PUB_URL + '/validate_coupon', {
                couponCode: couponCode
            }).then(function(res) { return res.data; });
        },

        /**
         * Create subscription via Funifier public endpoint
         * Funifier calls Asaas server-side (no CORS, no key exposure)
         * @returns Promise<{ success, invoiceUrl, subscriptionId, value, discount, error }>
         */
        createSubscription: function(planType, couponCode) {
            var playerId = AuthService.getUser();
            return $http.post(PUB_URL + '/create_subscription', {
                playerId: playerId,
                planType: planType,
                couponCode: couponCode || null
            }).then(function(res) { return res.data; });
        },

        /**
         * Open Asaas checkout for a plan
         * Creates subscription server-side, then redirects to invoiceUrl
         */
        checkout: function(planType, couponCode) {
            $rootScope.loading = true;
            return service.createSubscription(planType, couponCode).then(function(result) {
                $rootScope.loading = false;
                if (result.error) {
                    $rootScope.error = result.error;
                    return false;
                }
                if (result.invoiceUrl) {
                    window.open(result.invoiceUrl, '_blank');
                    return true;
                }
                $rootScope.error = 'Não foi possível gerar o link de pagamento.';
                return false;
            }).catch(function(err) {
                $rootScope.loading = false;
                $rootScope.error = 'Erro ao processar pagamento. Tente novamente.';
                return false;
            });
        },

        /**
         * Check if payment was completed (called on dashboard load)
         * Reads URL params and refreshes player data
         */
        checkPaymentReturn: function() {
            var hash = window.location.hash || '';
            if (hash.indexOf('payment=success') > -1) {
                // Extract plan from URL
                var planMatch = hash.match(/plan=(\w+)/);
                var plan = planMatch ? planMatch[1] : null;

                // Clean URL
                var cleanHash = hash.replace(/[?&]payment=success/, '').replace(/[?&]plan=\w+/, '');
                if (cleanHash !== hash) {
                    window.location.hash = cleanHash;
                }

                // Refresh player data to get updated plan
                if (plan) {
                    $rootScope.success = '🎉 Pagamento confirmado! Seu plano ' +
                        (plan === 'premium' ? 'Premium 👑' : 'Standard ⭐') +
                        ' está sendo ativado.';
                } else {
                    $rootScope.success = '🎉 Pagamento realizado com sucesso!';
                }

                // Reload player to get updated extra
                AuthService.loadPlayer();
                return true;
            }
            return false;
        },

        /**
         * Calculate price with discount
         */
        calculatePrice: function(planType, discountType, discountValue) {
            var basePrice = planType === 'premium' ? 179.90 : 29.90;
            if (!discountType || !discountValue) return basePrice;
            if (discountType === 'PERCENTAGE') {
                return Math.max(0, basePrice - (basePrice * discountValue / 100));
            }
            return Math.max(0, basePrice - discountValue);
        },

        /**
         * Get environment label
         */
        getEnvLabel: function() {
            return CONFIG.ASAAS_ENV === 'production' ? '' : '🧪 Sandbox';
        }
    };

    return service;
});
