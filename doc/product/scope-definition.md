# Fitness Coach Digital — Definição do Escopo Funcional

> **Etapa 4 do Processo Funifier**
> Produto próprio da Funifier | 21/02/2026

---

## 1. Consolidação de Funcionalidades

Cruzamento das funcionalidades propostas (Etapa 2) com a realidade de mercado (Etapa 3).

| # | Funcionalidade | Origem Etapa 2 | Validação Mercado (Etapa 3) | Status |
|---|---|---|---|---|
| F1 | Onboarding Inteligente | Proposta — impacto crítico | Obrigatória (baseline) — todos os concorrentes fazem | ✅ Confirmada |
| F2 | Plano Alimentar Personalizado | Proposta — impacto crítico | Obrigatória (baseline) — core de qualquer app nutrição | ✅ Confirmada |
| F3 | Foto do Prato (Análise por IA) | Proposta — impacto crítico | Diferencial — HealthifyMe faz básico; ninguém com IA generativa | ✅ Confirmada |
| F4 | Plano de Treino Personalizado | Proposta — impacto crítico | Obrigatória (baseline) — core de qualquer app treino | ✅ Confirmada |
| F5 | Dashboard de Evolução | Proposta — impacto alto | Desejável — alguns apps fazem, não universal | ✅ Confirmada |
| F6 | Ajustes Dinâmicos por Mudança de Rotina | Proposta — impacto alto | Diferencial — ninguém faz bem | ✅ Confirmada |
| F7 | Adaptação à Realidade Financeira | Proposta — impacto alto | Diferencial — ninguém faz; inclusão social | ✅ Confirmada |
| F8 | Coach IA (Chat) | Proposta — impacto alto | Desejável — Freeletics tem coach abstrato | ✅ Confirmada |
| F9 | Sistema de Hidratação | Proposta — impacto médio | Desejável — funcionalidade de apoio | ✅ Confirmada |
| F10 | Gamificação Completa (XP, Níveis, Desafios, Loja) | Proposta — impacto crítico | Diferencial — motor Funifier; concorrentes não gamificam | ✅ Confirmada |
| F11 | Notificações Inteligentes | Proposta — impacto alto | Obrigatória (baseline) — todos os apps fazem push | ✅ Confirmada |
| F12 | Avatar de Coach (Parceiro de Treino Digital) | Vision doc — diferencial | Diferencial — inovador mas complexo | ❌ Excluída do MVP |
| F13 | Foto do Ambiente de Treino → Adaptação | Vision doc / F1 sub-feature | Diferencial — **ninguém faz** | ✅ Confirmada |
| F14 | Base de Alimentos Brasileiros | Implícita — contexto BR | Obrigatória — essencial para público BR | ✅ Confirmada |

---

## 2. Classificação: Essencial (MVP) / Diferencial (V1.1) / Futuro (Roadmap)

### 🔴 Essencial — MVP (Lançamento)

| Prioridade | Funcionalidade | Gamificação | IA | Ambos |
|---|---|---|---|---|
| P1 | **F1 — Onboarding Inteligente** | | | ✅ Ambos |
| P2 | **F2 — Plano Alimentar Personalizado** | | | ✅ Ambos |
| P3 | **F4 — Plano de Treino Personalizado** | | | ✅ Ambos |
| P4 | **F3 — Foto do Prato (Análise por IA)** | | | ✅ Ambos |
| P5 | **F10 — Gamificação Core (XP, Níveis, Badges, Streaks)** | ✅ Gamificação | | |
| P6 | **F5 — Dashboard de Evolução** | ✅ Gamificação | | |
| P7 | **F7 — Adaptação à Realidade Financeira** | | ✅ IA | |
| P8 | **F14 — Base de Alimentos Brasileiros** | | | |
| P9 | **F9 — Sistema de Hidratação** | ✅ Gamificação | | |
| P10 | **F11 — Notificações Inteligentes** | | ✅ IA | |

### 🟡 Diferencial — V1.1 (1-2 meses pós-lançamento)

| Funcionalidade | Justificativa |
|---|---|
| F8 — Coach IA (Chat) | Alto valor mas não bloqueia MVP; requer rate limiting e custo de IA significativo |
| F6 — Ajustes Dinâmicos por Mudança de Rotina | Excelente para retenção; depende dos planos base funcionando bem |
| F13 — Foto do Ambiente de Treino → Adaptação | Wow factor; pode ser simplificado no MVP (seleção manual de equipamentos) |
| F10b — Gamificação Avançada (Desafios semanais, Loja Virtual, Leaderboard) | Complementa o core de gamificação |

