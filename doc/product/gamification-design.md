# Fitness Coach Digital — Design da Gamificação e IA

> **Etapa 5 do Processo Funifier**
> Produto próprio da Funifier | Planejado em 21/02/2026
> Nível de ousadia: **Mediano** — mecânicas perceptíveis, elementos visuais lúdicos sem transformar em jogo

---

# 5.1 — Storytelling e Narrativa Lúdica

## Opção A — "Sua Evolução" (Recomendada ✅)

**Tema:** Jornada de transformação pessoal — o jogador é o protagonista da própria história de evolução.

**Ambientação:** Não existe mundo fantástico. O cenário é a vida real do jogador. A narrativa transforma cada ação cotidiana (comer, treinar, beber água) em **marcos de uma jornada de superação pessoal**. A metáfora é a escalada de uma montanha: cada nível é um acampamento-base mais alto, com vista mais ampla.

**Papel do jogador:** Atleta em formação. Não começa como herói — começa como alguém que decidiu mudar. Essa decisão já é o primeiro ato de coragem.

**Metáfora de progressão:**
- Níveis = Altitudes (Acampamentos-base)
- XP = Metros de elevação conquistados
- Moedas = Energia (recurso para desbloquear conteúdo e recompensas)
- Badges = Marcos da jornada (conquistas reais que documentam a evolução)
- Streaks = Trilha contínua (cada dia é um passo na trilha; parar = sair do caminho)

**Tom emocional:** Inspirador, profissional, acolhedor. Como um coach de verdade: cobra com respeito, celebra com entusiasmo, nunca julga.

**Exemplos de linguagem:**
- "Você subiu 50 metros hoje. A vista daqui já é outra." (ao ganhar XP)
- "7 dias na trilha sem parar. Disciplina é o seu superpoder." (streak)
- "Novo acampamento alcançado: Disciplinado. Poucos chegam aqui." (level up)
- "Dia difícil? Tudo bem. Até o melhor alpinista descansa. Amanhã a trilha continua." (recuperação de inatividade)

**Mecânicas favorecidas:** Progressão, streaks, conquistas pessoais, timeline de evolução, desafios graduais.

---

## Opção B — "Clube de Elite"

**Tema:** O jogador entra em um clube exclusivo de pessoas comprometidas com a transformação. Quanto mais evolui, mais acesso e status ganha dentro do clube.

**Ambientação:** O app é a sede digital de um clube fitness. Há salas (níveis) que só membros avançados acessam. Os membros mais antigos são referência.

**Papel do jogador:** Membro do clube em ascensão.

**Metáfora de progressão:**
- Níveis = Memberships (Bronze → Prata → Ouro → Platina → Diamante → Lenda)
- XP = Reputação no clube
- Moedas = Créditos do clube (para loja interna)
- Badges = Insígnias de reconhecimento

**Tom emocional:** Aspiracional, competitivo, exclusivo. "Poucos chegam ao nível Platina."

**Mecânicas favorecidas:** Leaderboard, exclusividade, desbloqueio de conteúdo, social proof, competição.

---

## Opção C — "Missão Saúde"

**Tema:** O jogador recebe "missões" diárias e semanais de um coach IA. Cada missão cumprida fortalece seu perfil de saúde. A cada fase, as missões ficam mais desafiadoras e estratégicas.

**Ambientação:** Operação de campo — o coach é o estrategista, o jogador é o agente de campo executando as missões.

**Papel do jogador:** Agente de saúde (de si mesmo).

**Metáfora de progressão:**
- Níveis = Patentes (Recruta → Agente → Especialista → Comandante → Mestre)
- XP = Pontos de missão
- Moedas = Suprimentos (para loja)
- Badges = Condecorações

**Tom emocional:** Focado, orientado a objetivos, levemente lúdico sem ser infantil.

**Mecânicas favorecidas:** Desafios/missões, checklists, feedback objetivo, progressão estruturada, conquistas.

---

## Narrativa Escolhida para o Design: **Opção A — "Sua Evolução"**

**Justificativa:** É a mais alinhada com o público brasileiro de classes B/C que busca transformação real. Não é infantil, não é elitista, não é militar. É pessoal. A metáfora da escalada é universalmente compreendida e motivadora. Funciona para todos os subperfis (iniciante frustrado, praticante inconsistente, pessoa com restrição orçamentária).

---

## Guia Visual

