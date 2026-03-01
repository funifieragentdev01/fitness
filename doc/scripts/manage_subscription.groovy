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
    def customerId = plan.get("asaas_customer_id") ?: player.extra.get("asaas_customer_id")
    def subscriptionId = plan.get("asaas_subscription_id") ?: player.extra.get("asaas_subscription_id")

    // Helper: save player (insert = upsert)
    def savePlayer = {
        manager.getPlayerManager().insert(player)
    }

    // Helper: call Asaas API using URL connection (no library dependency issues)
    def asaasCall = { String method, String path, String bodyJson = null ->
        def url = new java.net.URL(ASAAS_URL + path)
        def conn = url.openConnection()
        conn.setRequestMethod(method)
        conn.setRequestProperty("access_token", ASAAS_KEY)
        conn.setRequestProperty("Content-Type", "application/json")
        conn.setConnectTimeout(4000)
        conn.setReadTimeout(4000)
        if (bodyJson != null) {
            conn.setDoOutput(true)
            def os = conn.getOutputStream()
            os.write(bodyJson.getBytes("UTF-8"))
            os.close()
        }
        def statusCode = conn.getResponseCode()
        def is = (statusCode >= 200 && statusCode < 400) ? conn.getInputStream() : conn.getErrorStream()
        def bodyStr = ""
        if (is != null) {
            def reader = new BufferedReader(new java.io.InputStreamReader(is, "UTF-8"))
            def sb = new StringBuffer()
            def line
            while ((line = reader.readLine()) != null) {
                sb.append(line)
            }
            reader.close()
            bodyStr = sb.toString()
        }
        def body = bodyStr.length() > 0 ? slurper.parseText(bodyStr) : [:]
        return [status: statusCode, body: body]
    }
    def asaasGet = { String path -> asaasCall("GET", path) }
    def asaasPost = { String path, Map bodyData -> asaasCall("POST", path, groovy.json.JsonOutput.toJson(bodyData)) }
    def asaasDelete = { String path -> asaasCall("DELETE", path) }

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
        // end status

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
