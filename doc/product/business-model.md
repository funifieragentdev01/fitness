# Modelo de Negócio & Projeção Financeira — Fitness Coach Digital com IA

> **Data:** 21/02/2026 | **Mercado:** Brasil | **Moeda:** BRL (R$)

---

## 1. Modelo de Monetização

### 1.1 Planos

| Aspecto | 🆓 Free (Limitado) | 🔥 Premium Mensal | 💎 Premium Anual |
|---|---|---|---|
| **Preço** | R$ 0 | R$ 29,90/mês | R$ 249,90/ano (~R$ 20,83/mês) |
| **Trial Premium** | 7 dias incluídos | — | — |
| Onboarding completo | ✅ | ✅ | ✅ |
| Plano alimentar IA | 1 geração (sem ajustes) | ✅ Ilimitado + ajustes | ✅ Ilimitado + ajustes |
| Plano de treino IA | 1 geração (sem ajustes) | ✅ Ilimitado + ajustes | ✅ Ilimitado + ajustes |
| Foto do prato (análise IA) | 3 análises/semana | ✅ Ilimitado | ✅ Ilimitado |
| Adaptação financeira | ✅ | ✅ | ✅ |
| Dashboard de evolução | Últimos 7 dias | ✅ Histórico completo | ✅ Histórico completo |
| Gamificação (XP, níveis) | ✅ Básica | ✅ Completa (badges, streaks, desafios) | ✅ Completa |
| Hidratação | ✅ | ✅ | ✅ |
| Notificações inteligentes | Básicas | ✅ Personalizadas | ✅ Personalizadas |
| Regeneração de planos | ❌ | ✅ Semanal | ✅ Semanal |
| Foto corporal timeline | Última foto apenas | ✅ Timeline completa | ✅ Timeline completa |

### 1.2 Trial: 7 dias (justificativa)

- **Por que 7 e não 14:** O app gera planos na primeira sessão — o valor é percebido em minutos, não semanas. 7 dias dão tempo suficiente para experimentar treino + nutrição + foto de prato, sem dar acesso prolongado grátis que reduz urgência de conversão.
- **Referência:** BetterMe usa 7 dias; apps com 14 dias (Freeletics, Noom) têm onboarding mais lento.
- **Estratégia:** Dia 1 = wow (plano gerado). Dia 3 = push "sua análise de progresso está pronta". Dia 5 = push "seu trial acaba em 2 dias". Dia 7 = conversão.

### 1.3 Comparação com Concorrentes

| App | Mensal (R$*) | Anual (R$*) | Nosso posicionamento |
|---|---|---|---|
| Freeletics | ~R$ 85 (3 meses) | ~R$ 340/ano | **3x mais barato**, com nutrição + treino integrados |
| Noom | ~R$ 340/mês | ~R$ 1.150/ano | **11x mais barato** |
| BetterMe | ~R$ 75/mês | ~R$ 290/ano | **2.5x mais barato**, com IA superior |
| Fitbod | ~R$ 75/mês | ~R$ 460/ano | **2.5x mais barato**, com nutrição inclusa |
| MyFitnessPal | ~R$ 115/mês | ~R$ 460/ano | **4x mais barato**, com planos gerados por IA |
| **Nosso App** | **R$ 29,90** | **R$ 249,90** | Sweet spot BR: acessível + alto valor |

*Conversão estimada: US$1 = R$5,75

### 1.4 Upsells e Cross-sells (Roadmap V1.2+)

| Oferta | Preço estimado | Fase |
|---|---|---|
| Coaching humano (nutricionista via chat) | R$ 99,90/mês (adicional) | V2.0 |
| Plano família (até 4 pessoas) | R$ 49,90/mês | V1.2 |
| Desafios premium (competições com prêmios) | R$ 9,90/desafio | V1.1 |
| Análise de exames laboratoriais | R$ 19,90/análise | V3.0 |

---

## 2. Estrutura de Custos

### 2.1 Custo Funifier por Usuário Ativo

Tabela de faixas acumulativas (custo por jogador ativo/mês):

| Faixa | Custo/jogador | Exemplo: 500 usuários ativos |
|---|---|---|
| 1–100 | R$ 25,00 | 100 × R$ 25 = R$ 2.500 |
| 101–200 | R$ 18,00 | 100 × R$ 18 = R$ 1.800 |
| 201–600 | R$ 16,00 | 300 × R$ 16 = R$ 4.800 |
| 601–800 | R$ 14,00 | — |
| 801–3.000 | R$ 7,00 | — |
| 3.001–5.000 | R$ 5,00 | — |
| 5.001–10.000 | R$ 2,00 | — |

