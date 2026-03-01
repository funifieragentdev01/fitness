# Coach IA — Planejamento de Execução

## Visão
Simular a experiência de ligar para um personal trainer humano. O usuário abre o Coach, vê um avatar, e pode conversar por **texto, voz ou vídeo** — como uma chamada do WhatsApp. O coach tem acesso completo ao perfil, planos e histórico do usuário, e pode executar ações (alterar treino, ajustar dieta, etc.) durante a conversa.

## Arquitetura Recomendada

### 🏆 Opção Principal: OpenAI Realtime API + WebRTC

**Por que esta é a melhor opção:**
- **Latência mínima** (~300ms) — WebRTC é peer-to-peer, áudio vai direto do browser pro modelo
- **Interrupção nativa** (VAD) — o modelo detecta quando o usuário começa a falar e para automaticamente
- **Tool calling nativo** — o modelo pode chamar ferramentas durante a conversa de voz
- **Speech-to-speech nativo** — não precisa de pipeline STT → LLM → TTS separados
- **Sideband WebSocket** — server-side pode monitorar, injetar contexto e executar tools com segurança
- Já temos API key da OpenAI

**Modelos disponíveis:**
- `gpt-realtime` — melhor qualidade, $4/1M input, $16/1M output (texto), áudio mais caro
- `gpt-realtime-mini` — mais barato, $0.60/1M input, $2.40/1M output, boa qualidade
- **Recomendação: `gpt-realtime-mini`** para produção (custo ~10x menor, qualidade suficiente)

**Vozes disponíveis:** alloy, ash, ballad, coral, echo, fable, marin, sage, shimmer, verse

### Alternativas Descartadas

| Opção | Problema |
|-------|----------|
| Gemini 2.5 Flash + TTS separado | Pipeline STT→LLM→TTS adiciona 1-3s latência. Sem interrupção nativa. |
| Claude + TTS | Claude não tem API de voz. Precisaria de pipeline completo. Alta latência. |
| ElevenLabs conversational | Bom TTS mas latência maior, sem tool calling nativo, custo alto. |
| Azure Speech + LLM separado | Complexidade alta, múltiplos serviços, latência acumulada. |

## Fluxo Técnico

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                      │
│                                                          │
│  ┌──────────┐    WebRTC     ┌──────────────────────┐    │
│  │ Microfone├──────────────►│  OpenAI Realtime API │    │
│  │ + Speaker│◄──────────────┤  (gpt-realtime-mini) │    │
│  └──────────┘   áudio p2p   └──────────┬───────────┘    │
│                                         │                │
│  ┌──────────┐   Data Channel           │                │
│  │  UI/Chat │◄─────────────────────────┘                │
│  │  Avatar  │   (eventos, transcrição)                  │
│  └──────────┘                                            │
└──────────────────────────────────────────────────────────┘
                              │
                    Location: call_id
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│              APP SERVER (Sideband WebSocket)              │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ Tool Handler │  │ Context Mgr  │  │ Funifier API  │ │
│  │              │  │              │  │               │ │
│  │ - update_meal│  │ - player data│  │ - /v3/player  │ │
│  │ - update_wkt │  │ - meal plan  │  │ - /v3/action  │ │
│  │ - log_checkin│  │ - workout    │  │ - /v3/database│ │
│  │ - get_stats  │  │ - history    │  │               │ │
│  └──────────────┘  └──────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de uma "ligação":

1. **Usuário clica "Ligar para Coach"** → UI mostra tela de chamada (avatar + controles)
2. **Frontend pede ephemeral key** ao server (Funifier public endpoint)
3. **Frontend abre WebRTC** com OpenAI Realtime API
4. **Server conecta sideband WebSocket** usando call_id
5. **Server injeta system prompt** com todo o contexto do usuário
6. **Conversa acontece** — áudio bidirecional com latência mínima
7. **Quando modelo chama tool** → sideband intercepta, executa no Funifier, retorna resultado
8. **Usuário desliga** → cleanup, salva resumo da sessão

## Interface do Usuário

### 3 Modos de Interação:

#### 📝 Modo Texto (já existe parcialmente)
- Chat tradicional, sem áudio
- Usa Chat Completions API (mais barato)
- Contexto do usuário injetado no system prompt

