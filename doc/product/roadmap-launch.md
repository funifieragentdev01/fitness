# Roadmap de Lançamento — Orvya (Go-to-Market)

> **Data:** 2026-03-11 | **Responsável:** Jarvis | **Aprovado por:** Ricardo

---

## Status Atual (v3.10.5) — Pronto

- ✅ Onboarding inteligente com foto corporal
- ✅ Plano alimentar + treino gerado por IA
- ✅ Foto do prato com análise IA (GPT-4 Vision)
- ✅ Gamificação completa (XP, níveis, badges, streaks)
- ✅ Dashboard de evolução (timeline fotos, gráficos)
- ✅ Sistema de hidratação
- ✅ Coach IA com voz (WebRTC + OpenAI Realtime API)
- ✅ Desafio 90 dias
- ✅ Pagamento Asaas (sandbox)
- ✅ Landing page
- ✅ Instagram @orvyafit criado

---

## Itens de Lançamento — Ordem de Execução

| # | Item | Status | Complexidade | Estimativa |
|---|------|--------|-------------|------------|
| 1 | **Segurança das chaves** — mover OpenAI key para proxy endpoints Funifier, remover do frontend | 🔄 Em progresso | Média | 2 dias |
| 2 | **Fix VAD do Coach** — ajustar `turn_detection.threshold` (0.7-0.8) e `silence_duration_ms` (800-1000ms) | ⬜ Pendente | Baixa | 0.5 dia |
| 3 | **Termos de Uso e Política de Privacidade** — LGPD compliance, disclaimers de saúde/IA | ⬜ Pendente | Média | 1 dia |
| 4 | **Domínio orvya.app** — configurar custom domain no Netlify + SSL (Ricardo configura DNS) | ⬜ Pendente (aguardando DNS) | Baixa | 10 min |
| 5 | **Pagamento Asaas em produção** — sair do sandbox, chave de produção, testar Pix + cartão | ⬜ Pendente | Média | 1 dia |
| 6 | **Programa de Afiliados** — cupom de desconto, comissão configurável por influencer, split Asaas | ⬜ Pendente | Alta | 1-2 semanas |
| 7 | **Notificações Push** — PWA push para refeições, treinos, streaks em risco | ⬜ Pendente | Alta | 1 semana |

### Regra: implementar e testar um item por vez, em sequência.

---

## Detalhamento dos Itens

### 1. Segurança das Chaves

**Problema:** `CONFIG.OPENAI_KEY` está no `config.js` que vai no deploy — qualquer pessoa pode ver no DevTools.

**Solução:**
- Criar proxy endpoints no Funifier (`/v3/pub/{apiKey}/...`) para todas as chamadas que usam OpenAI
- Mover `AiService` para usar esses proxies em vez de chamar OpenAI diretamente
- Remover `OPENAI_KEY` do `config.js`
- Auditoria OWASP básica: headers de segurança, rate limiting

**Endpoints a criar:**
- `ai_chat` — chat completions (geração de planos)
- `ai_vision` — análise de foto do prato / foto corporal
- `coach_session` — já existe (ephemeral key para Realtime API)

### 2. Fix VAD do Coach

**Problema:** Coach para de falar com ruídos do ambiente (VAD muito sensível).

**Solução:**
- `turn_detection.threshold`: 0.5 → 0.7 (menos sensível a ruído)
- `silence_duration_ms`: 500 → 800ms (espera mais antes de "ceder a vez")
- `prefix_padding_ms`: aumentar para ignorar ruídos curtos
- Opção push-to-talk como alternativa em ambientes barulhentos

### 3. Termos de Uso e Política de Privacidade

**Conteúdo necessário:**
- Termos de uso do app
- Política de privacidade (LGPD)
- Disclaimer: "Não substitui profissional de saúde" (nutricionista/médico/personal)
- Consentimento para fotos corporais (dados sensíveis)
- Política de cancelamento/reembolso
- Aceitação obrigatória no signup

### 4. Domínio orvya.app

**Ricardo configura DNS:**
- `CNAME` → `fitness-funifier.netlify.app` (para `orvya.app` e `www.orvya.app`)

**Jarvis configura Netlify:**
- Custom domain no site
- SSL automático (Let's Encrypt)

### 5. Pagamento Asaas em Produção

**Ações:**
- Criar conta Asaas de produção (se ainda não tem)
- Obter API key de produção
- Trocar `ASAAS_ENV: 'sandbox'` → `'production'`
- Testar cobrança real (Pix + cartão)
- Configurar webhooks de produção
- Implementar trial de 7 dias real

### 6. Programa de Afiliados

**Modelo:**
- Cada influencer tem conta Asaas própria
- Ao cadastrar influencer no sistema: definir % desconto do cupom + % comissão
- Split de pagamento nativo do Asaas
- Influencer compartilha link/cupom com seguidores
- Dashboard para influencer acompanhar ganhos

**Implementação:**
- Coleção `affiliate__c`: código, nome, asaas_account, desconto_pct, comissao_pct, status
- Tela admin para Ricardo cadastrar influencers
- Aplicar cupom no signup/checkout
- Split automático no Asaas ao criar cobrança
- Dashboard do influencer (login separado ou link mágico)

### 7. Notificações Push

**Momentos:**
- Horário de refeição (conforme plano)
- Lembrete de treino
- Hidratação periódica
- Streak em risco ("Você tem 5h para manter seu streak!")
- Badge desbloqueado
- Level up

**Implementação:**
- Service Worker + Push API (PWA)
- VAPID keys (já tem no config)
- Funifier Triggers para disparar notificações server-side

---

## Pós-Lançamento (Roadmap Futuro)

| Fase | Features |
|------|----------|
| V1.1 (1-2 meses) | Coach IA chat melhorado, ajustes dinâmicos, desafios semanais, loja virtual |
| V1.2 (2-3 meses) | Canal WhatsApp, compartilhamento social, programa de indicação gamificado |
| V2.0 (4-6 meses) | Avatar 3D do coach, integração wearables, coaching humano premium |
| V3.0 (6+ meses) | Análise de exames laboratoriais, correção de postura em tempo real, expansão LATAM |

---

*Documento criado em 2026-03-11. Atualizar conforme itens forem concluídos.*
