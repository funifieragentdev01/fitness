# Fitness Coach Digital — UX Specification

> **Etapa 6 do Processo Funifier**
> Produto próprio da Funifier | 21/02/2026
> App web mobile-first (AngularJS, PWA) | Narrativa: "Sua Evolução"

---

# 6.1 — Inventário de Telas

## Canal: App Web Mobile-First (PWA)

| Público | Jogador (usuário final) |
|---------|------------------------|
| Descrição de uso | Acesso via navegador mobile (Chrome, Safari). PWA instalável. Uso diário. |
| Tecnologias | AngularJS 1.x, HTML5, CSS3, API Funifier, API OpenAI, Chart.js |
| Resolução alvo | 375×812 (iPhone X) como base, responsivo até 428px |

### Telas Completas

| # | Tela | Tipo | Fase da Jornada | Funcionalidades | Prioridade |
|---|------|------|-----------------|-----------------|------------|
| T01 | Splash / Landing | Página | Descoberta | Proposta de valor, CTA cadastro, social proof, preços | MVP |
| T02 | Login | Página | Descoberta | Email + senha, login social (Google), link para cadastro | MVP |
| T03 | Cadastro | Página | Descoberta | Criar conta (nome, email, senha), aceitar termos | MVP |
| T04 | Onboarding — Dados Básicos | Página (step 1/8) | Onboarding | Sexo, idade, altura, peso, objetivo principal | MVP |
| T05 | Onboarding — Rotina Alimentar | Página (step 2/8) | Onboarding | Refeições habilitadas com horários (café, lanche manhã, almoço, lanche tarde, jantar, ceia) | MVP |
| T06 | Onboarding — Preferências e Orçamento | Página (step 3/8) | Onboarding | Restrições alimentares + faixa de orçamento mensal (3 opções) | MVP |
| T06b | Onboarding — Dias de Treino | Página (step 4/8) | Onboarding | Checkboxes Seg-Dom para dias de treino, time picker para horário | MVP |
| T07 | Onboarding — Local e Equipamento | Página (step 5/8) | Onboarding | Equipamento (nenhum/básico/academia), foto opcional do espaço de treino | MVP |
| T08 | Onboarding — Fotos Corporais | Página (step 6/8) | Onboarding | Upload foto frontal + lateral (opcional mas encorajado), disclaimer LGPD | MVP |
| T09 | Onboarding — Gerando Planos | Página (step 7/8) | Onboarding | Loading com frases motivacionais rotativas, barra de progresso, IA gerando plano alimentar diário + plano de treino semanal em paralelo | MVP |
| T10 | Onboarding — Planos Prontos | Página (step 8/8) | Onboarding | Preview do plano alimentar diário + plano de treino semanal, botão "Começar!", badge "Primeiro Passo", +100 XP | MVP |
| T11 | Dashboard Principal | Página | Todas (pós-onboarding) | Resumo do dia, streak, XP/nível, próxima refeição, próximo treino, hidratação, desafio | MVP |
| T12 | Plano Alimentar — Visão Diária | Página | Primeiros Desafios+ | Plano alimentar DIÁRIO (mesmo todos os dias), lista de refeições com horário/alimentos/quantidades, botão 📷 Registrar por refeição, total calórico | MVP |
| T13 | Plano Alimentar — Detalhe Refeição | Página/Modal | Primeiros Desafios+ | Alimentos, quantidades em gramas, calorias estimadas, dicas, botão foto | MVP |
| T14 | Foto do Prato — Captura | Modal | Primeiros Desafios+ | Câmera/upload, orientações de foto, loading análise IA | MVP |
| T15 | Foto do Prato — Resultado | Modal | Primeiros Desafios+ | Estimativa calórica, comparação com plano, feedback educativo, XP ganho | MVP |
| T16 | Plano de Treino — Visão Semanal | Página | Primeiros Desafios+ | Agenda semanal, cards por dia com grupo muscular, status conclusão | MVP |
| T17 | Plano de Treino — Detalhe do Dia | Página | Primeiros Desafios+ | Lista exercícios, séries/reps, carga, vídeo YouTube, check de conclusão | MVP |
| T18 | Treino — Execução (Timer) | Página | Primeiros Desafios+ | Exercício atual, timer descanso, próximo exercício, botão concluir série | MVP |
| T19 | Treino — Concluído | Modal | Primeiros Desafios+ | Resumo do treino, XP ganho, streak atualizado, celebração | MVP |
| T20 | Check-in Corporal | Página | Primeiros Desafios+ | Upload foto mensal, comparativo lado a lado, análise IA, XP | MVP |
| T21 | Hidratação | Widget/Página | Primeiros Desafios+ | Meta diária, registro de copos, progresso visual, XP | MVP |
| T22 | Perfil / Progresso | Página | Engajamento+ | Dados pessoais, nível + XP, badges, timeline fotos, gráfico peso, stats | MVP |
| T23 | Badges / Conquistas | Página | Primeiros Desafios+ | Grid de badges (desbloqueados + bloqueados), detalhes de cada | MVP |
| T24 | Loja Virtual | Página | Engajamento+ | Itens por Energia ⚡, categorias, botão comprar, saldo | V1.1 |
| T25 | Desafio da Semana | Card/Página | Primeiros Desafios+ | Desafio ativo, progresso, recompensa, prazo, histórico | MVP |
| T26 | Notificações | Página | Todas | Lista de notificações (conquistas, lembretes, streaks) | MVP |
| T27 | Configurações | Página | Todas | Editar perfil, preferências de notificação, conta, assinatura | MVP |
| T28 | Assinatura / Paywall | Página | Descoberta/Onboarding | Planos de preço, trial, pagamento (Stripe), benefícios | MVP |
| T29 | Leaderboard | Página | Engajamento+ | Ranking semanal opt-in, posição do jogador, "Parceiros de Trilha" | V1.1 |
| T30 | Atualização de Peso | Modal | Primeiros Desafios+ | Input de peso semanal, gráfico de tendência, XP | MVP |

**Total: 30 telas** (26 MVP + 4 V1.1)

---

# 6.2 — Fluxos de Navegação

## Fluxo 1 — Primeiro Acesso (Onboarding Completo)

```
T01 Splash/Landing
  → [CTA "Começar"] → T03 Cadastro
    → [Criar conta] → T04 Onboarding: Dados Básicos (sexo, idade, altura, peso, objetivo)
      → [Próximo] → T05 Onboarding: Rotina Alimentar (refeições + horários)
        → [Próximo] → T06 Onboarding: Preferências e Orçamento (restrições + budget)
          → [Próximo] → T06b Onboarding: Dias de Treino (checkboxes Seg-Dom + horário)
            → [Próximo] → T07 Onboarding: Local e Equipamento (+ foto opcional do espaço)
              → [Próximo] → T08 Onboarding: Fotos Corporais (frente + lateral, opcional)
                → [Gerar meus planos!] → T09 Onboarding: Gerando Planos (loading + motivational)
                  → [Auto, após IA gerar ambos os planos] → T10 Planos Prontos (preview dieta diária + treino semanal)
                    → [Começar!] → T11 Dashboard Principal
```

**Barra de progresso:** Visível em T04–T10 (8 steps). XP parcial a cada step (+15 XP).
**Badge:** "Primeiro Passo" ao completar (T10). +100 XP total.
**Planos são pré-requisito:** O usuário NÃO chega ao dashboard sem ambos os planos (alimentar + treino) gerados.
**Plano alimentar:** Diário (mesmo cardápio todos os dias), formato de ficha de nutricionista com horários, alimentos e quantidades.
**Plano de treino:** Baseado nos dias selecionados pelo usuário, dias não selecionados são descanso.
**Erro:** Falha na IA → retry automático + fallback com plano genérico.
**Paywall:** Pode aparecer entre T03 e T04 (trial) ou após T10.

