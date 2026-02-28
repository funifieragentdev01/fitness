# Public Endpoints — Asaas Integration

## Endpoints Necessários

### 1. `create_subscription` (POST)
Frontend chama → cria customer + subscription no Asaas → retorna invoiceUrl
- Input: `{ playerId, planType, couponCode? }`
- Fluxo:
  1. Busca player no Funifier
  2. Valida cupom se informado (busca em `coupon__c`)
  3. Cria customer no Asaas (ou reutiliza se já existe)
  4. Cria subscription com valor (com desconto se cupom válido)
  5. Busca payment da subscription → pega invoiceUrl
  6. Salva asaas IDs no player.extra
  7. Retorna { invoiceUrl, subscriptionId }

### 2. `asaas_webhook` (POST)
Asaas chama quando pagamento é confirmado/cancelado
- Input: Asaas webhook payload
- Eventos tratados:
  - PAYMENT_CONFIRMED / PAYMENT_RECEIVED → ativa plano
  - PAYMENT_OVERDUE → marca como inadimplente
  - PAYMENT_DELETED / PAYMENT_REFUNDED → desativa plano
- Busca player pelo `externalReference` da subscription
- Atualiza `player.extra.plan.type` e `plan_status`

### 3. `validate_coupon` (POST)
Frontend chama para validar cupom antes do checkout
- Input: `{ couponCode }`
- Output: `{ valid, discountType, discountValue, description }`

## Coleção `coupon__c`
```json
{
  "_id": "FITEVOLVE20",
  "description": "20% de desconto",
  "discountType": "PERCENTAGE",  // PERCENTAGE ou FIXED
  "discountValue": 20,
  "maxUses": 100,
  "usedCount": 0,
  "active": true,
  "validUntil": { "$date": "2026-12-31T23:59:59Z" },
  "plans": ["standard", "premium"],  // null = todos
  "created": { "$date": "2026-02-28T00:00:00Z" }
}
```

## URL pública dos endpoints
`https://service2.funifier.com/v3/pub/699a6c64434ba0101760c2df/{slug}`
