# Feature: Duração do Desconto (RECURRING vs FIRST_ONLY)

## Visão Geral

Permite configurar se o desconto de cupom (simples ou afiliado) é aplicado:
- **RECURRING** — em todas as mensalidades (comportamento original, padrão)
- **FIRST_ONLY** — apenas na primeira parcela

A comissão do afiliado (split) é **sempre indefinida**, independente do `discount_duration`.

---

## Alterações no Schema

### `coupon__c` — Novo campo
```json
{
  "_id": "FITEVOLVE20",
  "discount_duration": "RECURRING",  // "RECURRING" (default) | "FIRST_ONLY"
  ...
}
```

### `affiliate__c` — Novo campo
```json
{
  "_id": "MARIA20",
  "discount_duration": "RECURRING",  // "RECURRING" (default) | "FIRST_ONLY"
  ...
}
```

---

## Alterações nos Endpoints

### `validate_coupon` — Retorna `discountDuration`
- Novo campo na resposta: `discountDuration: "RECURRING"` ou `"FIRST_ONLY"`
- Default (se campo ausente no documento): `"RECURRING"`

### `create_subscription` — Lógica condicional
- **RECURRING**: valor reduzido na subscription (comportamento original)
- **FIRST_ONLY**: subscription criada com valor cheio → primeiro payment atualizado com desconto via `PUT /v3/payments/{id}`

---

## Alterações no Frontend

### Página de Planos (`plans.html`)
Quando cupom é FIRST_ONLY:
- Preço mostra "R$ XX,XX **na 1ª parcela**" (em vez de "/mês")
- Abaixo: "Depois R$ XX,XX/mês"
- Badge do cupom: "(apenas 1ª parcela)"

---

## Scripts dos Endpoints (para colar no Studio)