**Custo Funifier para 500 ativos:** R$ 9.100 → **R$ 18,20/usuário médio**

| Qtd Ativos | Custo Total Funifier | Custo Médio/Usuário |
|---|---|---|
| 50 | R$ 1.250 | R$ 25,00 |
| 100 | R$ 2.500 | R$ 25,00 |
| 200 | R$ 4.300 | R$ 21,50 |
| 500 | R$ 9.100 | R$ 18,20 |
| 1.000 | R$ 12.500 | R$ 12,50 |
| 2.000 | R$ 19.500 | R$ 9,75 |
| 3.000 | R$ 26.500 | R$ 8,83 |
| 5.000 | R$ 36.500 | R$ 7,30 |

> **Nota:** Funifier é produto próprio, então esse custo representa custo interno/de oportunidade. Para fins de projeção, tratamos como custo real.

### 2.2 Custo de APIs de IA por Usuário Ativo/Mês

Estimativa baseada em uso moderado (usuário Premium):

| Operação | Modelo | Custo/chamada | Frequência/mês | Custo/mês |
|---|---|---|---|---|
| Geração plano alimentar | GPT-4o-mini | R$ 0,15 | 2x | R$ 0,30 |
| Geração plano treino | GPT-4o-mini | R$ 0,15 | 2x | R$ 0,30 |
| Foto do prato (análise) | GPT-4 Vision | R$ 0,35 | 20x | R$ 7,00 |
| Foto corporal (análise) | GPT-4 Vision | R$ 0,35 | 2x | R$ 0,70 |
| Notificações/ajustes IA | GPT-4o-mini | R$ 0,05 | 10x | R$ 0,50 |
| **Total IA/usuário/mês** | | | | **R$ 8,80** |

Usuário Free (limitado): ~R$ 3,00/mês (menos fotos, sem regeneração)

### 2.3 Custos Fixos de Infraestrutura

| Item | Custo/mês |
|---|---|
| Netlify (hosting PWA) — free tier | R$ 0 |
| Domínio (.com.br) | R$ 3,33 (R$ 40/ano) |
| SSL | Incluído Netlify |
| E-mail transacional (SendGrid free) | R$ 0 |
| **Total infraestrutura** | **~R$ 50/mês** (reserva para eventuais upgrades) |

### 2.4 Custo Total por Usuário Ativo

| Cenário (qtd ativos) | Funifier | IA (média) | Infra (rateado) | **Total/usuário** |
|---|---|---|---|---|
| 100 ativos | R$ 25,00 | R$ 6,00 | R$ 0,50 | **R$ 31,50** |
| 200 ativos | R$ 21,50 | R$ 6,00 | R$ 0,25 | **R$ 27,75** |
| 500 ativos | R$ 18,20 | R$ 6,00 | R$ 0,10 | **R$ 24,30** |
| 1.000 ativos | R$ 12,50 | R$ 6,00 | R$ 0,05 | **R$ 18,55** |
| 3.000 ativos | R$ 8,83 | R$ 6,00 | R$ 0,02 | **R$ 14,85** |

> **Conclusão:** Com 100 usuários ativos, o custo por usuário (R$ 31,50) **supera** a receita mensal (R$ 29,90). O modelo só é viável a partir de ~200+ usuários ativos com boa conversão pago/free. Escala é essencial.

---

## 3. Projeção Financeira — 12 Meses

### Premissas

| Premissa | Conservador | Moderado | Otimista |
|---|---|---|---|
| Usuários novos/mês (crescimento) | +30 → +80 | +50 → +150 | +100 → +300 |
| Taxa conversão trial→pago | 8% | 12% | 18% |
| Churn mensal (pagantes) | 12% | 8% | 5% |
| % assinatura anual (dos pagantes) | 20% | 30% | 40% |
| ARPU (receita média/pagante/mês) | R$ 27,00 | R$ 27,50 | R$ 28,00 |
| Ratio free:pago (ativos) | 70:30 | 60:40 | 50:50 |

> ARPU considera mix de mensal (R$ 29,90) e anual (R$ 20,83/mês)

### 3.1 Cenário Moderado — Mês a Mês