### 🟢 Futuro — Roadmap (3+ meses)

| Funcionalidade | Fase |
|---|---|
| F12 — Avatar de Coach (voz, visual, personalidade) | V2.0 |
| Integração com wearables (smartwatch, Mi Band) | V2.0 |
| Canal WhatsApp (coach via chat) | V1.2 |
| Comunidade e social (compartilhar conquistas) | V1.2 |
| Coaching humano premium (upsell) | V2.0 |
| Análise de exames laboratoriais | V3.0 |
| Correção de postura em tempo real (câmera) | V3.0 |

---

## 3. Detalhamento das Funcionalidades Essenciais (MVP)

### F1 — Onboarding Inteligente

| Aspecto | Detalhe |
|---|---|
| **Tipo** | Gamificação + IA |
| **O que faz** | Coleta dados (corpo, rotina, alimentação, orçamento, local de treino) via conversa guiada. Foto corporal inicial. |
| **Gamificação** | Barra de progresso, badge "Perfil Completo", XP inicial ao concluir |
| **IA** | Análise de foto corporal (estimativa visual via GPT-4V), geração imediata dos planos |
| **Restrições técnicas** | Análise de imagem via API OpenAI (custo por chamada ~$0.01-0.03); precisa de disclaimer legal (estimativa, não exame clínico); upload de foto requer compressão client-side |
| **Dependências** | Nenhuma — é o ponto de entrada |

### F2 — Plano Alimentar Personalizado

| Aspecto | Detalhe |
|---|---|
| **Tipo** | Gamificação + IA |
| **O que faz** | Agenda diária com horários, refeições, quantidades em gramas. 3 cenários (econômico/intermediário/avançado). Dicas educativas. |
| **Gamificação** | XP por seguir refeições, streak de dias "no plano", badges de consistência |
| **IA** | LLM gera plano baseado em perfil + orçamento + preferências; ajuste automático conforme evolução |
| **Restrições técnicas** | Prompt engineering crítico para gerar planos nutricionalmente responsáveis; disclaimer obrigatório ("não substitui nutricionista"); custo de IA por geração (~$0.02-0.05 por plano) |
| **Dependências** | F1 (dados do onboarding), F14 (base de alimentos BR) |

### F4 — Plano de Treino Personalizado

| Aspecto | Detalhe |
|---|---|
| **Tipo** | Gamificação + IA |
| **O que faz** | Agenda semanal. Cada exercício com equipamento, carga, séries, reps, link de vídeo. Adapta a casa/academia/parque. |
| **Gamificação** | XP por treino completo, streak semanal, badges de volume |
| **IA** | LLM gera treino baseado em perfil + equipamentos + objetivo; progressão automática de carga |
| **Restrições técnicas** | Precisa de banco de exercícios com vídeos/imagens (usar YouTube embeds inicialmente); prompt engineering para progressão gradual segura |
| **Dependências** | F1 (dados do onboarding) |

### F3 — Foto do Prato (Análise por IA)

| Aspecto | Detalhe |
|---|---|
| **Tipo** | Gamificação + IA |
| **O que faz** | Usuário fotografa prato → IA estima calorias, compara com plano, feedback educativo (não punitivo) |
| **Gamificação** | XP por registrar, badges de consistência ("7 pratos registrados"), desafios semanais |
| **IA** | GPT-4V para análise visual do prato; comparação com plano atual; geração de feedback contextual |
| **Restrições técnicas** | Custo mais alto de IA (visão ~$0.03-0.08 por foto); estimativa calórica é aproximada (disclaimer); latência de resposta (2-5s); precisa funcionar com fotos de qualidade variável |
| **Dependências** | F2 (plano alimentar para comparação) |

### F10 — Gamificação Core

| Aspecto | Detalhe |
|---|---|
| **Tipo** | Gamificação |
| **O que faz** | Sistema de XP + moedas virtuais, níveis de evolução (Iniciante → Disciplinado → Atleta → Mestre), badges/conquistas, streaks |
| **Gamificação** | Módulos Funifier: Points, Levels, Challenges (básicos), Badges |
| **IA** | Não no MVP |
| **Restrições técnicas** | Configuração no Funifier Studio; frontend AngularJS precisa consumir API Funifier para exibir XP, nível, badges |
| **Dependências** | Nenhuma (mas alimentado por F1-F4, F9) |

### F5 — Dashboard de Evolução

