# Payment Gateway — Asaas Integration

## Arquitetura

### Fluxo de Pagamento
1. Usuário faz signup no FitEvolve → player criado no Funifier
2. Usuário clica "Assinar" → Frontend chama Asaas API (sandbox)
3. Asaas cria customer + subscription → retorna `invoiceUrl`
4. Frontend redireciona para `invoiceUrl` (checkout hospedado Asaas)
5. Usuário paga via Pix, cartão ou boleto
6. Asaas envia webhook → Funifier trigger atualiza `player.extra.plan`

### Endpoints Asaas (Sandbox)
- Base: `https://api-sandbox.asaas.com`
- Auth: Header `access_token: <key>`
- `POST /v3/customers` — criar cliente (name, cpfCnpj, email)
- `POST /v3/subscriptions` — criar assinatura (customer, billingType, value, nextDueDate, cycle)
- `GET /v3/subscriptions/{id}/payments` — listar cobranças da assinatura
- Cada payment tem `invoiceUrl` — checkout hospedado com Pix/Cartão/Boleto

### Planos
| Plano | Valor | Cycle | billingType |
|-------|-------|-------|-------------|
| Standard | R$29,90/mês | MONTHLY | UNDEFINED |
| Premium | R$179,90/mês | MONTHLY | UNDEFINED |

### billingType: UNDEFINED
- Permite que o cliente escolha a forma de pagamento no checkout
- Pix, cartão de crédito, boleto — tudo no mesmo link
- Simplifica frontend (não precisa coletar dados de cartão)

### Trial (7 dias)
- `nextDueDate` = hoje + 7 dias
- Primeira cobrança só vence após trial
- Se cancelar antes, não paga

### Dados no Funifier
- `player.extra.plan` = "standard" | "premium" | null
- `player.extra.asaas_customer_id` = "cus_xxx"
- `player.extra.asaas_subscription_id` = "sub_xxx"
- `player.extra.plan_status` = "active" | "overdue" | "canceled"

### Webhook (Fase 2)
- Asaas envia POST para endpoint público no Funifier
- Eventos: PAYMENT_CONFIRMED, PAYMENT_OVERDUE, PAYMENT_DELETED
- Trigger no Funifier atualiza player.extra.plan_status

## Fase 1 (Agora) — Frontend Only
1. PaymentService no AngularJS
2. Modal de checkout com seleção de plano
3. Chamada direta à API Asaas (sandbox)
4. Redireciona para invoiceUrl
5. Salva asaas_customer_id e subscription_id no player.extra

## Fase 2 (Depois) — Webhook + Automação
1. Endpoint público no Funifier para receber webhooks
2. Trigger para atualizar plan_status automaticamente
3. Migrar para produção (trocar API key + URL)

## Testes Sandbox
- Customer criado: cus_000007619597
- Subscription criada: sub_gw1d7bj3t7ulh6m5
- Invoice URL funcional: https://sandbox.asaas.com/i/rqrgf6m476g5sl0p
