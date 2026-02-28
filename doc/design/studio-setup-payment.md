# Setup no Studio — Payment Asaas

Ricardo, siga estes passos no Studio para configurar os endpoints de pagamento.

---

## 1. Criar Endpoint Público: `validate_coupon`

**Studio:** `/studio/public` → Novo Endpoint

| Campo | Valor |
|-------|-------|
| _id (slug) | `validate_coupon` |
| Título | Validar Cupom |
| Método | POST |
| Active | true |

**Script:**
```java
public Object handle(Object payload) {
    Map<String, Object> response = new HashMap<>();
    
    String code = (String) payload.get("couponCode");
    if (code == null || code.trim().isEmpty()) {
        response.put("valid", false);
        response.put("error", "Código do cupom é obrigatório");
        return response;
    }
    
    code = code.trim().toUpperCase();
    Object coupon = manager.getJongoConnection().getCollection("coupon__c")
        .findOne("{_id: #, active: true}", code).as(Object.class);
    
    if (coupon == null) {
        response.put("valid", false);
        response.put("error", "Cupom inválido");
        return response;
    }
    
    // Check max uses
    int maxUses = coupon.get("maxUses") != null ? ((Number) coupon.get("maxUses")).intValue() : 0;
    int usedCount = coupon.get("usedCount") != null ? ((Number) coupon.get("usedCount")).intValue() : 0;
    if (maxUses > 0 && usedCount >= maxUses) {
        response.put("valid", false);
        response.put("error", "Cupom esgotado");
        return response;
    }
    
    response.put("valid", true);
    response.put("discountType", coupon.get("discountType"));
    response.put("discountValue", coupon.get("discountValue"));
    response.put("description", coupon.get("description"));
    return response;
}
```

**URL pública:** `POST https://service2.funifier.com/v3/pub/699a6c64434ba0101760c2df/validate_coupon`

---

## 2. Criar Endpoint Público: `create_subscription`

**Studio:** `/studio/public` → Novo Endpoint

| Campo | Valor |
|-------|-------|
| _id (slug) | `create_subscription` |
| Título | Criar Assinatura Asaas |
| Método | POST |
| Active | true |