| Aspecto | Detalhe |
|---|---|
| **Tipo** | Gamificação |
| **O que faz** | Timeline de fotos corporais, gráficos de peso, histórico de treinos/alimentação, métricas de consistência |
| **Gamificação** | Nível atual + barra XP, badges conquistados, streaks visíveis |
| **IA** | Não no MVP (análise de tendência fica para V1.1) |
| **Restrições técnicas** | Armazenamento de fotos (usar storage Funifier ou S3); gráficos client-side (Chart.js ou similar no AngularJS) |
| **Dependências** | F1 (foto inicial), F10 (dados de gamificação) |

### F7 — Adaptação à Realidade Financeira

| Aspecto | Detalhe |
|---|---|
| **Tipo** | IA |
| **O que faz** | Planos alimentares em 3 faixas de orçamento, sem julgamento, otimiza nutrição dentro da restrição |
| **Gamificação** | Não diretamente |
| **IA** | Otimização nutricional com restrição de custo integrada ao prompt de geração do plano alimentar |
| **Restrições técnicas** | Integrada ao F2 (não é módulo separado); precisa de dados de preços médios de alimentos no Brasil |
| **Dependências** | F1 (dado de orçamento), F2 (geração do plano) |

### F14 — Base de Alimentos Brasileiros

| Aspecto | Detalhe |
|---|---|
| **Tipo** | Dados |
| **O que faz** | Base de referência com alimentos típicos brasileiros (arroz, feijão, farofa, açaí, etc.) com informações nutricionais |
| **Gamificação** | N/A |
| **IA** | Alimenta os prompts de geração de plano alimentar |
| **Restrições técnicas** | Pode ser embeddada nos prompts da IA (não precisa de banco separado no MVP); fonte: TACO (Tabela de Composição de Alimentos) da UNICAMP |
| **Dependências** | Nenhuma |

### F9 — Sistema de Hidratação

| Aspecto | Detalhe |
|---|---|
| **Tipo** | Gamificação |
| **O que faz** | Meta diária de água personalizada, registro de copos, lembretes |
| **Gamificação** | XP por registro, streak de hidratação, badges |
| **IA** | Cálculo simples baseado em peso (não precisa de LLM) |
| **Restrições técnicas** | Simples de implementar; ação de baixo custo; bom para manter hábito de abrir o app |
| **Dependências** | F1 (peso do usuário), F10 (sistema de pontos) |

### F11 — Notificações Inteligentes

| Aspecto | Detalhe |
|---|---|
| **Tipo** | IA |
| **O que faz** | Push para horário de refeição, lembrete de treino, hidratação, conquistas, streaks em risco |
| **Gamificação** | "Seu streak vai acabar!", "Falta X XP para o próximo nível" |
| **IA** | Timing personalizado (no MVP pode ser baseado em regras, não LLM) |
| **Restrições técnicas** | PWA push notifications (limitações no iOS); Funifier Triggers + Notifications module; pode usar regras simples no MVP em vez de IA real |
| **Dependências** | F10 (dados de gamificação), F2/F4 (horários dos planos) |

---

## 4. Escopo MVP Consolidado (Lista Priorizada)

### Sprint 0 — Infraestrutura (Dia 1)
1. Setup conta Funifier + gamificação
2. Setup projeto AngularJS mobile-first (PWA)
3. Configuração de autenticação (Funifier Auth)
4. Integração base com API OpenAI (GPT-4V)

### Sprint 1 — Core do Produto (Dias 2-3)
5. **F1 — Onboarding Inteligente** (formulário guiado + foto corporal)
6. **F14 — Base de alimentos BR** (embeddada nos prompts)
7. **F2 — Plano Alimentar Personalizado** (geração por IA + exibição)
8. **F4 — Plano de Treino Personalizado** (geração por IA + exibição)
9. **F7 — Adaptação Financeira** (integrada ao F2)

### Sprint 2 — Engajamento (Dias 4-5)
10. **F3 — Foto do Prato** (upload + análise IA + feedback)
11. **F10 — Gamificação Core** (XP, níveis, badges, streaks no Funifier)
12. **F9 — Sistema de Hidratação** (registro + gamificação)
13. **F5 — Dashboard de Evolução** (timeline fotos, gráficos, progresso gamificação)

### Sprint 3 — Retenção + Polish (Dia 6-7)
14. **F11 — Notificações** (push básico para refeições, treinos, streaks)
15. Ajustes de UX, testes, correções
16. Onboarding de teste com usuários reais
17. Deploy e preparação para apresentação