#### 🎙️ Modo Voz (prioridade)
- Tela estilo "ligação" — avatar central, botões mute/desligar
- Indicador visual quando coach está falando vs ouvindo
- Transcrição em tempo real (opcional, expansível)
- Botão para alternar texto ↔ voz

#### 📹 Modo Vídeo (fase 2 — avatar animado)
- Ready Player Me avatar com lip sync
- Viseme data do OpenAI → animação facial
- Mais complexo, pode ser fase posterior

### UI da Chamada:

```
┌──────────────────────────┐
│     ← Coach              │
│                          │
│    ┌──────────────┐      │
│    │              │      │
│    │   🦁 Avatar  │      │
│    │   (animado)  │      │
│    │              │      │
│    └──────────────┘      │
│                          │
│    Coach Orvya           │
│    "Falando..."          │
│                          │
│  ┌─────────────────────┐ │
│  │ transcrição aqui... │ │
│  └─────────────────────┘ │
│                          │
│   🔇     📞     💬      │
│  Mute  Desligar  Chat   │
└──────────────────────────┘
```

## Tools Disponíveis para o Coach

```javascript
tools: [
  {
    name: "get_player_profile",
    description: "Buscar perfil completo do usuário (peso, altura, objetivo, plano)",
  },
  {
    name: "get_meal_plan",
    description: "Buscar plano alimentar atual do usuário",
  },
  {
    name: "update_meal_plan",
    description: "Gerar e salvar novo plano alimentar personalizado",
    parameters: { reason: "string", preferences: "string" }
  },
  {
    name: "get_workout_plan",
    description: "Buscar plano de treino atual",
  },
  {
    name: "update_workout_plan",
    description: "Gerar e salvar novo plano de treino",
    parameters: { reason: "string", preferences: "string" }
  },
  {
    name: "log_meal",
    description: "Registrar uma refeição que o usuário acabou de comer",
    parameters: { description: "string" }
  },
  {
    name: "log_water",
    description: "Registrar consumo de água",
    parameters: { amount_ml: "number" }
  },
  {
    name: "get_progress",
    description: "Buscar histórico de evolução (peso, medidas, fotos)",
  },
  {
    name: "get_checkin_history",
    description: "Buscar histórico de check-ins diários",
  },
  {
    name: "schedule_reminder",
    description: "Agendar lembrete para o usuário",
    parameters: { message: "string", time: "string" }
  }
]
```

## System Prompt do Coach

```
Você é o Coach Orvya, um personal trainer e nutricionista virtual premium.

IDENTIDADE:
- Nome: Coach (sem "IA" — pareça humano)
- Tom: direto, motivador, empático mas sem ser piegas
- Fale como um personal de alto nível — confiante, conhecedor
- Use o nome do usuário naturalmente

CONTEXTO DO USUÁRIO:
{player_profile_json}
{current_meal_plan_summary}
{current_workout_plan_summary}
{recent_checkins}
{progress_data}

REGRAS:
- Sempre consulte os dados reais do usuário antes de dar conselho
- Se o usuário pedir mudança em plano, use as tools para executar
- Confirme antes de fazer alterações grandes
- Mantenha respostas de voz curtas e naturais (2-3 frases)
- Em voz, evite listas longas — seja conversacional
- Se não souber algo, admita e sugira consultar um profissional
- NUNCA invente dados — use as tools para buscar
```

## Arquitetura Server-Side

### Opção A: Funifier Public Endpoints (recomendado para MVP)
- `coach_session` — gera ephemeral key, injeta contexto
- `coach_tool` — executa tools chamadas pelo modelo
- Vantagem: sem infra extra, usa o que já temos
- Limitação: 5s timeout do Funifier (ok para gerar key, mas tools complexas podem estourar)

### Opção B: Node.js Middleware (recomendado para produção)
- Pequeno server Express/Fastify no Netlify Functions ou Railway
- Gerencia sideband WebSocket (long-lived)
- Executa tools sem timeout
- Mais flexível para avatar/video
- **Problema: Funifier public endpoints têm 5s timeout — sideband WebSocket precisa ser long-lived**

