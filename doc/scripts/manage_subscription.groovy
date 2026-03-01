public Object handle(Object payload) {
    def d = String.valueOf((char)0x24)
    def ASAAS_KEY = d + 'aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmY0MjRhYjkwLWE3ZjgtNGE0OS04MTQzLTg4MWQ2NTE4Mzc3NTo6JGFhY2hfMmNlYTI4M2QtYmNkYS00OTEyLTkyY2EtNjk3ZTVjNDAwMTQ0'
    def ASAAS_URL = 'https://api-sandbox.asaas.com/v3'

    String playerId = payload.get('playerId')
    String action = payload.get('action')
    if (!playerId || !action) return [error: 'playerId e action sao obrigatorios']

    def player = manager.getPlayerManager().findById(playerId)
    if (!player) return [error: 'Player nao encontrado']

    if (player.extra == null) player.extra = new java.util.HashMap()
    def plan = player.extra.get('plan')
    if (plan == null) {
        plan = new java.util.HashMap()
        player.extra.put('plan', plan)
    }
    def rawCustId = plan.get('asaas_customer_id') ?: player.extra.get('asaas_customer_id')
    def rawSubId = plan.get('asaas_subscription_id') ?: player.extra.get('asaas_subscription_id')
    String customerId = rawCustId != null ? rawCustId.toString() : null
    String subscriptionId = rawSubId != null ? rawSubId.toString() : null

    // --- CANCEL ---
    if (action == 'cancel') {
        if (!subscriptionId) return [error: 'Nenhuma assinatura ativa encontrada']

        String subUrl = ASAAS_URL + '/subscriptions/' + subscriptionId
        def subResp = Unirest.get(subUrl).header('access_token', ASAAS_KEY).asString()
        Map subInfo = JsonUtil.fromJsonToMap(subResp.getBody().toString())
        String nextDueDate = subInfo.get('nextDueDate')

        def delResp = Unirest.delete(subUrl).header('access_token', ASAAS_KEY).asString()
        int delStatus = delResp.getStatus()

        if (delStatus == 200 || delStatus == 204) {
            String endDate = nextDueDate ?: new java.util.Date().format('yyyy-MM-dd')
            plan.put('plan_status', 'canceled')
            plan.put('plan_end_date', endDate)
            plan.put('asaas_subscription_id', null)
            manager.getPlayerManager().insert(player)
            return [success: true, message: 'Assinatura cancelada. Acesso mantido ate ' + endDate + '.', planEndDate: endDate]
        }
        return [error: 'Erro ao cancelar assinatura']

    // --- DOWNGRADE ---
    } else if (action == 'downgrade') {
        if (!subscriptionId) return [error: 'Nenhuma assinatura ativa encontrada']
        if (plan.get('type') != 'premium') return [error: 'Voce ja esta no plano Standard']

        String subUrl = ASAAS_URL + '/subscriptions/' + subscriptionId
        def subResp = Unirest.get(subUrl).header('access_token', ASAAS_KEY).asString()
        Map subInfo = JsonUtil.fromJsonToMap(subResp.getBody().toString())
        String nextDueDate = subInfo.get('nextDueDate')

        Unirest.delete(subUrl).header('access_token', ASAAS_KEY).asString()

        if (!customerId) return [error: 'Customer ID nao encontrado']

        String newSubBody = JsonUtil.toJson([
            customer: customerId,
            billingType: 'UNDEFINED',
            value: 29.90,
            cycle: 'MONTHLY',
            description: 'FitEvolve Standard',
            externalReference: playerId,
            nextDueDate: nextDueDate ?: new java.util.Date().format('yyyy-MM-dd')
        ])
        def newSubResp = Unirest.post(ASAAS_URL + '/subscriptions').header('access_token', ASAAS_KEY).header('Content-Type', 'application/json').body(newSubBody).asString()
        Map newSub = JsonUtil.fromJsonToMap(newSubResp.getBody().toString())
        int newSubStatus = newSubResp.getStatus()

        if (newSubStatus == 200 || newSubStatus == 201) {
            plan.put('pending_plan', 'standard')
            plan.put('plan_status', 'pending_downgrade')
            plan.put('plan_downgrade_date', nextDueDate)
            plan.put('asaas_subscription_id', newSub.get('id'))
            manager.getPlayerManager().insert(player)
            return [success: true, message: 'Downgrade agendado. Premium ativo ate ' + (nextDueDate ?: 'proximo ciclo') + '.', downgradeDate: nextDueDate, newSubscriptionId: newSub.get('id')]
        }
        return [error: 'Erro ao criar assinatura Standard']

    // --- REACTIVATE ---
    } else if (action == 'reactivate') {
        String planType = payload.get('planType') ?: 'standard'
        String couponCode = payload.get('couponCode')

        if (!customerId) return [error: 'Customer ID nao encontrado. Faca uma nova assinatura.']

        double value = planType == 'premium' ? 179.90 : 29.90

        if (couponCode) {
            def coupon = manager.getJongoConnection().getCollection('coupon__c')
                .findOne('{_id: #, active: true}', couponCode.trim().toUpperCase()).as(Object.class)
            if (coupon) {
                int maxUses = coupon.get('maxUses') != null ? ((Number) coupon.get('maxUses')).intValue() : 0
                int currentUses = coupon.get('currentUses') != null ? ((Number) coupon.get('currentUses')).intValue() : 0
                if (maxUses == 0 || currentUses < maxUses) {
                    String discType = coupon.get('discountType')
                    double discVal = ((Number) coupon.get('discountValue')).doubleValue()
                    if (discType == 'PERCENTAGE') {
                        value = Math.max(0, value - (value * discVal / 100))
                    } else {
                        value = Math.max(0, value - discVal)
                    }
                    def incCmd = new java.util.HashMap()
                    def incFields = new java.util.HashMap()
                    incFields.put('currentUses', 1)
                    incCmd.put(d + 'inc', incFields)
                    manager.getJongoConnection().getCollection('coupon__c')
                        .update('{_id: #}', couponCode.trim().toUpperCase())
                        .with(JsonUtil.toJson(incCmd))
                }
            }
        }

        String nextDue = DateUtil.fromKeyword('+7d').format('yyyy-MM-dd')
        String desc = 'FitEvolve ' + (planType == 'premium' ? 'Premium' : 'Standard')

        String newSubBody = JsonUtil.toJson([
            customer: customerId,
            billingType: 'UNDEFINED',
            value: value,
            cycle: 'MONTHLY',
            description: desc,
            externalReference: playerId,
            nextDueDate: nextDue
        ])
        def newSubResp = Unirest.post(ASAAS_URL + '/subscriptions').header('access_token', ASAAS_KEY).header('Content-Type', 'application/json').body(newSubBody).asString()
        Map newSub = JsonUtil.fromJsonToMap(newSubResp.getBody().toString())
        int newSubStatus = newSubResp.getStatus()

        if (newSubStatus == 200 || newSubStatus == 201) {
            plan.put('type', planType)
            plan.put('plan_status', 'active')
            plan.put('pending_plan', null)
            plan.put('plan_end_date', null)
            plan.put('plan_downgrade_date', null)
            plan.put('asaas_subscription_id', newSub.get('id'))
            manager.getPlayerManager().insert(player)

            String invoiceUrl = null
            String newSubId = newSub.get('id')
            if (newSubId != null) {
                def payResp = Unirest.get(ASAAS_URL + '/subscriptions/' + newSubId + '/payments').header('access_token', ASAAS_KEY).asString()
                Map payData = JsonUtil.fromJsonToMap(payResp.getBody().toString())
                def dataList = payData.get('data')
                if (dataList != null && dataList.size() > 0) {
                    invoiceUrl = ((Map) dataList.get(0)).get('invoiceUrl')
                }
            }

            return [success: true, message: 'Assinatura reativada com sucesso!', invoiceUrl: invoiceUrl, subscriptionId: newSubId]
        }
        return [error: 'Erro ao criar assinatura']

    // --- STATUS ---
    } else if (action == 'status') {
        Map result = new java.util.HashMap()
        result.put('plan', plan.get('type') ?: 'standard')
        result.put('status', plan.get('plan_status') ?: 'active')
        result.put('endDate', plan.get('plan_end_date'))
        result.put('pendingPlan', plan.get('pending_plan'))
        result.put('downgradeDate', plan.get('plan_downgrade_date'))
        result.put('subscriptionId', subscriptionId)
        result.put('customerId', customerId)

        if (subscriptionId != null) {
            String url = ASAAS_URL + '/subscriptions/' + subscriptionId
            def resp = Unirest.get(url).header('access_token', ASAAS_KEY).asString()
            Map subInfo = JsonUtil.fromJsonToMap(resp.getBody().toString())
            result.put('nextDueDate', subInfo.get('nextDueDate'))
            result.put('asaasStatus', subInfo.get('status'))
            result.put('value', subInfo.get('value'))
        }

        return [success: true, subscription: result]

    } else {
        return [error: 'Acao invalida. Use: cancel, downgrade, reactivate, status']
    }
}