---

## 5. Roadmap Futuro

### V1.1 — Engajamento Avançado (Semanas 2-4 pós-launch)
- F8 — Coach IA (Chat) com contexto do perfil
- F6 — Ajustes Dinâmicos por Mudança de Rotina
- F13 — Foto do Ambiente de Treino → Adaptação automática
- F10b — Desafios semanais, loja virtual com moedas, leaderboard opt-in
- Melhoria da análise de tendência no dashboard (IA)
- Detecção de risco de abandono (regras básicas)

### V1.2 — Canais e Social (Meses 2-3)
- Canal WhatsApp (coach + lembretes via WhatsApp)
- Compartilhamento de conquistas (social proof)
- Programa de indicação ("convide um amigo, ganhe 1 mês")
- Notificações com IA real (timing e conteúdo adaptativos)

### V2.0 — Experiência Premium (Meses 4-6)
- F12 — Avatar de Coach (visual, voz, personalidade escolhível)
- Integração com wearables (Apple Watch, Mi Band, Garmin)
- Coaching humano premium como upsell (nutricionista real via chat)
- Comunidade dentro do app (fórum, grupos por objetivo)
- Desafios em grupo e competições

### V3.0 — Expansão (6+ meses)
- Análise de exames laboratoriais por IA
- Correção de postura em tempo real (câmera)
- Expansão para LATAM (espanhol)
- Marketplace de receitas e treinos da comunidade
- Parcerias com academias e nutricionistas

---

## 6. Restrições Técnicas Documentadas

### Stack e Infraestrutura
| Restrição | Impacto | Mitigação |
|---|---|---|
| **Frontend AngularJS** (não Angular moderno) | Limitações de performance e ecossistema; menos componentes prontos | Usar componentes leves; CSS mobile-first; manter app simples |
| **Funifier como backend único** | Toda lógica de negócio passa pela API Funifier; sem backend custom | Usar Triggers para lógica server-side; armazenar dados custom como atributos de ações |
| **PWA (não app nativo)** | Push notifications limitadas no iOS (< iOS 16.4 não suporta); sem acesso a câmera nativa avançada | Usar `<input type="file" capture>` para fotos; testar em iOS 16.4+ |

### Inteligência Artificial
| Restrição | Impacto | Mitigação |
|---|---|---|
| **Custo de API OpenAI por usuário** | Estimativa: ~$0.15-0.30/usuário/mês (uso moderado) | Cache de planos gerados; limitar regenerações; usar GPT-4o-mini para tarefas simples |
| **Latência de respostas de IA** | 2-8 segundos por chamada | Loading states com mensagens motivacionais; gerar planos em background |
| **Qualidade variável de fotos** | Análise de prato imprecisa com fotos ruins | Orientações na UI ("tire foto de cima, com boa iluminação"); feedback com disclaimer |
| **Disclaimer legal obrigatório** | IA não substitui profissional de saúde | Termos de uso claros; avisos na interface; linguagem "sugestão" não "prescrição" |

### Monetização e Prazo
| Restrição | Impacto | Mitigação |
|---|---|---|
| **Prazo: apresentação segunda-feira** | MVP precisa estar funcional em ~2 dias de dev | Escopo mínimo viável; priorizar fluxo happy path |
| **Receita na semana que vem** | Precisa de sistema de pagamento | Integrar Stripe ou similar; trial gratuito de 7-14 dias; preço R$19,90-29,90/mês |
| **Custo Funifier por jogador ativo** | R$25/jogador nos primeiros 100; cai com escala | Margem OK a partir de ~200 assinantes pagos; monitorar ratio free/pago |

### Dados e Privacidade
| Restrição | Impacto | Mitigação |
|---|---|---|
| **Fotos corporais são dados sensíveis** | LGPD exige consentimento explícito e proteção | Consentimento no onboarding; armazenamento seguro; opção de participar sem foto |
| **Dados de saúde** | Regulamentação de saúde digital | Disclaimers claros; não usar termos médicos; posicionar como "wellness" não "saúde" |

---

## Critérios de Qualidade (Checklist Etapa 4)

- [x] Escopo MVP está definido e priorizado
- [x] Cada funcionalidade tem classificação (essencial / diferencial / futuro)
- [x] Funcionalidades essenciais detalham gamificação, IA e dependências
- [x] Restrições técnicas estão documentadas
- [x] Roadmap futuro está esboçado em fases

---

> **Próxima etapa:** Etapa 5 — Design da Gamificação e IA