**Script:**
```java
public Object handle(Object payload) {
    Map<String, Object> response = new HashMap<>();
    String ASAAS_KEY = "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmY0MjRhYjkwLWE3ZjgtNGE0OS04MTQzLTg4MWQ2NTE4Mzc3NTo6JGFhY2hfMmNlYTI4M2QtYmNkYS00OTEyLTkyY2EtNjk3ZTVjNDAwMTQ0";
    String ASAAS_URL = "https://api-sandbox.asaas.com";
    String APP_URL = "https://fitness-funifier.netlify.app/app";
    
    String playerId = (String) payload.get("playerId");
    String planType = (String) payload.get("planType");
    String couponCode = (String) payload.get("couponCode");
    
    if (playerId == null || planType == null) {
        response.put("error", "playerId e planType são obrigatórios");
        return response;
    }
    
    // Get plan value
    double value = "premium".equals(planType) ? 179.90 : 29.90;
    String planName = "premium".equals(planType) ? "FitEvolve Premium" : "FitEvolve Standard";
    
    // Apply coupon discount
    double discount = 0;
    if (couponCode != null && !couponCode.trim().isEmpty()) {
        couponCode = couponCode.trim().toUpperCase();
        Object coupon = manager.getJongoConnection().getCollection("coupon__c")
            .findOne("{_id: #, active: true}", couponCode).as(Object.class);
        if (coupon != null) {
            int maxUses = coupon.get("maxUses") != null ? ((Number) coupon.get("maxUses")).intValue() : 0;
            int usedCount = coupon.get("usedCount") != null ? ((Number) coupon.get("usedCount")).intValue() : 0;
            if (maxUses == 0 || usedCount < maxUses) {
                String discountType = (String) coupon.get("discountType");
                double discountValue = ((Number) coupon.get("discountValue")).doubleValue();
                if ("PERCENTAGE".equals(discountType)) {
                    discount = value * (discountValue / 100.0);
                } else {
                    discount = discountValue;
                }
                // Increment used count
                manager.getJongoConnection().getCollection("coupon__c")
                    .update("{_id: #}", couponCode)
                    .with("{$inc: {usedCount: 1}}");
            }
        }
    }
    
    value = Math.max(0, value - discount);
    
    // Get player info
    Player player = manager.getPlayerManager().findById(playerId);
    if (player == null) {
        response.put("error", "Jogador não encontrado");
        return response;
    }
    
    String playerName = player.name != null ? player.name : playerId;
    String playerEmail = player.email != null ? player.email : playerId + "@fitevolve.app";
    String cpfCnpj = player.extra != null && player.extra.get("cpf") != null ? (String) player.extra.get("cpf") : "00000000000";
    
    // Check if player already has Asaas customer ID
    String customerId = null;
    if (player.extra != null && player.extra.get("asaas_customer_id") != null) {
        customerId = (String) player.extra.get("asaas_customer_id");
    }
    
    // Create Asaas customer if needed
    if (customerId == null) {
        HashMap customerData = new HashMap();
        customerData.put("name", playerName);
        customerData.put("email", playerEmail);
        customerData.put("cpfCnpj", cpfCnpj);
        customerData.put("externalReference", playerId);
        
        HttpResponse<String> custResp = Unirest.post(ASAAS_URL + "/v3/customers")
            .header("Content-Type", "application/json")
            .header("access_token", ASAAS_KEY)
            .body(JsonUtil.toJson(customerData))
            .asString();
        
        if (custResp.getStatus() == 200) {
            Map<String, Object> custResult = JsonUtil.fromJsonToMap(custResp.getBody());
            customerId = (String) custResult.get("id");
        } else {
            response.put("error", "Erro ao criar cliente no Asaas");
            response.put("details", custResp.getBody());
            return response;
        }
    }
    
    // Create subscription
    HashMap subData = new HashMap();
    subData.put("customer", customerId);
    subData.put("billingType", "UNDEFINED");
    subData.put("value", value);
    subData.put("nextDueDate", DateUtil.format(DateUtil.add(new Date(), 4, 7), "yyyy-MM-dd"));
    subData.put("cycle", "MONTHLY");
    subData.put("description", planName);
    subData.put("externalReference", playerId);
    
    // Callback URL
    HashMap callback = new HashMap();
    callback.put("successUrl", APP_URL + "/#/dashboard?payment=success&plan=" + planType);
    callback.put("autoRedirect", true);
    subData.put("callback", callback);
    
    HttpResponse<String> subResp = Unirest.post(ASAAS_URL + "/v3/subscriptions")
        .header("Content-Type", "application/json")
        .header("access_token", ASAAS_KEY)
        .body(JsonUtil.toJson(subData))
        .asString();
    
    if (subResp.getStatus() != 200) {
        response.put("error", "Erro ao criar assinatura");
        response.put("details", subResp.getBody());
        return response;
    }
    
    Map<String, Object> subResult = JsonUtil.fromJsonToMap(subResp.getBody());
    String subscriptionId = (String) subResult.get("id");
    
    // Get first payment to get invoiceUrl
    HttpResponse<String> payResp = Unirest.get(ASAAS_URL + "/v3/subscriptions/" + subscriptionId + "/payments")
        .header("access_token", ASAAS_KEY)
        .asString();
    
    String invoiceUrl = null;
    if (payResp.getStatus() == 200) {
        Map<String, Object> payResult = JsonUtil.fromJsonToMap(payResp.getBody());
        List<Map> payments = (List<Map>) payResult.get("data");
        if (payments != null && payments.size() > 0) {
            invoiceUrl = (String) payments.get(0).get("invoiceUrl");
        }
    }
    
    // Save Asaas IDs to player.extra
    if (player.extra == null) player.extra = new HashMap();
    player.extra.put("asaas_customer_id", customerId);
    player.extra.put("asaas_subscription_id", subscriptionId);
    player.extra.put("pending_plan", planType);
    manager.getPlayerManager().update(player);
    
    response.put("success", true);
    response.put("subscriptionId", subscriptionId);
    response.put("invoiceUrl", invoiceUrl);
    response.put("customerId", customerId);
    response.put("value", value);
    response.put("discount", discount);
    return response;
}
```

**URL pública:** `POST https://service2.funifier.com/v3/pub/699a6c64434ba0101760c2df/create_subscription`

---

## 3. Criar Endpoint Público: `asaas_webhook`

**Studio:** `/studio/public` → Novo Endpoint

| Campo | Valor |
|-------|-------|
| _id (slug) | `asaas_webhook` |
| Título | Webhook Asaas |
| Método | POST |
| Active | true |