| Mês | Novos | Total Cadastros | Ativos | Pagantes | MRR | Custo Funifier | Custo IA | Custo Total | Lucro/Prejuízo |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 50 | 50 | 40 | 5 | R$ 138 | R$ 1.000 | R$ 240 | R$ 1.290 | **-R$ 1.153** |
| 2 | 60 | 110 | 80 | 12 | R$ 330 | R$ 2.060 | R$ 480 | R$ 2.590 | **-R$ 2.260** |
| 3 | 70 | 180 | 120 | 22 | R$ 605 | R$ 2.820 | R$ 720 | R$ 3.590 | **-R$ 2.985** |
| 4 | 80 | 260 | 170 | 35 | R$ 963 | R$ 3.920 | R$ 1.020 | R$ 4.990 | **-R$ 4.028** |
| 5 | 90 | 350 | 220 | 50 | R$ 1.375 | R$ 4.620 | R$ 1.320 | R$ 5.990 | **-R$ 4.615** |
| 6 | 110 | 460 | 290 | 72 | R$ 1.980 | R$ 6.240 | R$ 1.740 | R$ 8.030 | **-R$ 6.050** |
| 7 | 120 | 580 | 370 | 95 | R$ 2.613 | R$ 7.360 | R$ 2.220 | R$ 9.630 | **-R$ 7.018** |
| 8 | 130 | 710 | 450 | 125 | R$ 3.438 | R$ 8.700 | R$ 2.700 | R$ 11.450 | **-R$ 8.013** |
| 9 | 140 | 850 | 540 | 160 | R$ 4.400 | R$ 9.700 | R$ 3.240 | R$ 12.990 | **-R$ 8.590** |
| 10 | 150 | 1.000 | 640 | 200 | R$ 5.500 | R$ 10.760 | R$ 3.840 | R$ 14.650 | **-R$ 9.150** |
| 11 | 150 | 1.150 | 730 | 245 | R$ 6.738 | R$ 11.510 | R$ 4.380 | R$ 15.940 | **-R$ 9.203** |
| 12 | 150 | 1.300 | 820 | 295 | R$ 8.113 | R$ 12.340 | R$ 4.920 | R$ 17.310 | **-R$ 9.198** |

> **Acumulado 12 meses:** Prejuízo total ~R$ 72.000 | MRR final: R$ 8.113

### 3.2 Cenário Conservador — Resumo Trimestral

| Trimestre | Ativos | Pagantes | MRR | Custo Total | Resultado |
|---|---|---|---|---|---|
| T1 (M1-3) | 80 | 12 | R$ 324 | R$ 6.600 | **-R$ 5.600** |
| T2 (M4-6) | 150 | 30 | R$ 810 | R$ 11.400 | **-R$ 9.000** |
| T3 (M7-9) | 230 | 55 | R$ 1.485 | R$ 16.500 | **-R$ 12.000** |
| T4 (M10-12) | 320 | 85 | R$ 2.295 | R$ 21.000 | **-R$ 14.000** |
| **Total Ano** | | | | | **-R$ 40.600** |

### 3.3 Cenário Otimista — Resumo Trimestral

| Trimestre | Ativos | Pagantes | MRR | Custo Total | Resultado |
|---|---|---|---|---|---|
| T1 (M1-3) | 200 | 40 | R$ 1.120 | R$ 5.800 | **-R$ 2.600** |
| T2 (M4-6) | 550 | 150 | R$ 4.200 | R$ 13.500 | **-R$ 1.500** |
| T3 (M7-9) | 1.000 | 350 | R$ 9.800 | R$ 19.000 | **+R$ 2.500** |
| T4 (M10-12) | 1.800 | 700 | R$ 19.600 | R$ 26.000 | **+R$ 18.800** |
| **Total Ano** | | | | | **+R$ 17.200** |

### 3.4 Break-even

| Cenário | Break-even (mês) | Pagantes necessários | Ativos necessários |
|---|---|---|---|
| Conservador | Mês 18-20 | ~400 | ~1.300 |
| Moderado | Mês 14-16 | ~350 | ~900 |
| Otimista | Mês 8-9 | ~250 | ~600 |

**Fórmula do break-even:** O ponto onde ARPU × pagantes > custo Funifier (todos ativos) + custo IA (todos ativos) + custos fixos.

O desafio central é que **Funifier cobra por todos os ativos** (free + pago), mas só pagantes geram receita. Portanto:
- Break-even depende fortemente do **ratio pago:free**
- Quanto mais rápido converter free→pago (ou limitar free), mais rápido o break-even

---

## 4. Unit Economics

### 4.1 Métricas-Chave

