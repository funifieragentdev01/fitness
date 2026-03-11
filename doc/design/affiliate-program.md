# Programa de Afiliados — Design

## Visão Geral

Influenciadores recebem um código de cupom pessoal. Quando um usuário usa o código:
1. Recebe desconto na assinatura (configurável por influenciador)
2. O influenciador recebe comissão via **Asaas Split Payment** (configurável)

Ricardo gerencia tudo via Funifier Studio — sem dashboard de influenciador por enquanto.

---

## Coleção `affiliate__c`

Cada documento = um influenciador ativo.

```json
{
  "_id": "MARIA20",
  "name": "Maria Silva",
  "email": "maria@email.com",
  "instagram": "@mariasilva",
  "asaas_wallet_id": "xxx-xxx-xxx-xxx",
  "discount_pct": 20,
  "commission_pct": 15,
  "active": true,
  "total_sales": 0,
  "total_revenue": 0,
  "created": { "$date": "2026-03-11T00:00:00Z" }
}
```

| Campo | Descrição |
|-------|-----------|
| `_id` | Código do cupom (uppercase). Ex: `MARIA20` |
| `name` | Nome do influenciador |
| `email` | Email de contato |
| `instagram` | Handle social (opcional) |
| `asaas_wallet_id` | walletId da conta Asaas do influenciador |
| `discount_pct` | % de desconto para o usuário |
| `commission_pct` | % de comissão no valor líquido (via split) |
| `active` | Se o cupom está ativo |
| `total_sales` | Contador de vendas (incrementado automaticamente) |
| `total_revenue` | Soma dos valores gerados (incrementado automaticamente) |

---

## Fluxo

### 1. Validação do Cupom

```
Usuário digita código → validate_coupon endpoint
  1. Busca em coupon__c (cupons normais)
  2. Se não encontrou → busca em affiliate__c (afiliados)
  3. Retorna desconto + flag isAffiliate
```

### 2. Criação da Assinatura

```
Usuário clica "Assinar" → create_subscription endpoint
  1. Aplica desconto do cupom/afiliado
  2. Se afiliado → adiciona split array na chamada Asaas
  3. Incrementa total_sales e total_revenue do afiliado
  4. Salva affiliate_code no player.extra
```

### 3. Split Payment (Asaas)

O Asaas cuida da distribuição automática:
- Cada pagamento mensal → Asaas desconta suas taxas → aplica split no valor líquido
- A comissão vai direto para o `walletId` do influenciador
- **Não** incluir o próprio walletId no split

---

## Como Obter o walletId do Influenciador

O influenciador precisa ter conta própria no Asaas. Para obter o walletId:

### Opção 1: Influenciador fornece
Na conta Asaas do influenciador: **Minha Conta → Dados da Conta** → copiar o Wallet ID.

### Opção 2: Via API (se tiver a API key do influenciador)
```bash
curl -s "https://api.asaas.com/v3/wallets" \
  -H "access_token: API_KEY_DO_INFLUENCIADOR"
```

### Opção 3: Criar subconta (alternativa futura)
Se preferir gerenciar tudo numa conta, pode criar subcontas via API. O walletId é retornado na criação.

---

## Como Adicionar um Novo Afiliado

1. Abrir **Funifier Studio** → Database → `affiliate__c`
2. Criar novo documento com o schema acima
3. O `_id` será o código do cupom (ex: `MARIA20`)
4. Preencher `asaas_wallet_id` com o wallet do influenciador
5. Definir `discount_pct` e `commission_pct`
6. O cupom funciona imediatamente

---

## Alterações no Frontend

**Nenhuma.** O frontend já:
- Mostra `couponInfo.description` quando cupom é válido
- Passa `couponCode` na criação da assinatura
- O backend retorna `description: "Cupom de Maria Silva"` para afiliados

---

## Testes

### 1. Criar afiliado de teste no Studio
```json
{
  "_id": "TESTE20",
  "name": "Influenciador Teste",
  "email": "teste@email.com",
  "asaas_wallet_id": "WALLET_ID_TESTE",
  "discount_pct": 20,
  "commission_pct": 15,
  "active": true,
  "total_sales": 0,
  "total_revenue": 0
}
```

### 2. Validar cupom
```bash
curl -X POST "https://service2.funifier.com/v3/pub/699a6c64434ba0101760c2df/validate_coupon" \
  -H "Content-Type: application/json" \
  -d '{"couponCode": "TESTE20"}'
```
Esperado: `{ valid: true, discountValue: 20, isAffiliate: true, description: "Cupom de Influenciador Teste" }`

### 3. Criar assinatura com cupom de afiliado
Usar o app normalmente, digitar `TESTE20` como cupom. Verificar:
- Desconto aplicado
- Split configurado no Asaas (verificar no painel)
- `total_sales` incrementado em `affiliate__c`
- `affiliate_code` salvo no `player.extra`

### 4. Verificar split no Asaas
No painel Asaas Sandbox, verificar a assinatura criada → aba Split → deve mostrar o walletId e percentual.