### `validate_coupon` (atualizado)

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
    
    // 1. Check coupon__c (normal coupons)
    Object coupon = manager.getJongoConnection().getCollection("coupon__c")
        .findOne("{_id: #, active: true}", code).as(Object.class);
    
    if (coupon != null) {
        Map<String, Object> cMap = (Map<String, Object>) coupon;
        int maxUses = cMap.get("maxUses") != null ? ((Number) cMap.get("maxUses")).intValue() : 0;
        int usedCount = cMap.get("usedCount") != null ? ((Number) cMap.get("usedCount")).intValue() : 0;
        if (maxUses > 0 && usedCount >= maxUses) {
            response.put("valid", false);
            response.put("error", "Cupom esgotado");
            return response;
        }
        
        String duration = cMap.get("discount_duration") != null ? (String) cMap.get("discount_duration") : "RECURRING";
        
        response.put("valid", true);
        response.put("discountType", cMap.get("discountType"));
        response.put("discountValue", cMap.get("discountValue"));
        response.put("description", cMap.get("description"));
        response.put("discountDuration", duration);
        return response;
    }
    
    // 2. Check affiliate__c (affiliate coupons)
    Object affiliate = manager.getJongoConnection().getCollection("affiliate__c")
        .findOne("{_id: #, active: true}", code).as(Object.class);
    
    if (affiliate != null) {
        Map<String, Object> affMap = (Map<String, Object>) affiliate;
        String duration = affMap.get("discount_duration") != null ? (String) affMap.get("discount_duration") : "RECURRING";
        
        response.put("valid", true);
        response.put("discountType", "PERCENTAGE");
        response.put("discountValue", affMap.get("discount_pct"));
        response.put("description", "Cupom de " + affMap.get("name"));
        response.put("isAffiliate", true);
        response.put("discountDuration", duration);
        return response;
    }
    
    // Not found
    response.put("valid", false);
    response.put("error", "Cupom inválido");
    return response;
}
```

### `create_subscription` (atualizado)

```java
public Object handle(Object payload) {
    Map<String, Object> response = new HashMap<>();
    String ASAAS_KEY = String.valueOf((char)0x24) + "aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjFlNmMxMzIzLWRiN2UtNDRhNC05YzMzLWY5N2VkZWYzMzQzMjo6JGFhY2hfODFiNmE5ZmUtMzYwNi00YzdjLWEzZjEtOTc0MjM4YTMxYmEw";
    String ASAAS_URL = "https://api-sandbox.asaas.com";
    String APP_URL = "https://orvya.app/app";
    
    String playerId = (String) payload.get("playerId");
    String planType = (String) payload.get("planType");
    String couponCode = (String) payload.get("couponCode");
    
    if (playerId == null || planType == null) {
        response.put("error", "playerId e planType são obrigatórios");
        return response;
    }
    
    // Get plan value
    double originalValue = "premium".equals(planType) ? 179.90 : 39.90;
    double value = originalValue;
    String planName = "premium".equals(planType) ? "Orvya Premium" : "Orvya Standard";
    
    // Apply coupon discount
    double discount = 0;
    String discountDuration = "RECURRING";
    String affiliateWalletId = null;
    double affiliateCommissionPct = 0;
    String affiliateCode = null;
    
    if (couponCode != null && !couponCode.trim().isEmpty()) {
        couponCode = couponCode.trim().toUpperCase();
        
        // Try normal coupon first
        Object coupon = manager.getJongoConnection().getCollection("coupon__c")
            .findOne("{_id: #, active: true}", couponCode).as(Object.class);
        
        if (coupon != null) {
            Map<String, Object> cMap = (Map<String, Object>) coupon;
            int maxUses = cMap.get("maxUses") != null ? ((Number) cMap.get("maxUses")).intValue() : 0;
            int usedCount = cMap.get("usedCount") != null ? ((Number) cMap.get("usedCount")).intValue() : 0;
            if (maxUses == 0 || usedCount < maxUses) {
                String discountType = (String) cMap.get("discountType");
                double discountValue = ((Number) cMap.get("discountValue")).doubleValue();
                if ("PERCENTAGE".equals(discountType)) {
                    discount = value * (discountValue / 100.0);
                } else {
                    discount = discountValue;
                }
                discountDuration = cMap.get("discount_duration") != null ? (String) cMap.get("discount_duration") : "RECURRING";
                // Increment used count
                manager.getJongoConnection().getCollection("coupon__c")
                    .update("{_id: #}", couponCode)
                    .with("{$inc: {usedCount: 1}}");
            }
        } else {
            // Try affiliate coupon
            Object affiliate = manager.getJongoConnection().getCollection("affiliate__c")
                .findOne("{_id: #, active: true}", couponCode).as(Object.class);
            
            if (affiliate != null) {
                Map<String, Object> affMap = (Map<String, Object>) affiliate;
                double discountPct = ((Number) affMap.get("discount_pct")).doubleValue();
                discount = value * (discountPct / 100.0);
                discountDuration = affMap.get("discount_duration") != null ? (String) affMap.get("discount_duration") : "RECURRING";
                affiliateWalletId = (String) affMap.get("asaas_wallet_id");
                affiliateCommissionPct = ((Number) affMap.get("commission_pct")).doubleValue();
                affiliateCode = couponCode;
            }
        }
    }
    
    // For RECURRING: reduce subscription value
    // For FIRST_ONLY: subscription at full price, discount on first payment only
    double subscriptionValue = originalValue;
    if ("RECURRING".equals(discountDuration) && discount > 0) {
        subscriptionValue = Math.max(0, originalValue - discount);
    }
    
    // Get player info
    Player player = manager.getPlayerManager().findById(playerId);
    if (player == null) {
        response.put("error", "Jogador não encontrado");
        return response;
    }
    
    String playerName = player.name != null ? player.name : playerId;
    String playerEmail = player.email != null ? player.email : playerId + "@orvya.app";
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
    
    // Create subscription (always at subscriptionValue — full or discounted depending on duration)
    HashMap subData = new HashMap();
    subData.put("customer", customerId);
    subData.put("billingType", "UNDEFINED");
    subData.put("value", subscriptionValue);
    subData.put("nextDueDate", DateUtil.format(DateUtil.add(new Date(), 4, 7), "yyyy-MM-dd"));
    subData.put("cycle", "MONTHLY");
    subData.put("description", planName);
    subData.put("externalReference", playerId);
    
    // Callback URL
    HashMap callback = new HashMap();
    callback.put("successUrl", APP_URL + "/#/dashboard?payment=success&plan=" + planType);
    callback.put("autoRedirect", true);
    subData.put("callback", callback);
    
    // Add split if affiliate coupon (split is ALWAYS indefinite regardless of discount_duration)
    if (affiliateWalletId != null) {
        List<Map> splitList = new ArrayList<>();
        Map<String, Object> splitItem = new HashMap<>();
        splitItem.put("walletId", affiliateWalletId);
        splitItem.put("percentualValue", affiliateCommissionPct);
        splitList.add(splitItem);
        subData.put("split", splitList);
    }
    
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
    
    // Get first payment
    HttpResponse<String> payResp = Unirest.get(ASAAS_URL + "/v3/subscriptions/" + subscriptionId + "/payments")
        .header("access_token", ASAAS_KEY)
        .asString();
    
    String invoiceUrl = null;
    String firstPaymentId = null;
    if (payResp.getStatus() == 200) {
        Map<String, Object> payResult = JsonUtil.fromJsonToMap(payResp.getBody());
        List<Map> payments = (List<Map>) payResult.get("data");
        if (payments != null && payments.size() > 0) {
            invoiceUrl = (String) payments.get(0).get("invoiceUrl");
            firstPaymentId = (String) payments.get(0).get("id");
        }
    }
    
    // For FIRST_ONLY: update first payment value with discount
    if ("FIRST_ONLY".equals(discountDuration) && discount > 0 && firstPaymentId != null) {
        double firstPaymentValue = Math.max(0, originalValue - discount);
        HashMap payUpdate = new HashMap();
        payUpdate.put("value", firstPaymentValue);
        
        Unirest.put(ASAAS_URL + "/v3/payments/" + firstPaymentId)
            .header("Content-Type", "application/json")
            .header("access_token", ASAAS_KEY)
            .body(JsonUtil.toJson(payUpdate))
            .asString();
    }
    
    // Save Asaas IDs to player.extra
    if (player.extra == null) player.extra = new HashMap();
    player.extra.put("asaas_customer_id", customerId);
    player.extra.put("asaas_subscription_id", subscriptionId);
    player.extra.put("pending_plan", planType);
    if (affiliateCode != null) {
        player.extra.put("affiliate_code", affiliateCode);
    }
    manager.getPlayerManager().update(player);
    
    // Update affiliate stats
    if (affiliateCode != null) {
        manager.getJongoConnection().getCollection("affiliate__c")
            .update("{_id: #}", affiliateCode)
            .with("{$inc: {total_sales: 1, total_revenue: #}}", originalValue);
    }
    
    double finalFirstValue = "FIRST_ONLY".equals(discountDuration) && discount > 0 ? Math.max(0, originalValue - discount) : subscriptionValue;
    
    response.put("success", true);
    response.put("subscriptionId", subscriptionId);
    response.put("invoiceUrl", invoiceUrl);
    response.put("customerId", customerId);
    response.put("value", finalFirstValue);
    response.put("subscriptionValue", subscriptionValue);
    response.put("discount", discount);
    response.put("discountDuration", discountDuration);
    return response;
}
```

---

## Páginas Customizadas do Studio

Ver `studio-pages-coupons-affiliates.md` para os JSONs completos das páginas.