| Métrica | Valor Estimado | Justificativa |
|---|---|---|
| **CAC (Custo de Aquisição)** | R$ 15–25 | Marketing orgânico + social ads Brasil (Instagram/TikTok); baixo no início (orgânico), sobe com escala |
| **ARPU** | R$ 27,50/mês | Mix 70% mensal (R$ 29,90) + 30% anual (R$ 20,83/mês) |
| **Churn mensal** | 8-12% | Mercado fitness tem churn alto; gamificação pode reduzir para 6-8% |
| **Vida média do cliente** | 8-12 meses | 1/churn: com 8% churn → 12,5 meses |
| **LTV** | R$ 275–344 | ARPU × vida média: R$ 27,50 × 10-12,5 meses |
| **LTV/CAC** | 11:1 a 17:1 | Excelente (>3:1 é saudável). Vai reduzir conforme CAC sobe com paid ads. |
| **Payback period** | < 1 mês | CAC R$ 20 / ARPU R$ 27,50 = 0,7 meses. Payback imediato na primeira mensalidade. |

### 4.2 Margem por Usuário Pagante (em escala)

| Escala (ativos) | Receita/pagante | Custo/ativo (Funifier+IA) | Margem bruta* |
|---|---|---|---|
| 200 ativos (80 pagantes) | R$ 27,50 | R$ 27,75 | **-R$ 0,25** (breakeven) |
| 500 ativos (200 pagantes) | R$ 27,50 | R$ 24,30 | **+R$ 3,20** (12%) |
| 1.000 ativos (400 pagantes) | R$ 27,50 | R$ 18,55 | **+R$ 8,95** (33%) |
| 3.000 ativos (1.200 pagantes) | R$ 27,50 | R$ 14,85 | **+R$ 12,65** (46%) |

*Margem bruta por pagante, considerando que o custo de ativos free é subsidiado pelos pagantes.

> **Insight:** A margem só se torna saudável (>30%) a partir de ~1.000 ativos. Antes disso, o custo Funifier é o principal gargalo.

### 4.3 Sensibilidade ao Ratio Free:Pago

| Ratio Free:Pago | 500 ativos → pagantes | MRR | Custo total | Resultado |
|---|---|---|---|---|
| 80:20 | 100 | R$ 2.750 | R$ 12.150 | **-R$ 9.400** |
| 60:40 | 200 | R$ 5.500 | R$ 12.150 | **-R$ 6.650** |
| 50:50 | 250 | R$ 6.875 | R$ 12.150 | **-R$ 5.275** |
| 40:60 | 300 | R$ 8.250 | R$ 12.150 | **-R$ 3.900** |

> **Conclusão:** Com Funifier cobrando por todos os ativos, o plano Free precisa ser muito limitado para não destruir a margem. Considerar **hard cap de funcionalidade** no Free ou **remover Free tier** e trabalhar só com trial de 7 dias.

---

## 5. Estratégia de Crescimento

### 5.1 Primeiros 100 Usuários (Meses 1-2)

| Canal | Ação | Custo | Meta |
|---|---|---|---|
| **Rede pessoal** | Founders + amigos + família testam e compartilham | R$ 0 | 20 usuários |
| **Instagram Reels** | Conteúdo: "Tirei foto do meu prato e a IA analisou" (antes/depois) | R$ 0 | 30 usuários |
| **TikTok** | Vídeos curtos mostrando o wow factor (foto→análise em 3s) | R$ 0 | 20 usuários |
| **Grupos de academia (WhatsApp/Telegram)** | Postar em grupos fitness locais | R$ 0 | 15 usuários |
| **Micro-influencers fitness** | Permuta: acesso grátis por 1 post/stories | R$ 0-500 | 15 usuários |
| **Total** | | **< R$ 500** | **100 usuários** |

### 5.2 Canais de Aquisição para o Brasil

| Canal | Custo por lead (estimado) | Escalabilidade | Prioridade |
|---|---|---|---|
| **Instagram Reels/Stories** (orgânico) | R$ 0 | Alta (fitness é visual) | 🔴 Alta |
| **TikTok** (orgânico) | R$ 0 | Alta (viralização) | 🔴 Alta |
| **Instagram Ads** | R$ 3-8/lead | Alta | 🟡 Média (mês 3+) |
| **Google Ads (busca)** | R$ 5-15/lead | Média | 🟡 Média (mês 4+) |
| **Parcerias micro-influencers** | R$ 0-2.000/parceria | Média | 🔴 Alta |
| **SEO (blog com dicas fitness)** | R$ 0 (tempo) | Alta (longo prazo) | 🟡 Média |
| **WhatsApp grupos** | R$ 0 | Baixa (manual) | 🟢 Início apenas |
| **Programa de indicação** | R$ 10-15/indicação convertida | Alta | 🔴 Alta (mês 2+) |

