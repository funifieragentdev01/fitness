# Subscription Management Design

## Overview
Manage downgrades, cancellations, and reactivations via Asaas API through Funifier public endpoint.

## Actions

### 1. Downgrade (Premium → Standard)
- Cancel current Premium subscription on Asaas
- Create new Standard subscription with `nextDueDate` = end of current billing cycle
- Set `player.extra.plan.pending_plan = "standard"`, `plan_downgrade_date = endDate`
- Keep Premium access until cycle ends
- Asaas webhook on Standard payment → switch plan to standard

### 2. Cancel Subscription
- Cancel subscription on Asaas (DELETE /v3/subscriptions/{id})
- Set `player.extra.plan.plan_status = "canceled"`, `plan_end_date = endDate`
- Keep access until cycle ends
- After end date → show reactivation screen

### 3. Reactivate
- Create new subscription on Asaas (same as initial signup)
- Reset plan status to active

### 4. Delete Account
- Cancel subscription on Asaas first
- Then delete player (existing flow)
- Soft-delete approach: flag player, delete after 30 days

## Endpoint: `manage_subscription`
- **Method**: POST
- **Input**: `{ playerId, action: "downgrade|cancel|reactivate", planType?, couponCode? }`
- **Output**: `{ success, message, invoiceUrl? (for reactivate) }`

## Frontend: Plan Management Section in Plans page
- Show current plan status, next billing date
- Downgrade button (if Premium)
- Cancel button
- Reactivate button (if canceled)

## Player Extra Fields
```json
{
  "plan": {
    "type": "standard|premium",
    "plan_status": "active|canceled|pending_downgrade",
    "plan_end_date": "2026-04-01",
    "pending_plan": "standard",
    "plan_downgrade_date": "2026-04-01",
    "asaas_customer_id": "cus_xxx",
    "asaas_subscription_id": "sub_xxx"
  }
}
```
