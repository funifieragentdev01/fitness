public Object handle(Object payload) {
    Map response = new HashMap()
    def d = String.valueOf((char)0x24)
    def ASAAS_KEY = d + 'aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmY0MjRhYjkwLWE3ZjgtNGE0OS04MTQzLTg4MWQ2NTE4Mzc3NTo6JGFhY2hfMmNlYTI4M2QtYmNkYS00OTEyLTkyY2EtNjk3ZTVjNDAwMTQ0'
    def ASAAS_URL = 'https://api-sandbox.asaas.com/v3'
    def slurper = new groovy.json.JsonSlurper()

    def playerId = payload.get('playerId')
    def action = payload.get('action')

    if (!playerId || !action) {
        response.put('error', 'playerId e action sao obrigatorios')
        return response
    }

    def player = manager.getPlayerManager().findById(playerId)
    if (!player) {
        response.put('error', 'Player nao encontrado')
        return response
    }

    if (player.extra == null) player.extra = new HashMap()
    def plan = player.extra.get('plan')
    if (plan == null) {
        plan = new HashMap()
        player.extra.put('plan', plan)
    }
    def rawCustId = plan.get('asaas_customer_id') ?: player.extra.get('asaas_customer_id')
    def rawSubId = plan.get('asaas_subscription_id') ?: player.extra.get('asaas_subscription_id')
    String customerId = rawCustId != null ? rawCustId.toString() : null
    String subscriptionId = rawSubId != null ? rawSubId.toString() : null

    // --- CANCEL ---
    if (action == 'cancel') {
        if (!subscriptionId) {
            response.put('error', 'Nenhuma assinatura ativa encontrada')
            return response
        }
        // Get subscription info
        def subResp = Unirest.get(ASAAS_URL + '/subscriptions/' + subscriptionId).header('access_token', ASAAS_KEY).asString()
        def subInfo = slurper.parseText(subResp.getBody().toString())
        def nextDueDate = subInfo.nextDueDate

        // Delete subscription
        def delResp = Unirest.delete(ASAAS_URL + '/subscriptions/' + subscriptionId).header('access_token', ASAAS_KEY).asString()
        def delStatus = delResp.getStatus()

        if (delStatus == 200 || delStatus == 204) {
            def endDate = nextDueDate ?: new Date().format('yyyy-MM-dd')
            plan.put('plan_status', 'canceled')
            plan.put('plan_end_date', endDate)
            plan.put('asaas_subscription_id', null)
            manager.getPlayerManager().insert(player)
            response.put('success', true)
            response.put('message', 'Assinatura cancelada. Acesso mantido ate ' + endDate + '.')
            response.put('planEndDate', endDate)
        } else {
            response.put('error', 'Erro ao cancelar assinatura')
        }
        return response

    // --- DOWNGRADE ---
    } else if (action == 'downgrade') {
        if (!subscriptionId) {
            response.put('error', 'Nenhuma assinatura ativa encontrada')
            return response
        }
        if (plan.get('type') != 'premium') {
            response.put('error', 'Voce ja esta no plano Standard')
            return response
        }

        // Get next due date
        def subResp = Unirest.get(ASAAS_URL + '/subscriptions/' + subscriptionId).header('access_token', ASAAS_KEY).asString()
        def subInfo = slurper.parseText(subResp.getBody().toString())
        def nextDueDate = subInfo.nextDueDate

        // Cancel premium
        Unirest.delete(ASAAS_URL + '/subscriptions/' + subscriptionId).header('access_token', ASAAS_KEY).asString()

        if (!customerId) {
            response.put('error', 'Customer ID nao encontrado')
            return response
        }

        // Create standard subscription
        def newSubBody = groovy.json.JsonOutput.toJson([
            customer: customerId,
            billingType: 'UNDEFINED',
            value: 29.90,
            cycle: 'MONTHLY',
            description: 'FitEvolve Standard',
            externalReference: playerId,
            nextDueDate: nextDueDate ?: new Date().format('yyyy-MM-dd')
        ])
        def newSubResp = Unirest.post(ASAAS_URL + '/subscriptions').header('access_token', ASAAS_KEY).header('Content-Type', 'application/json').body(newSubBody).asString()
        def newSub = slurper.parseText(newSubResp.getBody().toString())
        def newSubStatus = newSubResp.getStatus()

        if (newSubStatus == 200 || newSubStatus == 201) {
            plan.put('pending_plan', 'standard')
            plan.put('plan_status', 'pending_downgrade')
            plan.put('plan_downgrade_date', nextDueDate)
            plan.put('asaas_subscription_id', newSub.id)
            manager.getPlayerManager().insert(player)
            response.put('success', true)
            response.put('message', 'Downgrade agendado. Premium ativo ate ' + (nextDueDate ?: 'proximo ciclo') + '.')
            response.put('downgradeDate', nextDueDate)
            response.put('newSubscriptionId', newSub.id)
        } else {
            response.put('error', 'Erro ao criar assinatura Standard')
        }
        return response

    // --- REACTIVATE ---
    } else if (action == 'reactivate') {
        def planType = payload.get('planType') ?: 'standard'
        def couponCode = payload.get('couponCode')

        if (!customerId) {
            response.put('error', 'Customer ID nao encontrado. Faca uma nova assinatura.')
            return response
        }

        def value = planType == 'premium' ? 179.90 : 29.90

        if (couponCode) {
            def coupon = manager.getJongoConnection().getCollection('coupon__c')
                .findOne('{_id: #, active: true}', couponCode.trim().toUpperCase()).as(Object.class)
            if (coupon) {
                def maxUses = coupon.get('maxUses') != null ? ((Number) coupon.get('maxUses')).intValue() : 0
                def currentUses = coupon.get('currentUses') != null ? ((Number) coupon.get('currentUses')).intValue() : 0
                if (maxUses == 0 || currentUses < maxUses) {
                    def discType = coupon.get('discountType')
                    def discVal = ((Number) coupon.get('discountValue')).doubleValue()
                    if (discType == 'PERCENTAGE') {
                        value = Math.max(0, value - (value * discVal / 100))
                    } else {
                        value = Math.max(0, value - discVal)
                    }
                    def incCmd = new HashMap()
                    def incFields = new HashMap()
                    incFields.put('currentUses', 1)
                    incCmd.put(d + 'inc', incFields)
                    manager.getJongoConnection().getCollection('coupon__c')
                        .update('{_id: #}', couponCode.trim().toUpperCase())
                        .with(groovy.json.JsonOutput.toJson(incCmd))
                }
            }
        }

        def nextDue = DateUtil.fromKeyword('+7d').format('yyyy-MM-dd')
        def desc = 'FitEvolve ' + (planType == 'premium' ? 'Premium' : 'Standard')

        def newSubBody = groovy.json.JsonOutput.toJson([
            customer: customerId,
            billingType: 'UNDEFINED',
            value: value,
            cycle: 'MONTHLY',
            description: desc,
            externalReference: playerId,
            nextDueDate: nextDue
        ])
        def newSubResp = Unirest.post(ASAAS_URL + '/subscriptions').header('access_token', ASAAS_KEY).header('Content-Type', 'application/json').body(newSubBody).asString()
        def newSub = slurper.parseText(newSubResp.getBody().toString())
        def newSubStatus = newSubResp.getStatus()

        if (newSubStatus == 200 || newSubStatus == 201) {
            plan.put('type', planType)
            plan.put('plan_status', 'active')
            plan.put('pending_plan', null)
            plan.put('plan_end_date', null)
            plan.put('plan_downgrade_date', null)
            plan.put('asaas_subscription_id', newSub.id)
            manager.getPlayerManager().insert(player)

            // Get invoice URL
            def invoiceUrl = null
            if (newSub.id) {
                def payResp = Unirest.get(ASAAS_URL + '/subscriptions/' + newSub.id + '/payments').header('access_token', ASAAS_KEY).asString()
                def payData = slurper.parseText(payResp.getBody().toString())
                if (payData.data && payData.data.size() > 0) {
                    invoiceUrl = payData.data.get(0).invoiceUrl
                }
            }

            response.put('success', true)
            response.put('message', 'Assinatura reativada com sucesso!')
            response.put('invoiceUrl', invoiceUrl)
            response.put('subscriptionId', newSub.id)
        } else {
            response.put('error', 'Erro ao criar assinatura')
        }
        return response

    // --- STATUS ---
    } else if (action == 'status') {
        def result = new HashMap()
        result.put('plan', plan.get('type') ?: 'standard')
        result.put('status', plan.get('plan_status') ?: 'active')
        result.put('endDate', plan.get('plan_end_date'))
        result.put('pendingPlan', plan.get('pending_plan'))
        result.put('downgradeDate', plan.get('plan_downgrade_date'))
        result.put('subscriptionId', subscriptionId)
        result.put('customerId', customerId)

        if (subscriptionId) {
            def subResp = Unirest.get(ASAAS_URL + '/subscriptions/' + subscriptionId).header('access_token', ASAAS_KEY).asString()
            def subInfo = slurper.parseText(subResp.getBody().toString())
            result.put('nextDueDate', subInfo.nextDueDate)
            result.put('asaasStatus', subInfo.status)
            result.put('value', subInfo.value)
        }

        response.put('success', true)
        response.put('subscription', result)
        return response

    } else {
        response.put('error', 'Acao invalida. Use: cancel, downgrade, reactivate, status')
        return response
    }
}