### 5.3 Viral Loops com Gamificação

A gamificação (Funifier) é a arma secreta para growth orgânico:

| Mecânica | Como funciona | Potencial viral |
|---|---|---|
| **Badge "Embaixador"** | Ganha badge + XP bônus ao convidar 3 amigos que se cadastram | Alto — gamers querem completar badges |
| **Desafio em dupla** | "Convide um amigo para o Desafio 7 dias" — ambos ganham XP bônus | Alto — compromisso social |
| **Ranking de amigos** | Leaderboard entre amigos (opt-in) — precisa convidar para ter com quem competir | Médio — competição é motivador |
| **Compartilhar conquista** | Botão "compartilhar no Instagram" ao ganhar badge ou subir de nível (imagem auto-gerada bonita) | Alto — social proof visual |
| **Streak compartilhado** | "Eu e [amigo] estamos há 15 dias seguidos treinando" — compartilhável | Médio — accountability social |
| **Moedas por indicação** | Moedas virtuais que descontam na assinatura (R$ 5 por amigo que assina) | Alto — incentivo financeiro real |

### 5.4 Modelo de Referral Recomendado

```
Convide um amigo → Ele ganha 14 dias de trial (em vez de 7)
                  → Você ganha 500 moedas + badge "Embaixador"
                  → Se ele assinar, você ganha R$ 10 de desconto no próximo mês
```

**Meta:** Cada pagante traz em média 1,5 novos usuários ao longo da vida → **coeficiente viral k = 0,3** (com conversão de 20% dos indicados).

---

## 6. Recomendações Estratégicas

### 6.1 Decisões Críticas

1. **Eliminar o plano Free permanente.** Trabalhar com trial de 7 dias → conversão ou perda de acesso. Motivo: Funifier cobra por ativos; free users destroem margem.

2. **Negociar com Funifier desconto/isenção para produto próprio.** Se o custo Funifier fosse 50% menor, o break-even cairia de ~350 para ~180 pagantes.

3. **Limitar uso de IA no free/trial.** Foto de prato é o custo mais alto (R$ 7/mês com 20 fotos). Limitar a 3/semana no free e monitorar.

4. **Priorizar assinatura anual.** Oferecer desconto agressivo (30%) para lock-in e reduzir churn. Meta: 40%+ dos pagantes em anual.

5. **Implementar pagamento antes do trial.** Coletar cartão no cadastro, cobrar após 7 dias. Aumenta conversão em 2-3x vs trial sem cartão.

### 6.2 KPIs para Monitorar

| KPI | Meta Mês 3 | Meta Mês 6 | Meta Mês 12 |
|---|---|---|---|
| Usuários cadastrados | 180 | 460 | 1.300 |
| Taxa conversão trial→pago | 10% | 12% | 15% |
| MRR | R$ 600 | R$ 2.000 | R$ 8.000 |
| Churn mensal | < 15% | < 10% | < 8% |
| NPS | > 30 | > 40 | > 50 |
| Fotos de prato/dia (engajamento) | 5 | 30 | 150 |

---

## 7. Resumo Executivo

| Métrica | Valor |
|---|---|
| **Preço** | R$ 29,90/mês ou R$ 249,90/ano |
| **Trial** | 7 dias (com cartão) |
| **Custo/usuário ativo (500 ativos)** | ~R$ 24,30 |
| **Margem bruta (1.000 ativos, 40% pagantes)** | ~33% |
| **Break-even (cenário moderado)** | Mês 14-16, ~350 pagantes |
| **LTV** | R$ 275-344 |
| **CAC (orgânico)** | R$ 15-25 |
| **LTV/CAC** | 11:1 a 17:1 |
| **Investimento necessário (12 meses)** | R$ 60.000-80.000 |
| **Maior risco** | Custo Funifier em escala baixa (R$ 25/ativo nos primeiros 100) |
| **Maior oportunidade** | First-mover no Brasil em fitness + IA + gamificação |

> **Veredicto:** O modelo é viável mas capital-intensivo nos primeiros 12-16 meses. A alavanca principal é acelerar a conversão e minimizar usuários free ativos. A gamificação é simultaneamente o maior custo (Funifier) e o maior diferencial competitivo — o desafio é equilibrar engajamento com unit economics.

---

*Documento gerado em 21/02/2026. Revisar mensalmente com dados reais.*
