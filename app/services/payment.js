// PaymentService — Asaas payment gateway integration
angular.module('fitness').factory('PaymentService', function($rootScope, PlanService) {
    var service = {
        /**
         * Get payment link URL for a plan type
         */
        getPaymentLink: function(planType) {
            if (!CONFIG.ASAAS_PAYMENT_LINKS) return null;
            return CONFIG.ASAAS_PAYMENT_LINKS[planType] || null;
        },

        /**
         * Open Asaas checkout in new tab
         * The checkout is hosted by Asaas — handles Pix, card, boleto
         */
        checkout: function(planType) {
            var url = service.getPaymentLink(planType);
            if (!url) {
                $rootScope.error = 'Link de pagamento não configurado.';
                return false;
            }
            window.open(url, '_blank');
            return true;
        },

        /**
         * Check if payment is configured
         */
        isConfigured: function() {
            return !!(CONFIG.ASAAS_PAYMENT_LINKS &&
                (CONFIG.ASAAS_PAYMENT_LINKS.standard || CONFIG.ASAAS_PAYMENT_LINKS.premium));
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
