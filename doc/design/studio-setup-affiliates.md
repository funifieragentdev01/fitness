# Setup no Studio — Programa de Afiliados

Ricardo, siga estes passos para ativar o programa de afiliados.

---

## 1. Criar Coleção `affiliate__c`

No Studio → Database → criar documentos na coleção `affiliate__c`.

### Exemplo para teste:
```json
{
  "_id": "TESTE20",
  "name": "Influenciador Teste",
  "email": "teste@email.com",
  "instagram": "@teste",
  "asaas_wallet_id": "SEU_WALLET_ID_AQUI",
  "discount_pct": 20,
  "commission_pct": 15,
  "active": true,
  "total_sales": 0,
  "total_revenue": 0,
  "created": { "$date": "2026-03-11T00:00:00Z" }
}
```

> **Importante:** O `_id` é o código do cupom que o influenciador divulga. Sempre em UPPERCASE.

---

## 2. Atualizar Endpoint: `validate_coupon`

**Studio:** `/studio/public` → editar `validate_coupon`

Substituir o script inteiro por:

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
    
    // 2. Check affiliate__c (affiliate coupons)
    Object affiliate = manager.getJongoConnection().getCollection("affiliate__c")
        .findOne("{_id: #, active: true}", code).as(Object.class);
    
    if (affiliate != null) {
        Map<String, Object> affMap = (Map<String, Object>) affiliate;
        response.put("valid", true);
        response.put("discountType", "PERCENTAGE");
        response.put("discountValue", affMap.get("discount_pct"));
        response.put("description", "Cupom de " + affMap.get("name"));
        response.put("isAffiliate", true);
        return response;
    }
    
    // Not found
    response.put("valid", false);
    response.put("error", "Cupom inválido");
    return response;
}
```

---

## 3. Atualizar Endpoint: `create_subscription`

**Studio:** `/studio/public` → editar `create_subscription`

Substituir o script inteiro por:

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
    String affiliateWalletId = null;
    double affiliateCommissionPct = 0;
    String affiliateCode = null;
    
    if (couponCode != null && !couponCode.trim().isEmpty()) {
        couponCode = couponCode.trim().toUpperCase();
        
        // Try normal coupon first
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
        } else {
            // Try affiliate coupon
            Object affiliate = manager.getJongoConnection().getCollection("affiliate__c")
                .findOne("{_id: #, active: true}", couponCode).as(Object.class);
            
            if (affiliate != null) {
                Map<String, Object> affMap = (Map<String, Object>) affiliate;
                double discountPct = ((Number) affMap.get("discount_pct")).doubleValue();
                discount = value * (discountPct / 100.0);
                affiliateWalletId = (String) affMap.get("asaas_wallet_id");
                affiliateCommissionPct = ((Number) affMap.get("commission_pct")).doubleValue();
                affiliateCode = couponCode;
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
    
    // Add split if affiliate coupon
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
    if (affiliateCode != null) {
        player.extra.put("affiliate_code", affiliateCode);
    }
    manager.getPlayerManager().update(player);
    
    // Update affiliate stats
    if (affiliateCode != null) {
        double originalValue = "premium".equals(planType) ? 179.90 : 29.90;
        manager.getJongoConnection().getCollection("affiliate__c")
            .update("{_id: #}", affiliateCode)
            .with("{$inc: {total_sales: 1, total_revenue: #}}", originalValue);
    }
    
    response.put("success", true);
    response.put("subscriptionId", subscriptionId);
    response.put("invoiceUrl", invoiceUrl);
    response.put("customerId", customerId);
    response.put("value", value);
    response.put("discount", discount);
    return response;
}
```

---

## 4. Criar Endpoint Público: `affiliate_stats`

**Studio:** `/studio/public` → Novo Endpoint

| Campo | Valor |
|-------|-------|
| _id (slug) | `affiliate_stats` |
| Título | Estatísticas do Afiliado |
| Método | POST |
| Active | true |

**Script:**
```java
public Object handle(Object payload) {
    Map<String, Object> response = new HashMap<>();
    
    String playerId = (String) payload.get("playerId");
    if (playerId == null || playerId.trim().isEmpty()) {
        response.put("error", "playerId é obrigatório");
        return response;
    }
    
    // Get player to find affiliate code
    Player player = manager.getPlayerManager().findById(playerId);
    if (player == null || player.extra == null || player.extra.get("affiliate_code") == null) {
        response.put("error", "Jogador não é afiliado");
        return response;
    }
    
    String code = (String) player.extra.get("affiliate_code");
    
    // Get affiliate data
    Object affiliate = manager.getJongoConnection().getCollection("affiliate__c")
        .findOne("{_id: #, active: true}", code).as(Object.class);
    
    if (affiliate == null) {
        response.put("error", "Afiliado não encontrado");
        return response;
    }
    
    Map<String, Object> affMap = (Map<String, Object>) affiliate;
    
    double totalRevenue = affMap.get("total_revenue") != null ? ((Number) affMap.get("total_revenue")).doubleValue() : 0;
    double commissionPct = affMap.get("commission_pct") != null ? ((Number) affMap.get("commission_pct")).doubleValue() : 0;
    
    response.put("code", code);
    response.put("name", affMap.get("name"));
    response.put("discount_pct", affMap.get("discount_pct"));
    response.put("commission_pct", commissionPct);
    response.put("total_sales", affMap.get("total_sales"));
    response.put("total_revenue", totalRevenue);
    response.put("commission_earned", totalRevenue * commissionPct / 100.0);
    return response;
}
```

**URL pública:** `POST https://service2.funifier.com/v3/pub/699a6c64434ba0101760c2df/affiliate_stats`

---

## 5. Resumo das Mudanças

### `validate_coupon`
- **Adicionado:** Fallback para `affiliate__c` quando cupom não encontrado em `coupon__c`
- Retorna `isAffiliate: true` e `description: "Cupom de [nome]"` para afiliados

### `create_subscription`
- **Adicionado:** Lookup em `affiliate__c` quando cupom não é de `coupon__c`
- **Adicionado:** Split payment no Asaas com `walletId` e `percentualValue` do afiliado
- **Adicionado:** Incremento de `total_sales` e `total_revenue` no afiliado
- **Adicionado:** Salva `affiliate_code` no `player.extra`

### Frontend
- **profile.html**: Seção "Meu Programa de Afiliados" quando player tem `extra.affiliate_code`
- **profile.js**: Carrega dados do afiliado via `affiliate_stats` endpoint, botões copiar/compartilhar
- **style.css**: Estilos do card de afiliado (grid de stats, código em monospace)

### Novo Endpoint
- **`affiliate_stats`**: Retorna dados do afiliado para o dashboard no perfil

---

## 5. Como Deployar

1. No Studio, abrir endpoint `validate_coupon` → substituir script pelo da seção 2
2. No Studio, abrir endpoint `create_subscription` → substituir script pelo da seção 3
3. Criar documento(s) de teste em `affiliate__c` (seção 1)
4. Testar no app

---

## 6. Checklist de Teste

- [ ] Cupom normal (`FITEVOLVE20`) continua funcionando
- [ ] Cupom de afiliado (`TESTE20`) valida corretamente
- [ ] Assinatura com cupom de afiliado cria split no Asaas
- [ ] `total_sales` incrementado no `affiliate__c`
- [ ] `affiliate_code` salvo no `player.extra`
- [ ] Cupom de afiliado inativo (`active: false`) é rejeitado