**Script:**
```java
public Object handle(Object payload) {
    Map<String, Object> response = new HashMap<>();
    
    String event = (String) payload.get("event");
    Map<String, Object> payment = (Map<String, Object>) payload.get("payment");
    
    if (event == null || payment == null) {
        response.put("status", "ignored");
        return response;
    }
    
    // Get subscription to find player
    String subscriptionId = (String) payment.get("subscription");
    String externalReference = (String) payment.get("externalReference");
    
    if (externalReference == null && subscriptionId != null) {
        // Try to find player by subscription ID
        org.jongo.MongoCollection players = manager.getJongoConnection().getCollection("player");
        Object playerObj = players.findOne("{\"extra.asaas_subscription_id\": #}", subscriptionId).as(Object.class);
        if (playerObj != null) {
            externalReference = (String) ((Map) playerObj).get("_id");
        }
    }
    
    if (externalReference == null) {
        response.put("status", "player_not_found");
        return response;
    }
    
    Player player = manager.getPlayerManager().findById(externalReference);
    if (player == null) {
        response.put("status", "player_not_found");
        return response;
    }
    
    if (player.extra == null) player.extra = new HashMap();
    
    String pendingPlan = player.extra.get("pending_plan") != null ? (String) player.extra.get("pending_plan") : "standard";
    
    if ("PAYMENT_CONFIRMED".equals(event) || "PAYMENT_RECEIVED".equals(event)) {
        // Activate plan
        Map<String, Object> plan = new HashMap<>();
        plan.put("type", pendingPlan);
        plan.put("changesUsed", new HashMap<>());
        player.extra.put("plan", plan);
        player.extra.put("plan_status", "active");
        player.extra.remove("pending_plan");
        manager.getPlayerManager().update(player);
        
        // Log subscription event
        HashMap logData = new HashMap();
        logData.put("_id", externalReference + "_sub_" + DateUtil.format(new Date(), "yyyyMMddHHmmss"));
        logData.put("playerId", externalReference);
        logData.put("event", event);
        logData.put("plan", pendingPlan);
        logData.put("date", new Date());
        logData.put("paymentId", payment.get("id"));
        manager.getJongoConnection().getCollection("subscription_log__c").save(logData);
        
        response.put("status", "plan_activated");
        response.put("plan", pendingPlan);
        
    } else if ("PAYMENT_OVERDUE".equals(event)) {
        player.extra.put("plan_status", "overdue");
        manager.getPlayerManager().update(player);
        response.put("status", "marked_overdue");
        
    } else if ("PAYMENT_DELETED".equals(event) || "PAYMENT_REFUNDED".equals(event)) {
        player.extra.put("plan_status", "canceled");
        Map<String, Object> plan = new HashMap<>();
        plan.put("type", "standard");
        plan.put("changesUsed", new HashMap<>());
        player.extra.put("plan", plan);
        manager.getPlayerManager().update(player);
        response.put("status", "plan_deactivated");
    } else {
        response.put("status", "event_ignored");
        response.put("event", event);
    }
    
    return response;
}
```

**URL pública (para configurar no Asaas Webhooks):**
`POST https://service2.funifier.com/v3/pub/699a6c64434ba0101760c2df/asaas_webhook`

---

## 4. Criar Coleção `coupon__c`

No Studio, vá em **Database** e crie alguns cupons de teste:

```json
{
    "_id": "FITEVOLVE20",
    "description": "20% de desconto no primeiro mês",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "maxUses": 100,
    "usedCount": 0,
    "active": true,
    "plans": ["standard", "premium"]
}
```

```json
{
    "_id": "INFLUENCER100",
    "description": "100% grátis - Influencer",
    "discountType": "PERCENTAGE",
    "discountValue": 100,
    "maxUses": 5,
    "usedCount": 0,
    "active": true,
    "plans": ["premium"]
}
```

```json
{
    "_id": "LAUNCH10",
    "description": "R$10 de desconto - Lançamento",
    "discountType": "FIXED",
    "discountValue": 10,
    "maxUses": 500,
    "usedCount": 0,
    "active": true,
    "plans": ["standard", "premium"]
}
```

---

## 5. Configurar Webhook no Asaas

Na conta Asaas Sandbox:
1. Vá em **Integrações → Webhooks**
2. Adicione nova URL: `https://service2.funifier.com/v3/pub/699a6c64434ba0101760c2df/asaas_webhook`
3. Selecione eventos:
   - PAYMENT_CONFIRMED
   - PAYMENT_RECEIVED
   - PAYMENT_OVERDUE
   - PAYMENT_DELETED
   - PAYMENT_REFUNDED
4. Salve

---

## Resumo de URLs

| Endpoint | URL |
|----------|-----|
| Validar cupom | `POST .../v3/pub/699a6c64434ba0101760c2df/validate_coupon` |
| Criar assinatura | `POST .../v3/pub/699a6c64434ba0101760c2df/create_subscription` |
| Webhook Asaas | `POST .../v3/pub/699a6c64434ba0101760c2df/asaas_webhook` |