| Elemento | Especificação |
|----------|---------------|
| **Paleta primária** | Azul escuro (#1A2744) — confiança, profissionalismo |
| **Paleta secundária** | Verde vibrante (#2ECC71) — saúde, progresso, positividade |
| **Cor de destaque** | Laranja (#F39C12) — energia, conquistas, celebrações |
| **Cor de alerta suave** | Amarelo (#F1C40F) — atenção sem pânico |
| **Backgrounds** | Brancos e cinza claro (#F8F9FA) — limpo, leve, mobile-first |
| **Tipografia títulos** | Sans-serif bold (Inter, Poppins ou similar) — moderno, legível |
| **Tipografia corpo** | Sans-serif regular — leitura confortável em mobile |
| **Estilo de ícones** | Flat com preenchimento suave, bordas arredondadas, 2 cores max |
| **Estilo de ilustrações** | Minimalista com toques de cor. Sem cartoon, sem 3D. Ícones e gráficos limpos |
| **Elementos temáticos** | Montanhas estilizadas como linha de progresso. Trilha como metáfora visual de streaks. Sol nascente = nível alcançado |
| **Evolução visual** | Cores ficam mais vibrantes com progresso. Fundo do dashboard ganha elementos de altitude (nuvens, pico). Badges ganham detalhes |
| **Referências visuais** | Strava (progressão e comunidade), Duolingo (loops e streaks, não o visual infantil), Nike Run Club (tom profissional e motivador) |

---

# 5.2 — Jornada do Jogador

## Fase 1 — Descoberta (Dia 0)

| Aspecto | Detalhe |
|---------|--------|
| **Objetivo emocional** | Curiosidade + esperança — "esse app parece diferente" |
| **Duração** | Minutos (landing page / app store / indicação) |
| **Ações do jogador** | Ver anúncio/indicação → visitar landing/app store → baixar app |
| **Funcionalidades ativas** | Landing page, screenshots, depoimentos, proposta de valor |
| **Feedback/Recompensa** | Promessa clara: "Seu coach pessoal de nutrição e treino por R$ 19,90/mês" |
| **Emoção-alvo** | "Isso pode funcionar para mim, mesmo com meu orçamento" |
| **Risco de abandono** | Desconfiança ("app não funciona"), preço, visual genérico |
| **Mitigação** | Social proof (antes/depois reais), trial gratuito, destaque da adaptação financeira |

## Fase 2 — Onboarding (Dias 1-3)

| Aspecto | Detalhe |
|---------|--------|
| **Objetivo emocional** | Sentir-se acolhido e personalizado — "ele me entende" |
| **Duração** | 1-3 dias (completar perfil + receber primeiro plano) |
| **Ações do jogador** | Criar conta → preencher dados básicos → informar objetivo → foto corporal (opcional) → informar orçamento alimentar → informar rotina de treino → foto do ambiente de treino → receber planos |
| **Funcionalidades ativas** | F1 (Onboarding Inteligente), F2 (Plano Alimentar), F4 (Plano de Treino), F7 (Adaptação Financeira) |
| **Feedback/Recompensa** | Barra de progresso do onboarding, badge "Primeiro Passo" ao completar perfil, XP inicial (+100 XP), primeiro plano gerado com nome do jogador |
| **Emoção-alvo** | "Esse app realmente levou em conta a minha realidade" |
| **Risco de abandono** | Onboarding longo demais, vergonha da foto corporal, frustração com formulários |
| **Mitigação** | Conversa guiada (não formulário frio), foto corporal opcional com linguagem acolhedora, resultado imediato (plano gerado em segundos após onboarding) |

**Módulos Funifier:** Action (registro do onboarding), Point (XP inicial), Challenge (completar perfil)

## Fase 3 — Primeiros Desafios (Dias 3-14)

| Aspecto | Detalhe |
|---------|--------|
| **Objetivo emocional** | Sensação de conquista e capacidade — "eu consigo manter isso" |
| **Duração** | ~10 dias (primeiras 2 semanas) |
| **Ações do jogador** | Seguir plano alimentar → fotografar pratos → realizar treinos → registrar água → completar primeiro desafio semanal → consultar dashboard de evolução |
| **Funcionalidades ativas** | F2, F3 (Foto do Prato), F4, F5 (Dashboard), F9 (Hidratação), F10 (Gamificação) |
| **Feedback/Recompensa** | XP por cada ação, streak começando, primeiro badge de consistência ("3 dias seguidos"), feedback da IA sobre fotos de prato, nível "Iniciante" → "Comprometido" |
| **Emoção-alvo** | "Estou conseguindo! Não é tão difícil quanto eu pensava" |
| **Risco de abandono** | **CRÍTICO** — a maioria desiste aqui. Falta de resultado visível, rotina não se encaixou, preguiça de registrar |
| **Mitigação** | Micro-vitórias constantes (XP a cada ação), notificações inteligentes ("falta 1 treino para completar a semana!"), feedback positivo da IA sobre fotos de prato, desafios de dificuldade baixa que garantem conquista |

**Módulos Funifier:** Challenge (desafios semanais), Point (XP + moedas), Level (primeiros níveis), Action (todas as ações core), Notification (lembretes)

## Fase 4 — Engajamento Contínuo (Semanas 3-12)

| Aspecto | Detalhe |
|---------|--------|
| **Objetivo emocional** | Orgulho e identidade — "eu sou uma pessoa disciplinada" |
| **Duração** | Semanas 3-12 (3 meses) |
| **Ações do jogador** | Rotina diária consolidada → check-in corporal mensal → ajustes de rotina (viagem, mudança) → explorar loja virtual → desafios semanais variados → interagir com coach IA → comparar evolução na timeline |
| **Funcionalidades ativas** | Todas as anteriores + F6 (Ajustes Dinâmicos), F8 (Coach IA Chat), F10 (Loja Virtual, Leaderboard) |
| **Feedback/Recompensa** | Level ups significativos, badges de marco (30 dias, 50 treinos, 100 pratos registrados), moedas para loja, comparativo de fotos corporais, desafios cada vez mais personalizados |
| **Emoção-alvo** | "Estou vendo resultado. As pessoas estão notando." |
| **Risco de abandono** | Platô (sem resultado visível), monotonia (mesmos desafios), mudança de rotina não acompanhada |
| **Mitigação** | IA detecta platô e ajusta planos, desafios variáveis e sazonais, ajustes dinâmicos por mudança de rotina, timeline de fotos mostrando mudanças sutis, leaderboard opt-in para quem busca competição |

**Módulos Funifier:** Challenge (variados), Leaderboard (opt-in), Virtual Good (loja), Level (progressão), Point (XP + moedas), Notification (conquistas e risco de streak)

## Fase 5 — Mastery / Domínio (Mês 4+)

| Aspecto | Detalhe |
|---------|--------|
| **Objetivo emocional** | Pertencimento e legado — "eu sou referência nisso" |
| **Duração** | Mês 4 em diante (sem fim) |
| **Ações do jogador** | Manter rotina com autonomia → indicar amigos → compartilhar evolução → acessar conteúdo avançado (suplementação, periodização) → desafios de alto nível → contribuir com a comunidade |
| **Funcionalidades ativas** | Todas + conteúdo premium desbloqueado, desafios avançados, programa de indicação |
| **Feedback/Recompensa** | Títulos exclusivos ("Atleta", "Mestre"), acesso a conteúdo avançado, reconhecimento na comunidade, desconto na assinatura por indicação, badges raros |
| **Emoção-alvo** | "Esse app mudou minha vida. Quero que outras pessoas usem também." |
| **Risco de abandono** | Sensação de "já conquistei tudo", falta de novidade |
| **Mitigação** | Conteúdo novo periódico, desafios sazonais, sistema de indicação com recompensas, metas cada vez mais ambiciosas (ex: desafio de 365 dias) |

**Módulos Funifier:** Challenge (avançados), Virtual Good (exclusivos), Level (últimos níveis), Leaderboard (ranking mensal), Notification (novidades)

---

# 5.3 — Octalysis: Core Drives por Fase

> Nível de ousadia: **Mediano** — mecânicas perceptíveis, elementos visuais lúdicos integrados naturalmente à experiência fitness.

## Mapa Geral

| Fase | Core Drives Dominantes | Core Drives de Suporte |
|------|----------------------|----------------------|
| Descoberta | CD1 (Significado Épico), CD7 (Imprevisibilidade) | CD5 (Influência Social) |
| Onboarding | CD1 (Significado Épico), CD2 (Progresso) | CD3 (Empoderamento Criativo) |
| Primeiros Desafios | CD2 (Progresso), CD4 (Posse) | CD6 (Escassez), CD5 (Social) |
| Engajamento Contínuo | CD2 (Progresso), CD3 (Empoderamento), CD5 (Social) | CD4 (Posse), CD6 (Escassez), CD7 (Imprevisibilidade) |
| Mastery | CD1 (Significado), CD3 (Empoderamento), CD5 (Social) | CD2 (Progresso), CD4 (Posse) |

---

### Fase 1 — Descoberta

**CD1 — Epic Meaning & Calling (Significado Épico)**
- **Técnica:** Narrative / Humanity Hero
- **Manifestação:** Landing page mostra que o app existe para democratizar o acesso a coaching fitness. "Antes, só quem tinha R$ 500/mês podia ter nutricionista e personal. Agora, todo mundo pode."
- **Módulo Funifier:** N/A (marketing externo)

**CD7 — Unpredictability & Curiosity (Imprevisibilidade)**
- **Técnica:** Glowing Choice
- **Manifestação:** CTA que gera curiosidade: "Descubra o que a IA recomendaria para seu corpo" — convite para o onboarding
- **Módulo Funifier:** N/A (marketing externo)

**CD5 — Social Influence (Suporte)**
- **Técnica:** Social Proof
- **Manifestação:** Depoimentos e fotos de evolução de usuários reais na landing page
- **Módulo Funifier:** N/A (marketing externo)

---

### Fase 2 — Onboarding

**CD1 — Epic Meaning & Calling**
- **Técnica:** Elitism / Beginners Luck
- **Manifestação:** "Você tomou a melhor decisão. A maioria das pessoas quer mudar mas nunca dá o primeiro passo. Você deu." + XP bônus de boas-vindas (+100 XP)
- **Módulo Funifier:** Point (XP bônus), Challenge ("Completar Perfil")

**CD2 — Development & Accomplishment (Progresso)**
- **Técnica:** Progress Bar / Step-by-step Tutorial
- **Manifestação:** Barra de progresso do onboarding (6 etapas visíveis), cada etapa completada dá feedback visual + XP
- **Módulo Funifier:** Action (etapas do onboarding), Point (XP por etapa), Challenge (completar onboarding)

**CD3 — Empowerment of Creativity (Suporte)**
- **Técnica:** Meaningful Choices
- **Manifestação:** Escolher objetivo, preferências alimentares, local de treino, orçamento. Cada escolha mostra como afeta o plano: "Com base no seu orçamento, vamos montar um plano com arroz, feijão, frango e ovos — simples e eficiente."
- **Módulo Funifier:** Action (registro de preferências)

---

### Fase 3 — Primeiros Desafios

**CD2 — Development & Accomplishment (Dominante)**
- **Técnica:** Streaks / Countdown Timer / Badges
- **Manifestação:** Streak visual na home ("🔥 3 dias na trilha"), badges de primeira vez ("Primeiro Treino", "Primeiro Prato Registrado", "3 Dias Seguidos"), barra de XP mostrando proximidade do próximo nível
- **Módulo Funifier:** Challenge (streaks e badges), Point (XP), Level (progressão)

**CD4 — Ownership & Possession (Dominante)**
- **Técnica:** Collection Set / Monitor Attachment
- **Manifestação:** Timeline de fotos corporais sendo construída (mesmo com 1 foto), coleção de badges começando a crescer, "seu plano" personalizado que o jogador sente como próprio
- **Módulo Funifier:** Virtual Good (badges como colecionáveis), Action (check-in fotos)

**CD6 — Scarcity & Impatience (Suporte)**
- **Técnica:** Appointment Dynamics / Dangling
- **Manifestação:** Desafios com prazo ("Complete 3 treinos até domingo para ganhar o badge Guerreiro da Semana"), conteúdo que aparece bloqueado na loja ("Desbloqueie no nível Disciplinado")
- **Módulo Funifier:** Challenge (prazo), Virtual Good (itens bloqueados por nível)

**CD5 — Social Influence (Suporte)**
- **Técnica:** Social Treasure / Bragging
- **Manifestação:** Opção de compartilhar primeira conquista nas redes: "Completei minha primeira semana no [App]! 🔥"
- **Módulo Funifier:** (integração com share nativo do dispositivo)

---

### Fase 4 — Engajamento Contínuo

**CD2 — Development & Accomplishment**
- **Técnica:** Level Up / Achievement Symbols / Leaderboard
- **Manifestação:** Level ups com celebração visual (animação de "novo acampamento alcançado"), badges de volume (50 treinos, 100 pratos), leaderboard semanal opt-in
- **Módulo Funifier:** Level, Challenge, Leaderboard

**CD3 — Empowerment of Creativity**
- **Técnica:** Evergreen Mechanics / Boosters
- **Manifestação:** Jogador ajusta seu próprio plano via coach IA ("quero trocar frango por peixe esta semana"), escolhe quais desafios aceitar, personaliza metas semanais
- **Módulo Funifier:** Action (interação com coach), Challenge (desafios opcionais)

**CD5 — Social Influence**
- **Técnica:** Mentorship / Group Quest / Social Prod
- **Manifestação:** Leaderboard opt-in semanal, desafio de grupo (ex: "Juntos, os membros deste mês completaram 10.000 treinos"), notificação social ("Seu amigo João acabou de subir para o nível Atleta")
- **Módulo Funifier:** Leaderboard, Challenge (grupo), Notification

**CD4 — Ownership & Possession (Suporte)**
- **Técnica:** Virtual Goods / Collection Set
- **Manifestação:** Loja virtual com itens desbloqueáveis (receitas premium, treinos avançados, dicas de suplementação), coleção de badges crescendo
- **Módulo Funifier:** Virtual Good, Point (moedas como currency)

**CD6 — Scarcity & Impatience (Suporte)**
- **Técnica:** Fixed Intervals / Prize Pacing
- **Manifestação:** Desafios semanais que resetam (urgência), itens limitados na loja (sazonais), "Faltam 200 XP para o próximo nível"
- **Módulo Funifier:** Challenge (semanal com reset), Virtual Good (itens limitados)

**CD7 — Unpredictability & Curiosity (Suporte)**
- **Técnica:** Easter Eggs / Random Rewards
- **Manifestação:** Desafio surpresa mensal ("Desafio do Chef: registre 5 pratos diferentes esta semana"), recompensa bônus aleatória por completar streak de 7 dias
- **Módulo Funifier:** Challenge (surpresa), Point (bônus variável)

---

### Fase 5 — Mastery

**CD1 — Epic Meaning & Calling**
- **Técnica:** Humanity Hero / Narrative
- **Manifestação:** "Você chegou ao topo. Agora, ajude outros a subir." Programa de indicação com narrativa de mentoria. O jogador veterano é parte de algo maior.
- **Módulo Funifier:** Challenge (indicação), Virtual Good (recompensa de indicação)

**CD3 — Empowerment of Creativity**
- **Técnica:** Milestone Unlock / Evergreen Mechanics
- **Manifestação:** Conteúdo avançado desbloqueado (periodização, nutrição de performance, suplementação inteligente), metas personalizáveis de longo prazo
- **Módulo Funifier:** Virtual Good (conteúdo premium), Level (desbloqueio por nível)

**CD5 — Social Influence**
- **Técnica:** Social Treasure / Mentorship / Trophy Shelf
- **Manifestação:** Perfil público com badges e evolução (opt-in), ranking mensal de veteranos, possibilidade de compartilhar timeline de evolução
- **Módulo Funifier:** Leaderboard, Virtual Good (badges de prestígio)

---

# 5.4 — Loops de Engajamento

## Loop Diário — "A Trilha do Dia"

| Elemento | Detalhe |
|----------|--------|
| **Gatilho** | Push notification no horário da primeira refeição: "Bom dia! Sua trilha de hoje: café da manhã → treino → almoço. Vamos?" |
| **Ação** | Registrar refeições (foto do prato ou check), realizar treino, registrar água |
| **Feedback** | XP imediato por ação, análise da IA na foto do prato, streak atualizado em tempo real |
| **Recompensa** | XP + moedas acumulados, streak +1, progresso na barra de nível |
| **Variabilidade** | Dica do dia diferente, frase motivacional do coach rotativa, desafio diário opcional variável ("Hoje: beba 3L de água" / "Hoje: adicione legumes ao almoço") |

**Módulos Funifier:** Action, Point, Challenge (diário), Notification

## Loop Semanal — "Desafio da Semana"

| Elemento | Detalhe |
|----------|--------|
| **Gatilho** | Segunda-feira: "Seu desafio da semana chegou!" Push + card na home |
| **Ação** | Completar X treinos, registrar Y pratos, manter streak de Z dias |
| **Feedback** | Progresso do desafio atualizado em tempo real (ex: "3/5 treinos"), notificação na sexta se estiver perto de completar |
| **Recompensa** | Badge da semana + moedas bônus + XP bônus. Desafios cumpridos por 4 semanas seguidas = badge "Mês de Ferro" |
| **Reset** | Toda segunda-feira, novo desafio. Histórico de desafios anteriores visível. |

**Módulos Funifier:** Challenge (semanal, com recurrence), Point, Virtual Good (badge semanal), Notification

## Loop de Progressão — "A Escalada"

| Elemento | Detalhe |
|----------|--------|
| **Gatilho** | Proximidade de level up: "Faltam 150 XP para o Acampamento Disciplinado!" |
| **Ação** | Acumular XP via ações diárias e desafios |
| **Feedback** | Barra de progresso sempre visível na home, animação de celebração no level up |
| **Recompensa** | Novo título, novo visual no dashboard (elementos de altitude), desbloqueio de conteúdo na loja, badge de nível |
| **Marcos de celebração** | Cada level up, streaks de 7/30/100/365 dias, 50/100/500 treinos, check-in corporal mensal com comparativo |

**Módulos Funifier:** Level, Point, Virtual Good (desbloqueio por nível), Challenge (marco), Notification

## Loop Social — "A Comunidade"

| Elemento | Detalhe |
|----------|--------|
| **Gatilho** | "Seu amigo João completou 30 dias!", leaderboard semanal atualizado, desafio comunitário lançado |
| **Ação** | Comparar ranking (opt-in), indicar amigos, compartilhar conquistas |
| **Feedback** | Posição no leaderboard, notificação de amigo ativo, contador comunitário |
| **Recompensa** | Destaque no leaderboard, badge "Conectado" (por indicação aceita), moedas bônus por indicação |
| **Variabilidade** | Leaderboard reseta semanalmente (chance nova para todos), desafios comunitários temáticos mensais |

**Módulos Funifier:** Leaderboard (semanal, opt-in), Challenge (indicação, comunitário), Point, Notification

---

# 5.5 — Economia do Jogo

## Moedas e Pontos

| Moeda | Função | Ícone | Como ganha | Como gasta |
|-------|--------|-------|------------|------------|
| **XP (Elevação)** | Progressão de nível | ▲ | Todas as ações e desafios | Não se gasta — acumula para nível |
| **Energia (E)** | Moeda de troca | ⚡ | Desafios completados, streaks, bônus | Loja virtual (conteúdo, receitas, treinos) |

> XP e Energia são independentes. Não há conversão entre eles. XP = progresso permanente. Energia = economia circulante.

## Tabela de Pontuações

| Ação / Desafio | XP | Energia | Frequência máxima |
|----------------|----|---------|--------------------|
| **Ações Diárias** | | | |
| Registrar refeição (foto/check) | 15 | 0 | 5x/dia |
| Completar treino | 30 | 0 | 1x/dia |
| Registrar água (copo) | 5 | 0 | 10x/dia |
| Interagir com coach IA | 10 | 0 | 3x/dia |
| **Desafios** | | | |
| Desafio diário (variável) | 20 | 5 | 1x/dia |
| Desafio semanal | 100 | 30 | 1x/semana |
| Desafio mensal | 300 | 100 | 1x/mês |
| **Streaks** | | | |
| Streak de 7 dias | 50 | 15 | 1x ao atingir |
| Streak de 30 dias | 200 | 60 | 1x ao atingir |
| Streak de 100 dias | 500 | 200 | 1x ao atingir |
| Streak de 365 dias | 2000 | 1000 | 1x ao atingir |
| **Marcos** | | | |
| Check-in corporal (foto mensal) | 50 | 20 | 1x/mês |
| Completar onboarding | 100 | 30 | 1x (lifetime) |
| Indicar amigo (que se cadastra) | 100 | 50 | sem limite |
| Atualizar peso semanal | 20 | 5 | 1x/semana |

**Limites diários de XP:** ~200 XP/dia (via ações normais). Bônus de desafios e streaks não contam no limite.

## Curva de Progressão de Níveis

| Nível | Nome | XP Necessário | XP Acumulado | Tempo estimado (jogador médio*) |
|-------|------|--------------|-------------|-------------------------------|
| 1 | Iniciante | 0 | 0 | Dia 0 |
| 2 | Comprometido | 300 | 300 | ~3 dias |
| 3 | Consistente | 600 | 900 | ~1 semana |
| 4 | Disciplinado | 1.200 | 2.100 | ~2 semanas |
| 5 | Dedicado | 2.000 | 4.100 | ~1 mês |
| 6 | Forte | 3.000 | 7.100 | ~6 semanas |
| 7 | Atleta | 4.500 | 11.600 | ~2 meses |
| 8 | Guerreiro | 6.000 | 17.600 | ~3 meses |
| 9 | Elite | 8.000 | 25.600 | ~4.5 meses |
| 10 | Mestre | 10.000 | 35.600 | ~6 meses |

*\*Jogador médio: ~120-150 XP/dia (3 refeições registradas, 1 treino, água, 1 desafio diário)*

## Loja Virtual (Itens por Energia ⚡)

| Item | Preço (⚡) | Tipo | Dias para comprar* | Limite |
|------|-----------|------|---------------------|--------|
| Receita premium (unitária) | 30 | Consumível (desbloqueio permanente) | ~3 dias | sem limite |
| Pacote de 5 receitas temáticas | 120 | Consumível | ~2 semanas | sem limite |
| Treino avançado (rotina especial) | 50 | Consumível (desbloqueio permanente) | ~5 dias | sem limite |
| Guia de suplementação | 100 | Consumível (desbloqueio permanente) | ~10 dias | 1x |
| Badge customizado (visual) | 80 | Permanente | ~8 dias | 5 disponíveis |
| Desafio extra da semana | 20 | Consumível | ~2 dias | 1x/semana |
| Reset de streak (protege o streak 1x) | 150 | Consumível | ~2 semanas | 1x/mês |

*\*Jogador médio ganhando ~10-15 Energia/dia via desafios diários + semanais*

## Simulação de Cenários

### Jogador Casual (1-2 ações/dia: registra almoço + água)
- XP/dia: ~35-40
- Energia/dia: ~5 (desafio diário esporádico)
- Tempo para Nível 5 (Dedicado): ~3 meses
- Tempo para comprar 1 receita premium: ~6 dias
- **Análise:** Progresso lento mas perceptível. Não frustra. Incentiva a fazer mais ações.

### Jogador Ativo (5-8 ações/dia: 3 refeições + treino + água + desafio diário)
- XP/dia: ~130-150
- Energia/dia: ~10-15
- Tempo para Nível 5 (Dedicado): ~1 mês
- Tempo para comprar 1 receita premium: ~2-3 dias
- **Análise:** Progresso satisfatório. Consegue explorar a loja. Sente recompensa pelo esforço.

### Jogador Intenso (10+ ações/dia: tudo + desafios extras + coach IA)
- XP/dia: ~200 (teto diário) + bônus de desafios
- Energia/dia: ~20-30
- Tempo para Nível 5 (Dedicado): ~3 semanas
- Tempo para Nível 10 (Mestre): ~5 meses
- **Análise:** Progride rápido mas não esgota o conteúdo. O teto de XP diário previne corrida desenfreada.

## Mecanismos Anti-Inflação

| Mecanismo | Implementação |
|-----------|---------------|
| **Teto diário de XP** | Máximo ~200 XP por ações regulares/dia. Bônus de conquistas únicas (streaks, badges) não contam no teto |
| **Itens consumíveis** | Receitas e treinos desbloqueados são permanentes mas unitários (cada um tem custo). Reset de streak é consumível |
| **Custos crescentes** | Badges customizados ficam mais caros a cada compra (80 → 120 → 160 ⚡) |
| **Itens sazonais** | Itens temáticos que só aparecem em períodos específicos (ex: "Desafio Verão") — criam sink de moedas |
| **Sem conversão XP↔Energia** | Impede farming de uma moeda para abusar da outra |
| **Frequência máxima por ação** | Limites claros por ação (não dá pra registrar 50 copos de água) |
| **Desafio semanal como principal fonte de Energia** | Jogador precisa completar desafios (engajamento real) para ter poder de compra. Não basta fazer ações passivas |

---

# 5.6 — Uso da IA na Jornada

## Fase 1 — Descoberta

| Aplicação | O que a IA faz | Dados de entrada | Resultado | Complexidade | Impacto |
|-----------|----------------|------------------|-----------|--------------|---------|
| Quiz de atratividade | Perguntas rápidas na landing page ("Qual seu objetivo? Quanto gasta em comida?") → prévia do que o app faria | Respostas do quiz | Teaser personalizado do plano | Baixa | Alto |

## Fase 2 — Onboarding

| Aplicação | O que a IA faz | Dados de entrada | Resultado | Complexidade | Impacto |
|-----------|----------------|------------------|-----------|--------------|---------|
| Análise de foto corporal | Estimativa visual de composição corporal, definição de baseline | Foto frontal/lateral + dados declarados | Baseline de composição + recomendação inicial | Alta | Alto |
| Análise de ambiente de treino | Identificação de equipamentos disponíveis no local fotografado | Foto do local de treino | Lista de equipamentos → plano adaptado | Alta | Alto |
| Geração de plano alimentar | Cardápio semanal personalizado por orçamento, preferências e objetivo | Perfil completo + orçamento | Plano alimentar com horários, quantidades, dicas | Alta | Crítico |
| Geração de plano de treino | Agenda semanal de treinos adaptada ao local, equipamento e disponibilidade | Perfil + equipamentos + disponibilidade | Plano de treino com exercícios, séries, cargas, vídeos | Alta | Crítico |

## Fase 3 — Primeiros Desafios

| Aplicação | O que a IA faz | Dados de entrada | Resultado | Complexidade | Impacto |
|-----------|----------------|------------------|-----------|--------------|---------|
| Análise de foto do prato | Estimativa calórica, comparação com plano, feedback educativo | Foto do prato + plano atual | Feedback: "alinhado", "porção maior", dicas | Alta | Crítico |
| Feedback motivacional | Mensagens personalizadas baseadas no comportamento dos primeiros dias | Ações realizadas, streaks, horários | Mensagens de incentivo contextualizadas | Baixa | Alto |
| Seleção de desafios | Escolhe desafios da semana adequados ao nível e histórico | Perfil, nível, ações recentes | Desafio semanal personalizado | Média | Médio |

## Fase 4 — Engajamento Contínuo

| Aplicação | O que a IA faz | Dados de entrada | Resultado | Complexidade | Impacto |
|-----------|----------------|------------------|-----------|--------------|---------|
| Progressão de carga | Ajuste automático de cargas/repetições baseado em desempenho | Histórico de treinos, performance | Treinos atualizados com progressão | Média | Alto |
| Detecção de platô | Identifica estagnação e sugere ajustes no plano | Peso, fotos, ações, frequência | Alerta + sugestão de mudança | Média | Alto |
| Detecção de risco de abandono | Padrões de queda de engajamento (menos logins, ações puladas) | Comportamento temporal | Intervenção preventiva (notificação, ajuste de desafio) | Média | Crítico |
| Replanejamento por mudança de rotina | Ajuste de treino e dieta quando jogador informa mudança (viagem, férias) | Nova restrição informada | Planos ajustados + tom menos cobrador | Média | Alto |
| Coach IA (chat) | Responde dúvidas sobre alimentação, treino, execução | Pergunta + perfil + planos atuais | Resposta personalizada e contextualizada | Média | Alto |
| Timing de notificações | Aprende melhores horários e frequência para cada jogador | Padrões de abertura de notificações | Notificações no momento certo, sem irritar | Média | Médio |

## Fase 5 — Mastery

| Aplicação | O que a IA faz | Dados de entrada | Resultado | Complexidade | Impacto |
|-----------|----------------|------------------|-----------|--------------|---------|
| Conteúdo adaptativo avançado | Sugere conteúdo de acordo com maturidade do jogador (periodização, suplementação) | Nível, tempo de uso, histórico | Conteúdo desbloqueado relevante | Baixa | Médio |
| Análise de tendência de longo prazo | Compara evolução corporal ao longo de meses, identifica padrões | Fotos mensais, peso, medidas | Relatório de evolução com insights | Média | Alto |
| Desafios de alto nível | Gera desafios ambiciosos mas alcançáveis para jogadores avançados | Perfil avançado, histórico completo | Desafios de longo prazo (ex: "30 dias de treino com progressão de carga") | Média | Médio |

---

# 5.7 — Checagem de Coerência

## 1. Narrativa × Técnicas de Jogo

| Verificação | Status | Observação |
|-------------|--------|------------|
| Metáfora de escalada + XP como elevação + níveis como acampamentos | ✅ Coerente | Todas as técnicas de progressão (streaks, levels, badges) se encaixam na metáfora de "subir a montanha" |
| Linguagem do coach + badges com nomes motivadores | ✅ Coerente | Nomes como "Disciplinado", "Atleta", "Guerreiro" reforçam o tom de coach profissional |
| Leaderboard + narrativa de jornada pessoal | ⚠️ Atenção | Leaderboard pode contradizer a narrativa de "sua própria jornada". **Solução:** Leaderboard é opt-in e posicionado como "parceiros de trilha", não como competição direta |
| Loja virtual + metáfora de escalada | ✅ Coerente | Energia ⚡ como recurso para "equipar-se" para a escalada (receitas, treinos, guias) funciona narrativamente |
| Desafio surpresa + tom profissional | ✅ Coerente | Desafios surpresa são apresentados como "oportunidades inesperadas na trilha", não como roleta aleatória |

## 2. Core Drives × Fases da Jornada

| Verificação | Status | Observação |
|-------------|--------|------------|
| Cada fase tem 2+ Core Drives ativos | ✅ OK | Descoberta (3), Onboarding (3), Primeiros Desafios (4), Engajamento Contínuo (6), Mastery (4) |
| CD8 (Loss & Avoidance) está ausente | ✅ Intencional | Para um app de saúde voltado a público com frustrações anteriores, usar medo de perda seria prejudicial. Streaks criam "avoidance suave" naturalmente, sem que CD8 seja dominante |
| CD2 (Progresso) está presente em todas as fases | ✅ OK | É o core drive central do produto — adequado para um app de transformação |
| Transição suave entre fases | ✅ OK | De CD1+CD2 (significado + progresso) no início para CD3+CD5 (empoderamento + social) no fim — natural para maturidade do jogador |

## 3. Economia × Jornada

| Verificação | Status | Observação |
|-------------|--------|------------|
| Jogador casual consegue progredir sem frustração | ✅ OK | Nível 5 em ~3 meses (casual). Lento mas com micro-vitórias constantes (XP diário) |
| Jogador intenso não esgota o sistema | ✅ OK | Teto de XP diário + 10 níveis + itens com custo crescente = ~5-6 meses para "completar" |
| Itens da loja são alcançáveis | ✅ OK | Receita mais barata (30⚡) acessível em 2-3 dias para jogador ativo. Reset de streak (150⚡) exige ~2 semanas — correto, deve ser valioso |
| Risco de inflação | ✅ Controlado | Teto diário de XP, frequência máxima por ação, itens consumíveis, custos crescentes |
| Risco de escassez | ⚠️ Monitorar | Jogador casual ganha pouca Energia (~5/dia). **Solução:** Garantir que desafios semanais sejam alcançáveis por casuals (30⚡ é significativo para eles). Ajustar se necessário pós-lançamento |

## 4. Loops × Retenção

| Verificação | Status | Observação |
|-------------|--------|------------|
| Cada fase tem loop ativo | ✅ OK | Onboarding (loop de progresso), Primeiros Desafios (loop diário + semanal), Engajamento (todos os loops), Mastery (progressão + social) |
| Loop diário é sustentável | ✅ OK | 3-5 ações por dia, variabilidade via dica/frase/desafio rotativo. Não exige mais de 10 minutos |
| Loop semanal cria urgência saudável | ✅ OK | Desafio semanal reseta na segunda. Notificação na sexta se estiver perto. Sem punição por não completar |
| Loop social não é obrigatório | ✅ OK | Leaderboard opt-in, compartilhamento opcional. Não penaliza quem joga sozinho |
| Há mecanismo de reativação | ✅ OK | IA detecta queda de engajamento → notificação personalizada + desafio de "volta à trilha" com XP bônus |

## 5. IA × Experiência

| Verificação | Status | Observação |
|-------------|--------|------------|
| IA melhora experiência sem ser impessoal | ✅ OK | Coach IA tem tom humano, usa nome do jogador, contextualiza feedback. "IA invisível" — usuário sente acompanhamento, não tecnologia |
| Dados necessários estão disponíveis | ✅ OK | Onboarding coleta perfil completo. Ações diárias geram dados comportamentais. Fotos geram dados visuais. Tudo disponível nos módulos Funifier (Action logs, Point history) |
| Custo de IA é gerenciável | ⚠️ Monitorar | Geração de planos (alta complexidade) acontece poucas vezes (onboarding + ajustes). Chat diário pode usar modelo mais leve. Análise de foto de prato é a operação mais frequente — precisa de otimização (cache de pratos similares) |
| IA não incentiva comportamento nocivo | ✅ OK | Teto de XP impede que IA incentive over-training. IA adapta tom em dias difíceis. Desafios de descanso incluídos |

## Ajustes Recomendados

1. **Leaderboard:** Renomear para "Parceiros de Trilha" e mostrar como inspiração, não ranking puro. Mostrar "jogadores no mesmo nível que você" em vez de ranking global.

2. **Energia para casuals:** Criar "Energia de boas-vindas" nas primeiras 2 semanas (+10⚡/dia bônus) para que casuals consigam experimentar a loja antes de precisar ser super ativos.

3. **Custo de IA (foto de prato):** Implementar cache de análises similares. Se o jogador fotografa arroz+feijão+frango 5x na semana, a IA pode reutilizar análise com pequenos ajustes em vez de processar do zero.

4. **Desafios de descanso:** Incluir 1x por mês um desafio tipo "Descanse e recupere" que dá XP por registrar um dia de descanso ativo (alongamento, caminhada leve). Reforça que descanso faz parte da evolução.

---

# Síntese: Jornada Narrativa

*A história de Ana, uma jogadora típica.*

Ana tem 28 anos, trabalha como atendente e gasta R$ 400/mês com alimentação. Já tentou dieta três vezes. Desistiu todas.

Um amigo compartilhou no Instagram: "30 dias no [App] e já subi de Iniciante pra Disciplinado 🔥". Ana clicou no link. Na landing page, leu: "Seu coach de nutrição e treino por R$ 19,90/mês. Funciona com arroz e feijão." Sentiu que era pra ela.

No onboarding, o app perguntou seu orçamento. Ela colocou R$ 400. O coach respondeu: "Perfeito. Vamos montar um plano eficiente com o que você já compra." Fotografou a cozinha de casa — a IA viu que ela tinha uma mesa, um par de halteres antigos e um tapete. O plano de treino veio adaptado para isso. Ao completar o perfil, uma mensagem: "Primeiro Passo conquistado. +100 de elevação. Bem-vinda à trilha, Ana."

Na primeira semana, Ana fotografou seus pratos. O coach disse: "Arroz com feijão e ovo? Ótima escolha. A porção de arroz está um pouco acima — tente 3 colheres em vez de 4." Sem julgamento. Ana ganhou XP a cada foto. No terceiro dia, apareceu: "🔥 3 dias na trilha. Você é mais consistente do que imagina."

Na segunda semana, apareceu o primeiro desafio: "Complete 4 treinos até domingo e ganhe o badge Guerreiro da Semana + 30⚡." Ana completou na sexta. Usou os 30⚡ para desbloquear uma receita de frango grelhado com batata doce que cabia no orçamento.

No fim do primeiro mês, Ana fez o check-in corporal. O app colocou as fotos lado a lado. A diferença era sutil, mas o coach disse: "Você perdeu 1,2kg e sua postura mudou. Olha a diferença na região abdominal. Isso é progresso real." Ana subiu para nível Dedicado. Uma animação mostrou um novo acampamento na montanha, com vista mais ampla.

No segundo mês, Ana viajou para o litoral. Avisou o app. O coach ajustou: "Férias? Sem academia? Sem problema. Treino de corpo livre na praia + alimentação flexível. Aproveita e mantém o que conquistou." O streak não quebrou.

No terceiro mês, Ana ativou o leaderboard. Viu que estava entre os 30% mais consistentes da semana. Não era a primeira, mas era consistente. O coach notou: "Ana, você está no nível Atleta. 90 dias atrás você tinha zero treinos registrados. Hoje tem 72. Isso é transformação."

Ana indicou a amiga Camila. Ganhou 50⚡ e o badge "Conectada". Camila começou a trilha. Ana continuou subindo.

A montanha não tem topo. Mas a vista, a cada acampamento, é melhor.

---

> **Próxima etapa:** Etapa 6 — UX, Telas Conceito e Experiência Visual