### Decisão: **Opção B com Netlify Functions para o MVP**
- Netlify Functions suportam até 10s (free) ou 26s (pro)
- Para sideband long-lived, precisaríamos de Railway/Fly.io/VPS
- **Alternativa pragmática**: tools executam via public endpoints do Funifier, sideband é um compromisso

### Arquitetura Híbrida (MELHOR):
1. **Frontend** gera ephemeral key via Funifier public endpoint (rápido, <5s)
2. **Frontend** abre WebRTC direto com OpenAI (sem server no meio)
3. **Tools são definidas na session config** com `url` webhooks apontando para Funifier public endpoints
4. **OpenAI chama os endpoints diretamente** quando precisa de tools
5. **Zero infra extra** — tudo roda no Funifier + frontend

## Fases de Implementação

### Fase 1 — MVP Voz (1-2 semanas)
- [ ] Public endpoint `coach_session`: gera ephemeral key + session config
- [ ] Frontend: tela de chamada (UI de "ligação")
- [ ] WebRTC connection com OpenAI Realtime
- [ ] System prompt com contexto do usuário
- [ ] VAD (voice activity detection) — interrupção nativa
- [ ] 3 tools básicas: get_profile, get_meal_plan, get_workout_plan
- [ ] Transcrição em tempo real (texto abaixo do avatar)
- [ ] Botões: mute, desligar, alternar chat

### Fase 2 — Tools de Ação (1 semana)
- [ ] Tools de escrita: update_meal_plan, update_workout_plan
- [ ] Tool log_meal, log_water
- [ ] Confirmação antes de alterações (modelo pergunta antes de executar)
- [ ] Notificação visual quando tool é executada

### Fase 3 — Avatar Animado (1-2 semanas)
- [ ] Ready Player Me avatar integration
- [ ] Lip sync com viseme data da OpenAI
- [ ] Animações idle, falando, ouvindo
- [ ] Three.js ou iframe RPM

### Fase 4 — Polimento
- [ ] Histórico de "ligações" (resumo gerado pelo modelo)
- [ ] Modo texto melhorado (chat com tools)
- [ ] Controle de custos (limite de minutos por plano)
- [ ] Analytics de uso

## Estimativa de Custos (gpt-realtime-mini)

| Cenário | Input Audio | Output Audio | Custo aprox. |
|---------|-------------|--------------|--------------|
| 5 min conversa | ~3000 tokens | ~3000 tokens | ~$0.02 |
| 15 min conversa | ~9000 tokens | ~9000 tokens | ~$0.06 |
| 30 min conversa | ~18000 tokens | ~18000 tokens | ~$0.15 |

**Com caching de contexto (~75% desconto em input repetido).**

Custo mensal estimado por usuário (3 chamadas/semana, 10 min cada):
- ~$0.50-1.00/mês por usuário ativo

**Conclusão: custo muito viável** para ambos os planos (Standard e Premium).

## Limitações Premium vs Standard

| Feature | Standard | Premium |
|---------|----------|---------|
| Modo texto | ✅ (5 msgs/dia) | ✅ Ilimitado |
| Modo voz | ❌ | ✅ (30 min/dia) |
| Modo vídeo (avatar) | ❌ | ✅ |
| Tools de leitura | ✅ | ✅ |
| Tools de escrita | ❌ | ✅ |

## Dependências

- [x] OpenAI API key (já temos)
- [ ] Verificar se a key tem acesso ao Realtime API
- [ ] Escolher voz do Coach (testar opções)
- [ ] Definir avatar visual (Ready Player Me ou ilustração estática)
- [ ] Criar public endpoints para tools

## Riscos

1. **OpenAI API key sem acesso Realtime** → precisa verificar/ativar
2. **Custo pode escalar** → implementar limites de minutos por plano
3. **Qualidade da voz em PT-BR** → testar se gpt-realtime-mini fala bem em português
4. **5s timeout do Funifier** → tools complexas (gerar plano com IA) podem estourar
   - Mitigação: tool retorna "gerando..." e modelo avisa o usuário, plano é gerado async
5. **WebRTC em Safari mobile** → geralmente funciona, mas precisa testar
