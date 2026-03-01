public Object handle(Object payload) {
    Map response = new HashMap()
    def d = String.valueOf((char)0x24)
    def ASAAS_KEY = d + "aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmY0MjRhYjkwLWE3ZjgtNGE0OS04MTQzLTg4MWQ2NTE4Mzc3NTo6JGFhY2hfMmNlYTI4M2QtYmNkYS00OTEyLTkyY2EtNjk3ZTVjNDAwMTQ0"
    def ASAAS_URL = "https://api-sandbox.asaas.com/v3"

    def slurper = new groovy.json.JsonSlurper()
    def input = payload
    def playerId = input.get("playerId")
    def action = input.get("action")

    if (!playerId || !action) {
        response.put("error", "playerId e action sao obrigatorios")
        return response
    }

    // Read player using PlayerManager
    def player = manager.getPlayerManager().findById(playerId)
    if (!player) {
        response.put("error", "Player nao encontrado")
        return response
    }

    // Access public fields directly
    if (player.extra == null) player.extra = new HashMap()
    def plan = player.extra.get("plan")
    if (plan == null) {
        plan = new HashMap()
        player.extra.put("plan", plan)
    }
    def customerId = plan.get("asaas_customer_id")
    def subscriptionId = plan.get("asaas_subscription_id")

    // Helper: save player (insert = upsert)
    def savePlayer = {
        manager.getPlayerManager().insert(player)
    }

    // Helper: parse Unirest response body
    def parseBody = { rawBody ->
        try {
            return slurper.parseText(new String(rawBody, "UTF-8"))
        } catch (Exception e) {
            return slurper.parseText(rawBody.toString())
        }
    }

    // Helper: call Asaas API
    def asaasGet = { String path ->
        def resp = Unirest.get(ASAAS_URL + path)
            .header("access_token", ASAAS_KEY)
            .header("Content-Type", "application/json")
            .asString()
        return [status: resp.getStatus(), body: parseBody(resp.getBody())]
    }
    def asaasPost = { String path, Map bodyData ->
        def resp = Unirest.post(ASAAS_URL + path)
            .header("access_token", ASAAS_KEY)
            .header("Content-Type", "application/json")
            .body(groovy.json.JsonOutput.toJson(bodyData))
            .asString()
        return [status: resp.getStatus(), body: parseBody(resp.getBody())]
    }
    def asaasDelete = { String path ->
        def resp = Unirest.delete(ASAAS_URL + path)
            .header("access_token", ASAAS_KEY)
            .header("Content-Type", "application/json")
            .asString()
        return [status: resp.getStatus(), body: parseBody(resp.getBody())]
    }

    // --- CANCEL ---
    if (action == "cancel") {
        if (!subscriptionId) {
            response.put("error", "Nenhuma assinatura ativa encontrada")
            return response
        }
        def subInfo = asaasGet("/subscriptions/" + subscriptionId)
        def nextDueDate = (subInfo.status == 200 && subInfo.body) ? subInfo.body.nextDueDate : null

        def result = asaasDelete("/subscriptions/" + subscriptionId)
        if (result.status == 200 || result.status == 204) {
            def endDate = nextDueDate ?: new Date().format("yyyy-MM-dd")
            plan.put("plan_status", "canceled")
            plan.put("plan_end_date", endDate)
            plan.put("asaas_subscription_id", null)
            savePlayer()
            response.put("success", true)
            response.put("message", "Assinatura cancelada. Acesso mantido ate " + endDate + ".")
            response.put("planEndDate", endDate)
        } else {
            response.put("error", "Erro ao cancelar assinatura")
        }
        return response

    // --- DOWNGRADE ---
    } else if (action == "downgrade") {
        if (!subscriptionId) {
            response.put("error", "Nenhuma assinatura ativa encontrada")
            return response
        }
        if (plan.get("type") != "premium") {
            response.put("error", "Voce ja esta no plano Standard")
            return response
        }

        def subInfo = asaasGet("/subscriptions/" + subscriptionId)
        def nextDueDate = (subInfo.status == 200 && subInfo.body) ? subInfo.body.nextDueDate : null

        def cancelResult = asaasDelete("/subscriptions/" + subscriptionId)
        if (cancelResult.status != 200 && cancelResult.status != 204) {
            response.put("error", "Erro ao cancelar assinatura Premium")
            return response
        }
        if (!customerId) {
            response.put("error", "Customer ID nao encontrado")
            return response
        }

        def newSub = asaasPost("/subscriptions", [
            customer: customerId,
            billingType: "UNDEFINED",
            value: 29.90,
            cycle: "MONTHLY",
            description: "FitEvolve Standard",
            externalReference: playerId,
            nextDueDate: nextDueDate ?: new Date().format("yyyy-MM-dd")
        ])

        if (newSub.status == 200 || newSub.status == 201) {
            plan.put("pending_plan", "standard")
            plan.put("plan_status", "pending_downgrade")
            plan.put("plan_downgrade_date", nextDueDate)
            plan.put("asaas_subscription_id", newSub.body.id)
            savePlayer()
            response.put("success", true)
            response.put("message", "Downgrade agendado. Premium ativo ate " + (nextDueDate ?: "proximo ciclo") + ".")
            response.put("downgradeDate", nextDueDate)
            response.put("newSubscriptionId", newSub.body.id)
        } else {
            response.put("error", "Erro ao criar assinatura Standard")
        }
        return response

    // --- REACTIVATE ---
    } else if (action == "reactivate") {
        def planType = input.get("planType") ?: "standard"
        def couponCode = input.get("couponCode")

        if (!customerId) {
            response.put("error", "Customer ID nao encontrado. Faca uma nova assinatura.")
            return response
        }

        def value = planType == "premium" ? 179.90 : 29.90

        // Apply coupon if provided
        if (couponCode) {
            def coupon = manager.getJongoConnection().getCollection("coupon__c")
                .findOne("{_id: #, active: true}", couponCode.trim().toUpperCase()).as(Object.class)
            if (coupon) {
                def maxUses = coupon.get("maxUses") != null ? ((Number) coupon.get("maxUses")).intValue() : 0
                def currentUses = coupon.get("currentUses") != null ? ((Number) coupon.get("currentUses")).intValue() : 0
                if (maxUses == 0 || currentUses < maxUses) {
                    def discType = coupon.get("discountType")
                    def discVal = ((Number) coupon.get("discountValue")).doubleValue()
                    if (discType == "PERCENTAGE") {
                        value = Math.max(0, value - (value * discVal / 100))
                    } else {
                        value = Math.max(0, value - discVal)
                    }
                    // Increment usage
                    def incCmd = new HashMap()
                    def incFields = new HashMap()
                    incFields.put("currentUses", 1)
                    incCmd.put(d + "inc", incFields)
                    manager.getJongoConnection().getCollection("coupon__c")
                        .update("{_id: #}", couponCode.trim().toUpperCase())
                        .with(groovy.json.JsonOutput.toJson(incCmd))
                }
            }
        }

        def nextDue = DateUtil.fromKeyword("+7d").format("yyyy-MM-dd")
        def desc = "FitEvolve " + (planType == "premium" ? "Premium" : "Standard")

        def newSub = asaasPost("/subscriptions", [
            customer: customerId,
            billingType: "UNDEFINED",
            value: value,
            cycle: "MONTHLY",
            description: desc,
            externalReference: playerId,
            nextDueDate: nextDue
        ])

        if (newSub.status == 200 || newSub.status == 201) {
            plan.put("type", planType)
            plan.put("plan_status", "active")
            plan.put("pending_plan", null)
            plan.put("plan_end_date", null)
            plan.put("plan_downgrade_date", null)
            plan.put("asaas_subscription_id", newSub.body.id)
            savePlayer()

            // Get invoice URL
            def invoiceUrl = null
            if (newSub.body.id) {
                def payments = asaasGet("/subscriptions/" + newSub.body.id + "/payments")
                if (payments.status == 200 && payments.body?.data) {
                    invoiceUrl = payments.body.data.getAt(0)?.invoiceUrl
                }
            }

            response.put("success", true)
            response.put("message", "Assinatura reativada com sucesso!")
            response.put("invoiceUrl", invoiceUrl)
            response.put("subscriptionId", newSub.body.id)
        } else {
            response.put("error", "Erro ao criar assinatura")
        }
        return response

    // --- STATUS ---
    } else if (action == "status") {
        def result = new HashMap()
        result.put("plan", plan.get("type") ?: "standard")
        result.put("status", plan.get("plan_status") ?: "active")
        result.put("endDate", plan.get("plan_end_date"))
        result.put("pendingPlan", plan.get("pending_plan"))
        result.put("downgradeDate", plan.get("plan_downgrade_date"))
        result.put("subscriptionId", subscriptionId)
        result.put("customerId", customerId)
        // Debug: show raw extra contents
        result.put("_debug_extra_keys", new ArrayList(player.extra.keySet()))

        if (subscriptionId) {
            def subInfo = asaasGet("/subscriptions/" + subscriptionId)
            if (subInfo.status == 200 && subInfo.body) {
                result.put("nextDueDate", subInfo.body.nextDueDate)
                result.put("asaasStatus", subInfo.body.status)
                result.put("value", subInfo.body.value)
            }
        }

        response.put("success", true)
        response.put("subscription", result)
        return response

    } else {
        response.put("error", "Acao invalida. Use: cancel, downgrade, reactivate, status")
        return response
    }
}