## Fluxo 2 — Dashboard Diário

```
T02 Login → T11 Dashboard Principal
  ├── [Card "Próxima Refeição"] → T13 Detalhe Refeição
  │     └── [Fotografar Prato] → T14 Foto Prato → T15 Resultado
  ├── [Card "Treino de Hoje"] → T17 Detalhe do Dia
  │     └── [Iniciar Treino] → T18 Execução → T19 Concluído
  ├── [Widget Hidratação] → T21 Hidratação (inline ou expand)
  ├── [Card "Desafio da Semana"] → T25 Desafio
  ├── [Barra XP / Avatar] → T22 Perfil
  └── [Ícone Notificações] → T26 Notificações
```

## Fluxo 3 — Plano Alimentar

```
T11 Dashboard → [Tab/Link Alimentação] → T12 Plano Alimentar Semanal
  → [Tap em refeição] → T13 Detalhe Refeição
    ├── [✓ Comi isso] → Action registrada → XP +15 → volta T12 (check visual)
    └── [📷 Foto do prato] → T14 Captura → T15 Resultado IA
          └── [Fechar] → volta T13 (com feedback visível)
```

## Fluxo 4 — Plano de Treino

```
T11 Dashboard → [Tab/Link Treino] → T16 Plano de Treino Semanal
  → [Tap no dia] → T17 Detalhe do Dia
    → [Iniciar Treino] → T18 Execução (Timer)
      → [Concluir cada exercício] → próximo exercício
      → [Último exercício concluído] → T19 Treino Concluído
          → XP +30 → streak update → [Voltar ao Dashboard] → T11
```

## Fluxo 5 — Check-in Foto Corporal

```
T11 Dashboard → T22 Perfil/Progresso → [Check-in Mensal]
  → T20 Check-in Corporal
    → [Upload foto] → Loading IA
    → [Resultado] → Comparativo com foto anterior + análise
    → XP +50 → Badge se aplicável → volta T22
```

## Fluxo 6 — Perfil e Progresso

```
T11 Dashboard → [Avatar/Nome ou Tab Perfil] → T22 Perfil/Progresso
  ├── [Ver Badges] → T23 Badges/Conquistas
  ├── [Atualizar Peso] → T30 Modal Peso → XP +20
  ├── [Timeline Fotos] → scroll horizontal de fotos corporais
  └── [Gráfico Evolução] → Chart.js inline (peso × tempo)
```

## Fluxo 7 — Loja Virtual (V1.1)

```
T11 Dashboard → [Tab/Link Loja] → T24 Loja Virtual
  → [Tap em item] → Modal detalhe (descrição, preço ⚡, preview)
    ├── [Comprar] → Confirmação → Saldo atualizado → Item desbloqueado
    └── [Energia insuficiente] → Mensagem + link para desafios ativos
```

## Fluxo 8 — Assinatura

```
T01 Landing → [Ver Planos] → T28 Assinatura/Paywall
  → [Escolher plano] → Stripe Checkout (externo)
    → [Sucesso] → Redirect T03 ou T11
    → [Falha] → Mensagem de erro + retry
```

**Alternativo (in-app):**
```
T27 Configurações → [Minha Assinatura] → T28 Assinatura
```

---

## Navegação Global (Bottom Tab Bar)

Presente em todas as telas pós-login:

| Ícone | Label | Destino | Badge/Indicador |
|-------|-------|---------|-----------------|
| 🏠 | Início | T11 Dashboard | Dot se há notificação |
| 🍽️ | Alimentação | T12 Plano Alimentar | Check se todas as refeições do dia OK |
| 💪 | Treino | T16 Plano de Treino | Check se treino do dia OK |
| 🏆 | Progresso | T22 Perfil/Progresso | Nenhum |
| ⚙️ | Mais | T27 Configurações | Nenhum |

---

# 6.3 — Especificação de Wireframes

## T01 — Splash / Landing Page

**Fase:** Descoberta | **Prioridade:** MVP

### Hierarquia de Informação
1. **Hero:** Headline + sub-headline + CTA principal
2. **Social proof:** Depoimentos / números
3. **Features:** 3-4 benefícios com ícones
4. **Preços:** Cards de plano
5. **Footer:** CTA final + links legais

### Zonas de Conteúdo

**Header (sticky)**
- Logo do app (esquerda)
- Botão "Entrar" (direita)
- Background: branco (#FFFFFF)

**Hero Section**
- Exibe: Headline "Seu Coach de Nutrição e Treino por R$ 19,90/mês"
- Sub: "Planos personalizados por IA. Funciona com arroz e feijão."
- CTA: Botão verde (#2ECC71) "Começar Agora — 7 dias grátis"
- Background: Gradiente azul escuro (#1A2744) → azul médio
- Ilustração: Silhueta de montanha estilizada (metáfora da escalada)

**Social Proof Section**
- 3 cards com depoimentos (foto, nome, resultado)
- Número de destaque: "Mais de X pessoas na trilha"
- Dados: estáticos no MVP (não vem da API)

**Features Section**
- 4 cards ícone + texto:
  - 🍽️ "Plano alimentar do seu jeito" 
  - 💪 "Treino adaptado ao seu espaço"
  - 📸 "Fotografe e a IA analisa"
  - 🏔️ "Evolua no seu ritmo"

**Preços Section**
- 2 cards: Mensal (R$39,90) | Anual (R$19,90/mês)
- Destaque visual no plano anual (borda laranja #F39C12)
- Badge "Mais popular"

**Footer**
- CTA repetido
- Links: Termos de Uso, Política de Privacidade
- Disclaimer: "Não substitui acompanhamento profissional"

### Interações
- Scroll vertical suave (single page)
- CTA abre T03 (Cadastro) ou T28 (Assinatura)
- "Entrar" abre T02 (Login)

### Estado vazio: N/A (página estática)
### Estado loading: Skeleton da hero com shimmer

### Elementos de gamificação: Nenhum visível (fase descoberta)

---

## T04–T09 — Onboarding (6 Steps)

**Fase:** Onboarding | **Prioridade:** MVP

### Hierarquia de Informação (padrão por step)
1. Barra de progresso (topo)
2. Pergunta / título do step
3. Opções de resposta / inputs
4. Botão "Próximo"

### Zonas de Conteúdo (padrão)

**Header**
- Barra de progresso: 6 segments, preenchimento verde (#2ECC71) progressivo
- Texto "Etapa X de 6"
- Botão voltar (seta ←)

**Conteúdo Central**
- Ícone temático grande (64px) relacionado ao step
- Pergunta em tipografia bold (Inter/Poppins 20px)
- Subtexto explicativo (14px, cinza #6C757D)

**Área de Input** (varia por step)

| Step | Inputs |
|------|--------|
| T04 Dados Básicos (1/8) | Toggle sexo (M/F), input idade, inputs altura/peso, cards objetivo (3 opções: perder peso, ganhar massa, saúde) |
| T05 Rotina Alimentar (2/8) | Lista de refeições com checkbox on/off + time picker: Café da manhã, Lanche manhã, Almoço, Lanche tarde, Jantar, Ceia |
| T06 Preferências e Orçamento (3/8) | Chips restrições (nenhuma, vegetariano, vegano, sem lactose, sem glúten, low carb) + 3 cards orçamento (Econômico/Moderado/Sem limite) |
| T06b Dias de Treino (4/8) | 7 toggles circulares (Seg-Dom) para selecionar dias de treino + time picker para horário do treino |
| T07 Local e Equipamento (5/8) | 3 cards equipamento (nenhum/básico/academia) + upload opcional foto do espaço de treino |
| T08 Fotos Corporais (6/8) | 2 áreas de upload lado a lado (frente + lateral), opção "pular" em texto discreto, disclaimer LGPD |
| T09 Gerando Planos (7/8) | Spinner + frases motivacionais rotativas (3s cada) + barra de progresso. Gera plano alimentar DIÁRIO + plano de treino semanal via OpenAI em paralelo |
| T10 Planos Prontos (8/8) | Preview do plano alimentar diário (horário + nome da refeição) + preview do treino semanal (dia + grupo muscular). Botão "Começar!" |

**Footer**
- Botão "Próximo" (full-width, verde #2ECC71)
- No T08: botão principal "Enviar Foto" + link "Pular"
- No T09: sem botão (auto-redirect após 5-15s)

### Dados da API Funifier
- **T04-T08:** POST para salvar perfil → `POST /v3/action` (action: `complete_onboarding_step`, atributos: step_number, dados do step)
- **T09:** POST para gerar planos → API OpenAI (via backend/trigger)
- XP parcial: `POST /v3/action` com trigger que concede +15 XP por step

### Interações
- Swipe horizontal entre steps (opcional, botão "Próximo" é primário)
- Validação inline (campo obrigatório, faixa válida)
- Haptic feedback no mobile ao completar step (via navigator.vibrate)
- Animação de check ✓ verde ao completar cada step

### Estados
- **Loading:** Shimmer no conteúdo central
- **Erro validação:** Borda vermelha no campo + texto de erro abaixo
- **T09 timeout (>30s):** "Está demorando mais que o normal. Seu plano é especial! Aguarde..."
- **T09 erro IA:** "Ops, tivemos um problema. Vamos tentar de novo." + botão retry

### Elementos de Gamificação
- Barra de progresso com XP acumulado visível
- Ao completar T08 → Toast "Perfil Completo! +100 XP 🏔️"
- T10 (Planos Prontos): Badge "Primeiro Passo" com animação de desbloqueio

---

## T11 — Dashboard Principal

**Fase:** Todas (pós-onboarding) | **Prioridade:** MVP

### Hierarquia de Informação
1. Header com identidade do jogador (nível, streak)
2. Resumo do progresso do dia
3. Cards de ação (próxima refeição, treino, hidratação)
4. Desafio da semana
5. Bottom tab bar

### Zonas de Conteúdo

**Header (sticky, 80px)**
- Esquerda: Avatar circular (36px) + nome ("Olá, Ana")
- Centro: Nível badge ("Lv.4 Disciplinado") com cor do nível
- Direita: Ícone sino (notificações) com badge count
- Background: Azul escuro (#1A2744)
- Texto: Branco

**Barra de XP (abaixo do header, 8px altura)**
- Barra de progresso horizontal
- Preenchimento: Verde (#2ECC71) → Laranja (#F39C12) próximo de level up
- Label direita: "1.850 / 2.100 XP"
- Animação: Pulsa suavemente quando próximo de level up (<10%)

**Seção Streak + Resumo (card arredondado, 16px border-radius)**
- Ícone 🔥 + "7 dias na trilha"
- 3 mini-indicators inline: Refeições (2/4 ✓), Treino (0/1), Água (3/8 copos)
- Background: Branco, sombra suave
- Tap → expande resumo detalhado

**Card Próxima Refeição**
- Header: Horário + tipo ("12:30 — Almoço")
- Body: Preview dos alimentos (2 linhas), calorias estimadas
- Footer: Botão "Ver Detalhes" | Botão "📷 Foto do Prato"
- Ícone de check se já registrada
- API: `GET /v3/action?action=meal_plan&player={id}` + dados do plano em cache local

**Card Treino do Dia**
- Header: Grupo muscular ("Peito + Tríceps") + duração estimada
- Body: Número de exercícios, equipamentos
- Footer: Botão "Iniciar Treino" (verde, destaque) ou "✓ Concluído" (cinza)
- Estado concluído: Card com borda verde, check animado
- API: `GET /v3/action?action=workout_plan&player={id}`

**Widget Hidratação (inline, compacto)**
- 8 círculos representando copos (preenchidos = azul claro, vazios = cinza)
- Tap em círculo vazio → registra copo → animação de preenchimento → +5 XP toast
- Label: "5/8 copos (1.5L / 2.4L)"
- API: `POST /v3/action` (action: `drink_water`)

**Card Desafio da Semana**
- Título do desafio ("Complete 4 treinos esta semana")
- Barra de progresso (2/4)
- Recompensa: "🏆 Badge + 30⚡"
- Prazo: "Até domingo"
- API: `GET /v3/challenge?player={id}&status=active`

**Bottom Tab Bar (56px, fixo)**
- 5 itens conforme tabela da seção 6.2
- Item ativo: cor verde (#2ECC71) + label visível
- Item inativo: cinza (#ADB5BD) + label

### Interações
- Pull-to-refresh (atualiza dados do dia)
- Scroll vertical entre cards
- Tap em qualquer card → navegação para detalhe
- Long press no streak → mostra calendário de streak (últimos 30 dias)
- Animação de confetti ao level up (trigger via Funifier Notification)

### Estados
- **Primeiro acesso (pós-onboarding):** Cards com animação de entrada sequencial. Tooltip "Comece por aqui →" apontando para primeira refeição
- **Loading:** Skeleton com shimmer em cada card
- **Sem treino hoje (dia de descanso):** Card treino mostra "Dia de descanso 🧘" com dica de alongamento
- **Tudo concluído:** Header muda para "Dia completo! 🏔️ +X XP ganhos hoje"
- **Sem internet:** Banner topo "Sem conexão. Dados salvos localmente."

### Elementos de Gamificação Visíveis
- Barra XP (always visible)
- Badge de nível no header
- Streak com ícone 🔥
- Mini-indicators de progresso diário
- Toast de XP ao registrar ação
- Desafio da semana com barra de progresso
- Energia ⚡ saldo (ícone no header, ao lado de notificações)

---

## T12 — Plano Alimentar (Visão Diária)

**Fase:** Primeiros Desafios+ | **Prioridade:** MVP

### Conceito
O plano alimentar é DIÁRIO — o mesmo cardápio todos os dias, como uma ficha de nutricionista. Isso garante maior aderência e simplicidade. O formato visual é inspirado em fichas reais de nutricionistas brasileiros (ver referência: dieta.jpg).

### Hierarquia de Informação
1. Título "PLANEJAMENTO ALIMENTAR"
2. Lista de refeições com horário, alimentos e quantidades
3. Botão "📷 Registrar" por refeição
4. Total calórico diário

### Zonas de Conteúdo

**Header**
- Título: "🍽️ Plano Alimentar Diário"
- Data de geração + botão "Regenerar"

**Título do Plano**
- "PLANEJAMENTO ALIMENTAR" em destaque (verde, caixa alta, centralizado)

**Lista de Refeições (scroll vertical)**
- Card por refeição com:
  - **Horário** (ex: "07:00") em destaque verde
  - **Nome da refeição** (ex: "CAFÉ DA MANHÃ") em caixa alta, bold
  - **Calorias** da refeição (badge pequeno)
  - **Lista de alimentos** com nome e quantidade (ex: "Ovos mexidos — 2 unidades")
  - **Botão "📷 Registrar"** → abre câmera para foto do prato
  - **Status:** "📷 Registrar" (pendente) | "✅ Registrada" (feita)
- A próxima refeição (baseada no horário atual) é destacada com borda verde e glow

**Total Calórico (footer)**
- Card verde: "Valor calórico total: XXXX kcal"

### Dados da API
- Plano alimentar: gerado via OpenAI durante onboarding, armazenado em localStorage e Funifier (`profile__c` ou `meal_plan__c`)
- Formato JSON: `{meals: [{time, name, description, foods: [{food, quantity, calories}], total_calories}], total_calories}`
- Registro de refeição: `POST /v3/action` (action: `register_meal`)
- Foto: `POST /v3/action` (action: `photo_meal`)
- Tracking diário: localStorage key `fitevolve_meals_YYYY-MM-DD`

### Interações
- Tap "📷 Registrar" → abre tela de foto (T14) com info da refeição
- Scroll vertical entre refeições
- Próxima refeição destacada automaticamente baseado no horário

### Estados
- **Plano não gerado:** Botão "Gerar Plano" (raro — plano é gerado no onboarding)
- **Loading:** Spinner + "Gerando plano com IA..."
- **Refeição registrada:** Botão muda para "✅ Registrada" (verde, desabilitado)

### Elementos de Gamificação
- Status visual por refeição (check verde)
- Destaque na próxima refeição
- XP +15 ao registrar cada refeição
- Badge "Dia Perfeito ✨" se todas as refeições do dia foram registradas

---

## T13 — Detalhe da Refeição

**Fase:** Primeiros Desafios+ | **Prioridade:** MVP

### Zonas de Conteúdo

**Header**
- Tipo + horário ("Almoço — 12:30")
- Botão voltar

**Lista de Alimentos**
- Card por alimento:
  - Nome do alimento
  - Quantidade (ex: "150g" ou "2 colheres de sopa")
  - Calorias
  - Ícone do grupo (proteína/carbo/gordura/vegetal)
- Total de calorias da refeição

**Dica Educativa (card destaque)**
- Ícone 💡
- Texto da IA (ex: "Arroz sem óleo economiza 50 calorias por porção")
- Background: Amarelo claro (#FFF9E6)

**Ações**
- Botão primário: "✓ Comi isso" (full-width, verde)
- Botão secundário: "📷 Fotografar Prato" (outline)
- Se já registrada: botão muda para "✓ Registrada" (desabilitado, cinza-verde)

### Dados da API
- Detalhes da refeição: cache local do plano gerado pela IA
- Registro: `POST /v3/action` (action: `log_meal`, atributos: meal_type, calories, photo_url)
- XP: Trigger concede +15 XP ao registrar

### Interações
- Tap "Comi isso" → animação check + toast "+15 XP ▲"
- Tap "Fotografar" → abre T14 (câmera)
- Scroll vertical se muitos alimentos

### Estados
- **Já registrada:** Indicador verde, botões desabilitados, mostra hora do registro
- **Com foto:** Thumbnail da foto do prato visível abaixo da lista

---

## T14/T15 — Foto do Prato (Captura + Resultado)

**Fase:** Primeiros Desafios+ | **Prioridade:** MVP

### T14 — Captura

**Zonas**
- Área de preview da câmera (quadrado, 80% da largura)
- Guia visual: círculo tracejado sugerindo enquadramento
- Texto: "Tire a foto de cima, com boa iluminação"
- Botão captura (círculo grande) ou "Escolher da galeria"
- Após captura: preview + "Enviar" ou "Tirar outra"

**Interações**
- `<input type="file" accept="image/*" capture="environment">` (PWA)
- Compressão client-side (max 1MB, 1024px)
- Loading após envio: "Analisando seu prato... 🔍" (2-5s)

### T15 — Resultado

**Zonas**
- Foto do prato (topo, quadrado)
- Card resultado IA:
  - Estimativa calórica total (número grande, bold)
  - Lista de alimentos identificados com calorias individuais
  - Comparação com plano: barra (planejado vs. real) com cores (verde=alinhado, amarelo=atenção, vermelho=acima)
  - Feedback educativo em texto (tom de coach, não punitivo)
    - "Ótima escolha!" / "Porção um pouco acima do planejado" / "Tente adicionar mais proteína"
- XP toast: "+15 XP ▲ 📸"
- Botão "Fechar" → volta T13

**Dados da API**
- Envio: POST foto para API OpenAI (GPT-4V) via trigger/backend
- Salvar resultado: `POST /v3/action` (action: `photo_meal`, atributos: photo_url, ai_calories, ai_feedback, meal_type)
- XP: Trigger +15 XP

### Disclaimer
- Texto fixo (12px, cinza): "Estimativa baseada em IA. Valores aproximados."

---

## T16 — Plano de Treino (Visão Semanal)

**Fase:** Primeiros Desafios+ | **Prioridade:** MVP

### Zonas de Conteúdo

**Seletor de Dia** (mesmo padrão de T12)
- Dia com treino concluído = ícone check verde
- Dia de descanso = ícone 🧘
- Dia com treino pendente = ícone 💪 outline

**Card do Dia**
- Header: Dia + grupo muscular ("Segunda — Peito + Tríceps")
- Body: Número de exercícios, duração estimada, equipamentos
- Footer: "Iniciar Treino" (verde) ou "✓ Concluído"
- Se dia de descanso: Card com ícone 🧘 + sugestão de alongamento

### Dados da API
- Plano: cache local do plano gerado pela IA
- Status: `GET /v3/action?action=complete_workout&player={id}&date={date}`

---

## T17 — Detalhe do Treino do Dia

**Fase:** Primeiros Desafios+ | **Prioridade:** MVP

### Zonas de Conteúdo

**Header**
- Grupo muscular + duração ("Peito + Tríceps — ~45min")
- Equipamentos necessários (chips)

**Lista de Exercícios**
- Card por exercício:
  - Nome do exercício (bold)
  - Séries × Repetições (ex: "4 × 12")
  - Carga sugerida (ex: "8kg" ou "Peso corporal")
  - Thumbnail do exercício ou ícone
  - Link "Ver vídeo ▶️" → abre YouTube embed/link
  - Check de conclusão por exercício

**Footer**
- Botão "Iniciar Treino" → T18
- Texto: "Lembre de aquecer 5 minutos antes"

### Dados da API
- Plano do dia: cache local
- Vídeos: URLs do YouTube armazenadas no plano gerado pela IA
- Conclusão parcial: salvo em localStorage até completar treino

---

## T18 — Execução do Treino (Timer)

**Fase:** Primeiros Desafios+ | **Prioridade:** MVP

### Zonas de Conteúdo

**Header**
- Progresso: "Exercício 3 de 8"
- Barra de progresso horizontal

**Exercício Atual (centro)**
- Nome grande (24px bold)
- Séries × Reps (ex: "Série 2 de 4 — 12 reps")
- Carga sugerida
- Botão grande "✓ Série Concluída" (verde)

**Timer de Descanso (aparece após concluir série)**
- Countdown circular (60-90s configurável)
- Texto motivacional rotativo durante descanso
- Botão "Pular descanso"

**Próximo Exercício (preview)**
- Nome + séries (texto menor, cinza)

**Footer**
- Botão "Pausar Treino" | "Encerrar Treino"

### Interações
- Tap "Série Concluída" → incrementa série → se última série → próximo exercício
- Timer com alerta sonoro/vibração ao acabar
- Swipe up no exercício atual → ver vídeo de demonstração
- Se último exercício + última série → auto-navega T19

### Estados
- **Pausado:** Overlay escuro + timer pausado + "Continuar"
- **Encerrar cedo:** Confirmação "Encerrar treino? Você completou X de Y exercícios" → registra parcial

---

## T19 — Treino Concluído

**Fase:** Primeiros Desafios+ | **Prioridade:** MVP

### Zonas de Conteúdo (modal fullscreen)

**Celebração**
- Animação: Montanha com bandeira no topo (metáfora de conquista)
- Texto: "Treino Concluído! 💪"
- XP ganho: "+30 XP ▲" (animação de contagem)

**Resumo**
- Exercícios completados: X/Y
- Duração total
- Streak atualizado: "🔥 8 dias na trilha"

**Badge (se aplicável)**
- Se primeira vez: Badge "Primeiro Treino" com animação de desbloqueio
- Se streak de 7: Badge "Semana de Ferro"

**Botão:** "Voltar ao Dashboard"

### Dados da API
- `POST /v3/action` (action: `complete_workout`, atributos: exercises_completed, duration, workout_type)
- Trigger: +30 XP, streak check, badge check

---

## T20 — Check-in Corporal

**Fase:** Primeiros Desafios+ | **Prioridade:** MVP

### Zonas de Conteúdo

**Header**
- "Check-in Mensal" + data

**Comparativo**
- Slider antes/depois (2 fotos lado a lado ou slider deslizável)
- Se primeira foto: apenas foto atual + mensagem "Na próxima vez, você verá a diferença"

**Upload**
- Silhueta guia (mesmo padrão do onboarding)
- Botão câmera/galeria
- Disclaimer LGPD

**Análise IA**
- Loading: "Analisando sua evolução..."
- Resultado: Texto do coach comparativo ("Sua postura melhorou. Região abdominal mais definida. Continue!")
- Dados comparativos: peso anterior vs. atual (se disponível)

**Recompensa**
- "+50 XP ▲ + 20⚡"
- Badge se aplicável ("3 Meses de Evolução")

### Dados da API
- Upload foto: storage (S3 ou Funifier storage)
- `POST /v3/action` (action: `body_checkin`, atributos: photo_url, weight, ai_analysis)
- Fotos anteriores: `GET /v3/action?action=body_checkin&player={id}&sort=-date`

---

## T22 — Perfil / Progresso

**Fase:** Engajamento+ | **Prioridade:** MVP

### Zonas de Conteúdo

**Header Perfil**
- Avatar grande (80px) + nome
- Nível: badge com nome ("Lv.4 Disciplinado")
- Barra XP completa com números
- Membro desde: data
- Streak atual: "🔥 23 dias"

**Stats Grid (2×2)**
- Total de treinos completados
- Total de refeições registradas
- Dias na trilha (total, não streak)
- Energia ⚡ acumulada

**Timeline de Fotos Corporais**
- Scroll horizontal de thumbnails
- Tap → visualizar em tela cheia com slider comparativo
- Botão "+ Novo Check-in" → T20

**Gráfico de Peso**
- Chart.js line chart
- Eixo X: datas | Eixo Y: peso (kg)
- Linha com pontos, cor verde se tendência desejada, laranja se platô
- Botão "Atualizar Peso" → T30

**Badges (preview grid)**
- Grid 4×2 com os 8 badges mais recentes
- Badges desbloqueados: coloridos com brilho
- Badges bloqueados: silhoueta cinza com "?"
- Botão "Ver Todos" → T23

**Botão Editar Perfil** → T27

### Dados da API Funifier
- Nível/XP: `GET /v3/level?player={id}` + `GET /v3/point?player={id}&category=xp`
- Badges: `GET /v3/challenge?player={id}&status=completed` (badges como challenges concluídos)
- Stats: aggregates customizados ou contagem de ações
- Fotos: `GET /v3/action?action=body_checkin&player={id}`
- Peso: `GET /v3/action?action=update_weight&player={id}`

---

## T23 — Badges / Conquistas

**Fase:** Primeiros Desafios+ | **Prioridade:** MVP

### Zonas de Conteúdo

**Filtros (horizontal scroll)**
- Todos | Treino | Alimentação | Consistência | Especiais

**Grid de Badges (3 colunas)**
- Card por badge:
  - Ícone (64px) — colorido se desbloqueado, silhoueta cinza se bloqueado
  - Nome do badge
  - Data de conquista ou critério para desbloquear
- Tap em badge desbloqueado → modal com detalhes + data + descrição motivacional
- Tap em badge bloqueado → modal com critério ("Complete 50 treinos")

### Badges do MVP

| Badge | Critério | Ícone sugerido |
|-------|----------|----------------|
| Primeiro Passo | Completar onboarding | 🥾 |
| Primeiro Treino | 1 treino completo | 💪 |
| Primeiro Prato | 1 refeição registrada com foto | 📸 |
| 3 Dias na Trilha | Streak de 3 | 🔥 |
| 7 Dias na Trilha | Streak de 7 | 🔥🔥 |
| 30 Dias na Trilha | Streak de 30 | ⛰️ |
| Guerreiro da Semana | Desafio semanal completo | 🏆 |
| Mês de Ferro | 4 desafios semanais seguidos | 🏅 |
| Hidratado | 7 dias com meta de água atingida | 💧 |
| Fotógrafo | 10 fotos de prato | 📷 |
| Dia Perfeito | Todas refeições + treino + água em 1 dia | ⭐ |
| Evolução Visível | 3 check-ins corporais | 🪞 |

### Dados da API
- `GET /v3/challenge?player={id}` (todas as challenges/badges)
- Status por challenge: completed, in_progress, locked

---

## T25 — Desafio da Semana

**Fase:** Primeiros Desafios+ | **Prioridade:** MVP

### Zonas de Conteúdo

**Desafio Ativo**
- Título ("Complete 4 treinos esta semana")
- Barra de progresso (2/4) com animação
- Recompensa: "🏆 Guerreiro da Semana + 100 XP + 30⚡"
- Prazo: countdown "Faltam 3 dias"
- Dica: "Você está no ritmo! Mais 2 treinos e o badge é seu."

**Desafio Diário (opcional)**
- Card menor com desafio do dia
- Progresso inline
- Recompensa: "20 XP + 5⚡"

**Histórico**
- Lista dos últimos desafios (scroll)
- Status: ✅ Completo | ❌ Não completado | 🔄 Em andamento

### Dados da API
- `GET /v3/challenge?player={id}&status=active`
- `GET /v3/challenge?player={id}&status=completed&limit=10`
- Progresso: contagem de ações relevantes no período

---

## T28 — Assinatura / Paywall

**Fase:** Descoberta/Onboarding | **Prioridade:** MVP

### Zonas de Conteúdo

**Header**
- "Invista na sua evolução"
- Subtexto: "7 dias grátis para experimentar"

**Cards de Plano (2 colunas ou stack)**
- **Mensal:** R$ 39,90/mês — "Flexibilidade total"
- **Anual:** R$ 19,90/mês (R$ 238,80/ano) — "Melhor valor" + badge "Mais popular" (laranja)
- Cada card: lista de features incluídas (checkmarks)

**Benefícios**
- ✅ Plano alimentar personalizado por IA
- ✅ Plano de treino adaptado ao seu espaço
- ✅ Análise de foto do prato
- ✅ Dashboard de evolução completo
- ✅ Sistema de conquistas e desafios
- ✅ Check-in corporal com comparativo

**CTA**
- Botão "Começar Trial Grátis" (verde, full-width)
- Texto: "Cancele quando quiser. Sem compromisso."

**Footer**
- Links: Termos, Política de Privacidade
- Formas de pagamento: ícones cartão/Pix

### Interação
- Tap em plano → seleciona (outline destaque)
- Tap CTA → Stripe Checkout (redirect ou embedded)
- Sucesso → redirect T04 (onboarding) ou T11 (dashboard)

---

# 6.4 — Prompts para Geração de Imagens

## 6.4a — Prompts para Freepik (Imagens Conceito)

### Splash / Landing
```
Modern mobile fitness app landing page, dark navy blue background with green accent buttons, mountain silhouette illustration, clean minimalist UI, coach-style professional tone, Brazilian fitness app, vertical mobile layout
```

### Onboarding
```
Mobile app onboarding wizard screen, step progress bar, fitness questionnaire with icon cards, clean white background with navy blue and green accents, friendly professional tone, vertical mobile layout
```

### Dashboard Principal
```
Mobile fitness dashboard UI, dark navy header with XP progress bar and fire streak icon, white cards showing meal plan and workout summary, hydration tracker circles, green and orange accents, gamification elements subtle and professional, vertical mobile layout
```

### Plano Alimentar
```
Mobile meal plan screen UI, daily food schedule with time slots and food cards, calorie summary, clean white design with green checkmarks and colorful food category badges, professional nutrition app style, vertical mobile layout
```

### Plano de Treino
```
Mobile workout plan screen, weekly calendar selector, exercise cards with sets and reps, timer element, dark navy and green color scheme, professional personal trainer app style, vertical mobile layout
```

### Check-in Foto Corporal
```
Mobile body check-in screen, before and after photo comparison slider, progress analysis card, motivational text, dark theme with green highlights, fitness transformation tracker, vertical mobile layout
```

### Perfil / Progresso
```
Mobile fitness profile screen, avatar with level badge, XP progress bar, achievement badges grid, weight chart line graph, body photo timeline horizontal scroll, dark navy header with white content cards, vertical mobile layout
```

## 6.4b — Prompts para Google Stitch (Telas Detalhadas)

### Splash / Landing

```
Design a mobile landing page (375x812px) for a Brazilian fitness coaching app called "Sua Evolução".

HEADER: White bar with app logo on left, "Entrar" button on right.

HERO SECTION: Dark navy blue (#1A2744) gradient background. Large white headline "Seu Coach de Nutrição e Treino por R$ 19,90/mês". Subtitle in light gray "Planos personalizados por IA. Funciona com arroz e feijão." Green (#2ECC71) full-width button "Começar Agora — 7 dias grátis". Subtle mountain silhouette illustration at bottom of hero in lighter navy.

SOCIAL PROOF: White background. 3 horizontal scroll cards with user photos, names, and short testimonials in Portuguese. "Mais de 2.000 pessoas na trilha" centered text.

FEATURES: 4 vertical cards with icons: plate icon "Plano alimentar do seu jeito", dumbbell icon "Treino adaptado ao seu espaço", camera icon "Fotografe e a IA analisa", mountain icon "Evolua no seu ritmo". Each card has navy icon, bold title, short description.

PRICING: 2 cards side by side. Left: "Mensal R$ 39,90/mês" with feature list. Right: "Anual R$ 19,90/mês" with orange (#F39C12) "Mais popular" badge and feature list. Right card has slight elevation/border highlight.

FOOTER: Green CTA button repeated. Small gray links for terms and privacy. Disclaimer text.

Style: Clean, modern, professional. Font: Inter or Poppins. No cartoon elements. Rounded corners (16px). Subtle shadows.
```

### Onboarding (Dados Básicos — Step 1)

```
Design a mobile onboarding screen (375x812px) for fitness app "Sua Evolução". Step 1 of 6.

TOP: Green (#2ECC71) progress bar showing 1/6 segments filled. Text "Etapa 1 de 6" centered. Back arrow on left.

CONTENT: Large body icon (64px, navy #1A2744). Bold title "Vamos te conhecer" (20px). Subtitle in gray "Informações básicas para personalizar seu plano".

FORM FIELDS:
- "Sexo" with 2 toggle buttons (Masculino/Feminino) side by side, selected = green fill
- "Idade" with number stepper (- 28 +)
- "Altura" with input and "cm" suffix
- "Peso" with input and "kg" suffix
- "Objetivo" with 4 selectable cards in 2x2 grid: flame icon "Perder gordura", muscle icon "Ganhar massa", balance icon "Manutenção", heart icon "Saúde geral". Selected card has green border and light green background.

BOTTOM: Full-width green (#2ECC71) button "Próximo" with right arrow.

Style: White background, clean inputs with rounded borders, navy labels, green accents. Font: Inter/Poppins. Cards have 12px border-radius and subtle shadow.
```

### Dashboard Principal

```
Design a mobile dashboard screen (375x812px) for fitness app "Sua Evolução". This is the main daily view.

HEADER (80px, navy #1A2744): Left: circular avatar (36px) + "Olá, Ana" in white. Center: level badge "Lv.4 Disciplinado" with small shield icon. Right: bell icon with red dot (notification count "3").

XP BAR (8px, below header): Horizontal progress bar, green (#2ECC71) fill at 85%, transitioning to orange at the end. Right label "1.850 / 2.100 XP" in small white text on navy background.

STREAK CARD (white, rounded 16px, shadow): Fire icon 🔥 + "7 dias na trilha" bold. Below: 3 inline mini-indicators — "Refeições 2/4 ✓" (green), "Treino 0/1" (gray), "Água 3/8" (blue).

NEXT MEAL CARD (white, rounded): Left color bar (yellow for breakfast). "12:30 — Almoço" header. "Arroz, feijão, frango grelhado..." preview text. "~450 kcal". Two buttons: "Ver Detalhes" (outline) and camera icon "📷 Foto" (green fill).

TODAY'S WORKOUT CARD (white, rounded): Left color bar (green). "Peito + Tríceps — ~45min" header. "6 exercícios • Halteres + Barra". Green button "Iniciar Treino 💪".

HYDRATION WIDGET (inline, white card): 8 circles in a row. 5 filled (light blue #3498DB), 3 empty (gray outline). "5/8 copos (1.5L / 2.4L)" text.

WEEKLY CHALLENGE CARD (white, rounded): "Desafio: Complete 4 treinos" title. Progress bar (2/4, green). "🏆 Badge + 30⚡ • Até domingo". 

BOTTOM TAB BAR (56px, white, top border): 5 items — Home (green, active), Fork+Knife, Dumbbell, Trophy, Gear. Active item has green (#2ECC71) icon + label.

Style: Light gray background (#F8F9FA), white cards, navy text, green and orange accents. Modern, professional, no cartoon. Rounded corners 16px.
```

### Plano Alimentar

```
Design a mobile meal plan screen (375x812px) for fitness app "Sua Evolução".

HEADER: "Seu Plano Alimentar" title. Subtitle: "Plano Econômico" in green badge.

DAY SELECTOR (sticky, horizontal scroll): 7 circles for Mon-Sun. "Ter" (Tuesday) is selected with green fill and white text. "Seg" has a green checkmark (all meals done). Others are gray outline.

MEAL CARDS (vertical scroll, 5 cards):
1. Yellow left bar. "07:00 — Café da Manhã" header. "Pão integral, ovo, café com leite" preview. "~350 kcal". Green check icon (done).
2. Orange left bar. "10:00 — Lanche da Manhã". "Banana + 3 castanhas". "~150 kcal". Gray pending.
3. Green left bar. "12:30 — Almoço". "Arroz, feijão, frango grelhado, salada". "~500 kcal". Gray pending.
4. Orange left bar. "15:30 — Lanche da Tarde". "Iogurte natural + aveia". "~200 kcal". Gray pending.
5. Blue left bar. "19:30 — Jantar". "Omelete + salada". "~400 kcal". Gray pending.

DAILY SUMMARY (bottom card): "Total: 1.600 kcal" with progress bar. Three mini-bars: "Proteína 120g" (green), "Carboidrato 180g" (yellow), "Gordura 45g" (orange).

BOTTOM TAB BAR: Fork+Knife tab active (green).

Style: White background, clean cards with left color bars, rounded 12px. Professional nutrition app look.
```

### Plano de Treino

```
Design a mobile workout plan screen (375x812px) for fitness app "Sua Evolução".

HEADER: "Seu Plano de Treino" title. Subtitle: "Casa — Halteres + Peso corporal".

DAY SELECTOR (same pattern as meal plan): 7 circles. "Seg" selected (green fill). "Ter" has green check. "Qua" shows yoga icon (rest day). Others gray outline.

WORKOUT CARD (main, large): Header "Segunda — Peito + Tríceps". Chips: "Halteres" "Barra" (navy outline badges). Info row: "6 exercícios • ~45min". 

EXERCISE LIST (preview, inside card):
1. "Supino com halteres" — "4×12 • 8kg"
2. "Flexão de braço" — "3×15 • Corpo"
3. "Crucifixo" — "3×12 • 6kg"
4. "..."  and "ver todos"

Green full-width button: "Iniciar Treino 💪"

REST DAY CARD (smaller, shown for "Qua"): Yoga icon. "Dia de Descanso 🧘". "Sugestão: 15min de alongamento". Gray background card.

BOTTOM TAB BAR: Dumbbell tab active (green).

Style: White background, navy and green accents. Exercise items with subtle dividers. Equipment chips in outlined navy badges.
```

### Check-in Foto Corporal

```
Design a mobile body check-in screen (375x812px) for fitness app "Sua Evolução".

HEADER: "Check-in Mensal" title. Date "Fevereiro 2026".

COMPARISON SECTION: Two photos side by side (50% width each). Left: "Janeiro" label, body photo placeholder (gray silhouette). Right: "Fevereiro" label with green "NOVO" badge, upload area with camera icon and dashed border. Slider handle between photos for before/after effect.

UPLOAD AREA (if no new photo): Dashed border rectangle. Camera icon centered. "Tire sua foto de frente, corpo inteiro". Button "Tirar Foto" (green) and "Escolher da Galeria" (outline).

AI ANALYSIS CARD (shown after upload): Green left bar. Coach icon. "Boa evolução, Ana! Sua postura melhorou e a região abdominal está mais definida. Continue com a disciplina — os resultados estão aparecendo." Professional, motivational tone.

REWARD CARD: "+50 XP ▲ + 20⚡" with subtle animation indicators. Badge "Evolução Visível" if applicable.

DISCLAIMER: Small gray text "Análise baseada em IA. Estimativa visual, não substitui avaliação profissional."

Style: Dark navy top section with photos, white cards below. Green accents for positive feedback. Professional and respectful tone throughout.
```

### Perfil / Progresso

```
Design a mobile profile/progress screen (375x812px) for fitness app "Sua Evolução".

HEADER (navy #1A2744, 180px): Large avatar circle (80px) centered with green border. "Ana Silva" name below (white, bold). Level badge "Lv.4 Disciplinado" in green pill. Full XP bar below: "1.850 / 2.100 XP" (green fill, 85%).  Small text: "Membro desde Jan 2026 • 🔥 23 dias na trilha".

STATS GRID (2×2 white cards): "72" "treinos" (dumbbell icon), "215" "refeições" (plate icon), "45" "dias na trilha" (mountain icon), "340⚡" "energia" (lightning icon). Each card has large number, small label, and themed icon.

BODY PHOTO TIMELINE: Horizontal scroll of circular thumbnails (60px). Each shows month label below. Last one is "+" button for new check-in. 5 photos shown.

WEIGHT CHART: Line chart with green line trending downward. X-axis: Jan, Fev (months). Y-axis: 78kg to 74kg. Current weight highlighted with dot and label "75.2kg". Button "Atualizar Peso" below chart.

BADGES SECTION: "Conquistas" header with "Ver Todas →" link. Grid of 8 badges (4×2). 5 are colorful (unlocked): boot, muscle, camera, fire, trophy icons. 3 are gray silhouettes (locked) with "?" overlay.

BOTTOM: "Editar Perfil" outline button.

BOTTOM TAB BAR: Trophy tab active (green).

Style: Navy header transitioning to light gray (#F8F9FA) body. White cards with subtle shadows. Charts in green/navy. Clean, data-rich but not cluttered.
```

---

# 6.5 — Componentes Reutilizáveis

## Biblioteca de Componentes

### 1. XP Progress Bar

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | T11 (Dashboard header), T22 (Perfil), T10 (Planos Prontos) |
| **Dados de entrada** | `currentXP: number`, `nextLevelXP: number`, `levelName: string` |
| **Variações** | Compact (8px, sem label — header), Full (16px, com label e números — perfil) |
| **Comportamento** | Animação de preenchimento (ease-out 500ms) ao ganhar XP. Pulsa (scale 1.02) quando >90%. Flash dourado no level up. |
| **API Funifier** | `GET /v3/point?player={id}&category=xp` + `GET /v3/level?player={id}` |
| **CSS** | Background: #E9ECEF. Fill: linear-gradient(90deg, #2ECC71, #F39C12) quando >90%, senão #2ECC71. Border-radius: 999px. |

### 2. Streak Badge

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | T11 (Dashboard), T19 (Treino Concluído), T22 (Perfil) |
| **Dados de entrada** | `streakDays: number` |
| **Variações** | Inline (ícone + número, ex: "🔥 7"), Card (com texto "X dias na trilha" + calendário mini) |
| **Comportamento** | Ícone 🔥 pulsa ao incrementar. Número incrementa com animação de contagem. Long press (Card) → calendário de streak dos últimos 30 dias. |
| **API Funifier** | Calculado via contagem de ações diárias consecutivas ou challenge de streak |
| **CSS** | Font-weight: 700. Color: #F39C12 (laranja). Size: 16px inline, 24px card. |

### 3. Card de Refeição

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | T11 (Dashboard — próxima), T12 (Plano Semanal — lista), T13 (Detalhe) |
| **Dados de entrada** | `mealType: string`, `time: string`, `foods: string[]`, `calories: number`, `status: 'pending'|'done'|'photo'` |
| **Variações** | Compact (1 linha — Dashboard), Medium (2 linhas — lista semanal), Full (detalhe com todos os alimentos) |
| **Comportamento** | Tap → navega para detalhe. Swipe left → quick check "✓ Comi isso". Status done → borda esquerda verde + check. |
| **Visual** | Borda esquerda colorida por tipo: café=#F1C40F, almoço=#2ECC71, lanche=#F39C12, jantar=#3498DB. Background: #FFF. Border-radius: 12px. Shadow: 0 2px 8px rgba(0,0,0,0.08). |

### 4. Card de Exercício

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | T17 (Detalhe do Treino — lista), T18 (Execução — exercício atual) |
| **Dados de entrada** | `name: string`, `sets: number`, `reps: number`, `weight: string`, `equipment: string`, `videoUrl: string`, `completed: boolean` |
| **Variações** | List item (T17), Active (T18 — grande, centralizado), Completed (cinza com check) |
| **Comportamento** | Tap em "Ver vídeo" → abre YouTube. Em T18, tap "Série Concluída" → animação check por série. Completed → fade para cinza-verde. |
| **Visual** | Background: #FFF. Name: 16px bold #1A2744. Sets/reps: 14px #6C757D. Equipment: chip outline #1A2744. Video link: #3498DB underline. |

### 5. Badge Card

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | T22 (Perfil — grid preview), T23 (Conquistas — grid completo), T19 (Treino Concluído — desbloqueio) |
| **Dados de entrada** | `name: string`, `icon: string`, `status: 'locked'|'unlocked'`, `unlockedDate: date?`, `criteria: string` |
| **Variações** | Grid (64px ícone + nome), Modal (detalhes + data + descrição), Unlock animation (fullscreen com confetti) |
| **Comportamento** | Locked: ícone em grayscale com "?" overlay, tap → mostra critério. Unlocked: colorido com brilho sutil, tap → modal com data e descrição motivacional. Desbloqueio: animação scale 0→1 com confetti por 2s. |
| **Visual** | Locked: filter: grayscale(100%), opacity: 0.5. Unlocked: box-shadow: 0 0 12px rgba(46,204,113,0.3). Grid gap: 12px. |

### 6. Card de Desafio

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | T11 (Dashboard — ativo), T25 (Desafio — completo) |
| **Dados de entrada** | `title: string`, `progress: number`, `total: number`, `reward: {xp, energy, badge?}`, `deadline: date`, `status: 'active'|'completed'|'failed'` |
| **Variações** | Compact (Dashboard — 1 card), Full (T25 — com histórico) |
| **Comportamento** | Barra de progresso animada. Tap → T25. Completed → borda verde + check + recompensa visível. |
| **Visual** | Background: #FFF. Title: 16px bold. Progress bar: height 8px, fill #2ECC71. Reward: inline com ícones (🏆 ⚡ ▲). Deadline: 12px #6C757D. Border-radius: 12px. |

### 7. Widget de Hidratação

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | T11 (Dashboard — inline), T21 (Hidratação — página completa) |
| **Dados de entrada** | `cups: number`, `goal: number`, `mlPerCup: number` |
| **Variações** | Inline (8 círculos em 1 row — Dashboard), Full page (com histórico e meta detalhada) |
| **Comportamento** | Tap em círculo vazio → preenche com animação (fill azul sobe) → +5 XP toast → contadores atualizam. |
| **Visual** | Círculo: 32px diameter. Filled: #3498DB. Empty: #E9ECEF border 2px. Gap: 8px. Label: "X/Y copos (X.XL / X.XL)". |

### 8. Toast de XP / Recompensa

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | Qualquer tela, após ação que concede XP/Energia |
| **Dados de entrada** | `xp: number?`, `energy: number?`, `message: string?` |
| **Variações** | XP only ("+15 XP ▲"), XP + Energy ("+50 XP ▲ +20⚡"), Badge unlock (toast + animação completa) |
| **Comportamento** | Aparece no topo (slide down), permanece 2.5s, desliza para cima. Número faz contagem rápida (0→15 em 500ms). Não bloqueia interação. |
| **Visual** | Background: #1A2744 com opacity 0.95. Text: #FFF. XP icon: ▲ em verde. Energy icon: ⚡ em laranja. Border-radius: 12px. Position: fixed top 80px. Max-width: 280px. Centered. |

### 9. Card da Loja (V1.1)

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | T24 (Loja Virtual) |
| **Dados de entrada** | `name: string`, `description: string`, `price: number`, `type: 'consumable'|'permanent'`, `image: url?`, `locked: boolean`, `unlockLevel: number?` |
| **Variações** | Available (botão "Comprar"), Locked (nível insuficiente, grayscale), Purchased (check, sem botão), Insufficient funds (preço em vermelho) |
| **Comportamento** | Tap → modal com descrição completa. "Comprar" → confirmação → animação de moeda saindo → item desbloqueado. |
| **Visual** | Card: 160px width, vertical. Image/icon: 80px. Name: 14px bold. Price: "30⚡" em laranja. Button: outline verde. Border-radius: 12px. |
| **API Funifier** | `GET /v3/virtual-good` (listagem), `POST /v3/virtual-good/{id}/buy` (compra) |

### 10. Level Badge (Header)

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | T11 (Dashboard header), T22 (Perfil) |
| **Dados de entrada** | `level: number`, `levelName: string` |
| **Variações** | Compact (pill no header), Full (pill + descrição no perfil) |
| **Comportamento** | Estático. Animação de glow ao mudar de nível. |
| **Visual** | Pill shape: padding 4px 12px, border-radius 999px. Background: linear-gradient(135deg, #2ECC71, #27AE60). Text: white 12px bold. Format: "Lv.4 Disciplinado". |

### 11. Barra de Progresso do Onboarding

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | T04–T09 (Onboarding steps) |
| **Dados de entrada** | `currentStep: number`, `totalSteps: number` |
| **Variações** | Única |
| **Comportamento** | Preenchimento segmentado (6 blocos). Bloco ativo → verde (#2ECC71). Blocos futuros → cinza (#E9ECEF). Animação slide ao avançar. |
| **Visual** | Height: 4px. Gap entre segmentos: 4px. Border-radius: 2px. Full width minus padding. |

### 12. Card de Resumo Diário

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | T11 (Dashboard — streak section) |
| **Dados de entrada** | `mealsLogged: number`, `mealsTotal: number`, `workoutDone: boolean`, `cupsLogged: number`, `cupsGoal: number` |
| **Variações** | Única |
| **Comportamento** | Tap → expande com detalhes por categoria. Tudo completo → fundo muda para verde claro (#E8F8F0). |
| **Visual** | 3 inline indicators com ícones. Done: verde. Pending: cinza. Format: "Refeições 2/4 ✓". Separator: dot "•". |

### 13. Botão de Ação Principal

| Propriedade | Especificação |
|-------------|---------------|
| **Onde aparece** | Todas as telas (CTAs) |
| **Dados de entrada** | `label: string`, `icon: string?`, `disabled: boolean`, `variant: 'primary'|'secondary'|'outline'` |
| **Variações** | Primary (verde fill), Secondary (navy fill), Outline (borda verde), Disabled (cinza) |
| **Comportamento** | Tap → feedback visual (darken 10% por 100ms). Disabled → opacity 0.5, cursor not-allowed. |
| **Visual** | Height: 48px. Border-radius: 12px. Primary: bg #2ECC71, text white, font 16px bold. Full-width por padrão. Shadow: 0 2px 8px rgba(46,204,113,0.3). |

---

## Tokens de Design (Design System Base)

### Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | #1A2744 | Headers, textos principais, ícones |
| `--color-success` | #2ECC71 | CTAs, progresso, confirmações |
| `--color-accent` | #F39C12 | Conquistas, energia, destaques |
| `--color-warning` | #F1C40F | Alertas suaves, atenção |
| `--color-info` | #3498DB | Hidratação, links, informação |
| `--color-danger` | #E74C3C | Erros, streak em risco |
| `--color-bg` | #F8F9FA | Background geral |
| `--color-card` | #FFFFFF | Background de cards |
| `--color-text` | #2C3E50 | Texto corpo |
| `--color-text-light` | #6C757D | Texto secundário |
| `--color-border` | #E9ECEF | Bordas, divisores |

### Tipografia

| Token | Especificação |
|-------|---------------|
| `--font-family` | 'Inter', 'Poppins', -apple-system, sans-serif |
| `--font-h1` | 24px / 700 / 1.2 line-height |
| `--font-h2` | 20px / 700 / 1.3 |
| `--font-h3` | 16px / 600 / 1.4 |
| `--font-body` | 14px / 400 / 1.5 |
| `--font-caption` | 12px / 400 / 1.4 |
| `--font-micro` | 10px / 400 / 1.3 |

### Espaçamento

| Token | Valor |
|-------|-------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |
| `--space-2xl` | 48px |

### Bordas e Sombras

| Token | Valor |
|-------|-------|
| `--radius-sm` | 8px |
| `--radius-md` | 12px |
| `--radius-lg` | 16px |
| `--radius-full` | 999px |
| `--shadow-card` | 0 2px 8px rgba(0,0,0,0.08) |
| `--shadow-elevated` | 0 4px 16px rgba(0,0,0,0.12) |
| `--shadow-glow-success` | 0 0 12px rgba(46,204,113,0.3) |

### Animações

| Token | Valor | Uso |
|-------|-------|-----|
| `--anim-fast` | 150ms ease-out | Feedback de tap |
| `--anim-medium` | 300ms ease-out | Transições de card |
| `--anim-slow` | 500ms ease-out | Barras de progresso |
| `--anim-celebration` | 2000ms | Confetti, level up |

---

## Checklist de Qualidade (Etapa 6)

- [x] Inventário completo de telas organizado por canal (30 telas)
- [x] Fluxos de navegação cobrem todos os caminhos principais (8 fluxos)
- [x] Wireframes especificados com hierarquia, zonas, dados API, interações e estados
- [x] Prompts para Freepik (7 telas conceito) gerados
- [x] Prompts para Google Stitch (7 telas detalhadas) gerados
- [x] Elementos lúdicos e temáticos da narrativa "Sua Evolução" presentes nas interfaces
- [x] Componentes reutilizáveis identificados e especificados (13 componentes)
- [x] Design tokens definidos (cores, tipografia, espaçamento, sombras, animações)
- [x] Responsividade considerada (base 375px, até 428px)
- [x] Acessibilidade considerada (contraste, tamanhos mínimos)

---

> **Próxima etapa:** Etapa 7 — Planejamento Executivo (Proposta)
