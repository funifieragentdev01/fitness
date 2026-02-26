// AiService — OpenAI API calls
angular.module('fitness').factory('AiService', function($http) {
    var OPENAI_API = CONFIG.OPENAI_API;
    var OPENAI_KEY = CONFIG.OPENAI_KEY;

    function aiHeaders() {
        return { headers: { 'Authorization': 'Bearer ' + OPENAI_KEY } };
    }

    function cleanJSON(text) {
        return text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').replace(/```json\s*/g, '').replace(/```\s*/g, '');
    }

    function formatTime(timeObj) {
        if (typeof timeObj === 'string') return timeObj;
        if (timeObj instanceof Date) {
            var h = timeObj.getHours().toString().padStart(2, '0');
            var m = timeObj.getMinutes().toString().padStart(2, '0');
            return h + ':' + m;
        }
        return '12:00';
    }

    function getMealTimesForPrompt(data) {
        var meals = (data.meal_times || data.meal_routine || []).filter(function(m) { return m.enabled !== false; });
        return meals.map(function(m) {
            var t = (typeof m.time === 'object' && m.time) ? formatTime(m.time) : (m.time || '12:00');
            return t + ' - ' + m.label;
        }).join(', ');
    }

    var weekDays = [
        { id: 'seg', short: 'Seg', name: 'Segunda' },
        { id: 'ter', short: 'Ter', name: 'Terça' },
        { id: 'qua', short: 'Qua', name: 'Quarta' },
        { id: 'qui', short: 'Qui', name: 'Quinta' },
        { id: 'sex', short: 'Sex', name: 'Sexta' },
        { id: 'sab', short: 'Sáb', name: 'Sábado' },
        { id: 'dom', short: 'Dom', name: 'Domingo' }
    ];

    var service = {
        generateMealPlan: function(profileData) {
            var p = profileData;
            var mealTimesStr = getMealTimesForPrompt(p);
            var goalMap = { perder_peso: 'perder peso/gordura', ganhar_massa: 'ganhar massa muscular', saude: 'manter saúde geral' };
            var budgetMap = { low: 'econômico (R$200-400/mês)', medium: 'moderado (R$400-700/mês)', high: 'sem limite de orçamento' };

            var prompt = 'Você é um nutricionista brasileiro profissional. Crie um plano alimentar DIÁRIO para: ' +
                'Sexo: ' + (p.sex === 'M' ? 'Masculino' : 'Feminino') + ', ' +
                p.age + ' anos, ' + p.height + 'cm, ' + p.weight + 'kg. ' +
                'Objetivo: ' + (goalMap[p.goal] || 'saúde geral') + '. ' +
                'Restrições: ' + (p.restrictions && p.restrictions.length ? p.restrictions.join(', ') : 'nenhuma') + '. ' +
                'Orçamento: ' + (budgetMap[p.budget] || 'moderado') + '. ' +
                'O paciente informou estas refeições como referência: ' + mealTimesStr + '. ' +
                'O paciente treina às ' + (p.training_time || '07:00') + ' nos dias: ' + ((p.training_days || []).join(', ') || 'não informado') + '. ' +
                'IMPORTANTE: Use esses horários como REFERÊNCIA, mas como nutricionista profissional, você tem liberdade para adicionar ou remover refeições se julgar apropriado para o objetivo do paciente. ' +
                'Se adicionar pré-treino ou pós-treino, o horário DEVE ser coerente com o horário de treino informado. ' +
                'Por exemplo, se treina às 7h, um pré-treino seria às 6h30 e pós-treino às 8h30 — NUNCA às 17h30. ' +
                'Use alimentos comuns brasileiros (arroz, feijão, frango, ovos, banana, etc). ' +
                'Responda SOMENTE em JSON válido, sem markdown, neste formato: ' +
                '{"meals":[{"time":"07:00","name":"Café da manhã","description":"descrição breve","foods":[{"food":"Ovos mexidos","quantity":"2 unidades","calories":140}],"total_calories":350}],"total_calories":1800}';

            return $http.post(OPENAI_API + '/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Você é um nutricionista brasileiro profissional. Responda SOMENTE JSON válido, sem blocos de código.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 2000
            }, aiHeaders()).then(function(res) {
                var text = cleanJSON(res.data.choices[0].message.content.trim());
                var plan = JSON.parse(text);
                plan.date = new Date().toLocaleDateString('pt-BR');
                plan.timestamp = new Date().toISOString();
                return plan;
            });
        },

        generateWorkoutPlan: function(profileData) {
            var p = profileData;
            var equipMap = { none: 'apenas peso corporal', basic: 'halteres e elásticos', gym: 'academia completa' };
            var goalMap = { perder_peso: 'perder peso/gordura', ganhar_massa: 'ganhar massa muscular', saude: 'saúde geral' };
            var dayNames = {};
            weekDays.forEach(function(d) { dayNames[d.id] = d.name; });
            var trainingDayNames = (p.training_days || []).map(function(d) { return dayNames[d] || d; });

            var prompt = 'Você é um personal trainer brasileiro. Crie um plano de treino semanal para: ' +
                'Sexo: ' + (p.sex === 'M' ? 'Masculino' : 'Feminino') + ', ' +
                p.age + ' anos, ' + p.height + 'cm, ' + p.weight + 'kg. ' +
                'Objetivo: ' + (goalMap[p.goal] || 'saúde geral') + '. ' +
                'Equipamento: ' + (equipMap[p.equipment] || 'peso corporal') + '. ' +
                'Dias de treino: ' + trainingDayNames.join(', ') + '. ' +
                'Horário: ' + (p.training_time || '07:00') + '. ' +
                'Os outros dias são descanso. ' +
                'Responda SOMENTE em JSON válido, sem markdown: ' +
                '{"days":[{"day_name":"Segunda","muscle_group":"Peito e Tríceps","exercises":[{"name":"Supino reto","sets":3,"reps":"12","weight_suggestion":"8kg"}],"duration_minutes":45,"warmup":"5 min caminhada","cooldown":"5 min alongamento"}]}' +
                ' Inclua TODOS os 7 dias (Segunda a Domingo). Dias de descanso: day_name + muscle_group null + exercises vazio.';

            return $http.post(OPENAI_API + '/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Você é um personal trainer brasileiro. Responda SOMENTE JSON válido, sem blocos de código.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 2000
            }, aiHeaders()).then(function(res) {
                var text = cleanJSON(res.data.choices[0].message.content.trim());
                var plan = JSON.parse(text);
                plan.date = new Date().toLocaleDateString('pt-BR');
                plan.timestamp = new Date().toISOString();
                var dayOrder = {'Segunda':0,'Terça':1,'Terca':1,'Quarta':2,'Quinta':3,'Sexta':4,'Sábado':5,'Sabado':5,'Domingo':6};
                if (plan.days) {
                    plan.days.sort(function(a, b) {
                        var aKey = Object.keys(dayOrder).find(function(k) { return a.day_name && a.day_name.indexOf(k) === 0; });
                        var bKey = Object.keys(dayOrder).find(function(k) { return b.day_name && b.day_name.indexOf(k) === 0; });
                        return (dayOrder[aKey] || 99) - (dayOrder[bKey] || 99);
                    });
                }
                return plan;
            });
        },

        analyzeMealPhoto: function(base64, plannedMeal) {
            var compareInstruction = '';
            if (plannedMeal && plannedMeal.total_calories > 0) {
                var plannedFoods = (plannedMeal.foods || []).map(function(f) { return f.food + ' (' + f.quantity + ')'; }).join(', ');
                compareInstruction = '\n\nIMPORTANTE: Esta refeição estava planejada com ' + plannedMeal.total_calories + ' kcal (' + plannedFoods + '). ' +
                    'Compare o que você vê na foto com o planejado. Se a quantidade de calorias estimada da foto for significativamente MAIOR que o planejado, ' +
                    'avise o usuário de forma educada e sugira ajustes na porção. Ex: "Seu prato tem aproximadamente X kcal, mas o planejado era Y kcal. ' +
                    'Tente reduzir a porção de [alimento] para ficar mais próximo da meta." ' +
                    'Se estiver dentro da faixa planejada (+/- 20%), parabenize o usuário.';
            }

            return $http.post(OPENAI_API + '/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Você é um nutricionista brasileiro profissional analisando a foto de um prato. Responda de forma breve e amigável: 1) Identifique os alimentos e quantidades. 2) Estime calorias totais. 3) Compare com o planejado se disponível. 4) Dê feedback profissional sobre porção. Use linguagem simples e emojis. Máximo 150 palavras.' },
                    { role: 'user', content: [
                        { type: 'text', text: 'Analise este prato:' + compareInstruction },
                        { type: 'image_url', image_url: { url: base64 } }
                    ]}
                ],
                max_tokens: 400
            }, aiHeaders()).then(function(res) {
                return res.data.choices[0].message.content;
            });
        },

        sendChat: function(messages) {
            return $http.post(OPENAI_API + '/chat/completions', {
                model: 'gpt-4o-mini',
                messages: messages,
                max_tokens: 400
            }, aiHeaders()).then(function(res) {
                return res.data.choices[0].message.content;
            });
        },

        generateAIGoal: function(onboarding) {
            var ob = onboarding;
            var prompt = 'Você é um nutricionista e personal trainer brasileiro certificado. Com base nos dados do paciente, defina uma meta específica, factível e motivadora.\n\n' +
                'Dados: Sexo ' + (ob.sex === 'M' ? 'Masculino' : 'Feminino') + ', ' + ob.age + ' anos, ' + ob.height + 'cm, ' + ob.weight + 'kg.\n' +
                'Objetivo geral: ' + ob.goal + '\n' +
                'Equipamento: ' + (ob.equipment || 'não informado') + '\n' +
                'Treina ' + (ob.training_days || []).length + ' dias/semana.\n\n' +
                'Responda em JSON com os campos:\n' +
                '- summary: texto de 3-4 frases explicando a meta de forma motivadora e educativa (em português, use markdown bold para destaques). Inclua uma frase educativa tipo "Durante o emagrecimento é normal perder um pouco de massa magra, isso faz parte do processo".\n' +
                '- target_weight: peso meta em kg (número ou null)\n' +
                '- target_bf: percentual de gordura meta (número ou null)\n' +
                '- timeline: prazo estimado em texto (ex: "3 a 4 meses")\n' +
                '- tip: uma dica profissional curta\n' +
                '- daily_calories: calorias diárias recomendadas (número)\n\n' +
                'Retorne APENAS o JSON, sem markdown code block.';

            return $http.post(OPENAI_API + '/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Você é um nutricionista e personal trainer. Responda apenas em JSON válido.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 500
            }, aiHeaders()).then(function(res) {
                var text = cleanJSON(res.data.choices[0].message.content.trim());
                try { return JSON.parse(text); } catch(e) { return { summary: text, tip: '' }; }
            });
        },

        adjustGoal: function(currentGoal, feedback, onboarding) {
            var ob = onboarding;
            var prompt = 'Você é um nutricionista e personal trainer brasileiro certificado. O paciente recebeu esta meta:\n\n' +
                JSON.stringify(currentGoal) + '\n\n' +
                'Dados: ' + (ob.sex === 'M' ? 'Masculino' : 'Feminino') + ', ' + ob.age + ' anos, ' + ob.height + 'cm, ' + ob.weight + 'kg, objetivo: ' + ob.goal + '.\n\n' +
                'O paciente fez esta consideração:\n"' + feedback + '"\n\n' +
                'Como profissional, avalie a solicitação, faça os ajustes que considerar pertinentes e dê um feedback profissional. Se a solicitação não for recomendada, explique educadamente o porquê e sugira alternativas.\n\n' +
                'Responda em JSON com os mesmos campos: summary (inclua o feedback sobre a solicitação do paciente), target_weight, target_bf, timeline, tip, daily_calories.\n' +
                'Retorne APENAS o JSON, sem markdown code block.';

            return $http.post(OPENAI_API + '/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Você é um nutricionista e personal trainer. Responda apenas em JSON válido.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 600
            }, aiHeaders()).then(function(res) {
                var text = cleanJSON(res.data.choices[0].message.content.trim());
                try { return JSON.parse(text); } catch(e) { return { summary: text, tip: '' }; }
            });
        },

        adjustMealPlan: function(mealPlan, adjustText, profileData) {
            var p = profileData || {};
            var goalMap = { perder_peso: 'perder peso', ganhar_massa: 'ganhar massa', saude: 'saúde geral' };
            var prompt = 'Você é um nutricionista brasileiro profissional. O paciente tem o seguinte plano alimentar:\n' +
                JSON.stringify(mealPlan) + '\n\n' +
                'Perfil: ' + (p.sex === 'M' ? 'Masculino' : 'Feminino') + ', ' + p.age + ' anos, ' + p.height + 'cm, ' + p.weight + 'kg. ' +
                'Objetivo: ' + (goalMap[p.goal] || 'saúde geral') + '. ' +
                'Restrições: ' + ((p.restrictions && p.restrictions.length) ? p.restrictions.join(', ') : 'nenhuma') + '.\n\n' +
                'O paciente pediu este ajuste: "' + adjustText + '"\n\n' +
                'Faça o ajuste se for profissionalmente apropriado. Mantenha dentro das metas calóricas. ' +
                'Responda em JSON com este formato: {"feedback":"explicação do que você mudou e por quê (em português)","meals":[...],"total_calories":XXXX}\n' +
                'O campo feedback deve explicar as mudanças de forma amigável. Responda SOMENTE JSON válido, sem markdown.';

            return $http.post(OPENAI_API + '/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Você é um nutricionista brasileiro. Responda SOMENTE JSON válido.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 2500
            }, aiHeaders()).then(function(res) {
                var text = cleanJSON(res.data.choices[0].message.content.trim());
                return JSON.parse(text);
            });
        },

        adjustWorkoutPlan: function(workoutPlan, adjustText, profileData, photo) {
            var p = profileData || {};
            var equipMap = { none: 'peso corporal', basic: 'halteres e elásticos', gym: 'academia completa' };
            var goalMap = { perder_peso: 'perder peso', ganhar_massa: 'ganhar massa', saude: 'saúde geral' };

            var userContent = [];
            userContent.push({ type: 'text', text: 'Você é um personal trainer. O aluno tem este plano de treino:\n' +
                JSON.stringify(workoutPlan) + '\n\n' +
                'Perfil: ' + (p.sex === 'M' ? 'Masculino' : 'Feminino') + ', ' + p.age + ' anos, ' + p.height + 'cm, ' + p.weight + 'kg. ' +
                'Objetivo: ' + (goalMap[p.goal] || 'saúde geral') + '. Equipamento atual: ' + (equipMap[p.equipment] || 'peso corporal') + '.\n\n' +
                'O aluno pediu: "' + adjustText + '"\n\n' +
                'Adapte o treino considerando o grupo muscular que ele precisa treinar e o equipamento disponível. ' +
                'Responda em JSON: {"feedback":"explicação amigável do que mudou","days":[...]}\n' +
                'Responda SOMENTE JSON válido, sem markdown.' });

            if (photo) {
                userContent.push({ type: 'image_url', image_url: { url: photo } });
            }

            var messages = [
                { role: 'system', content: 'Você é um personal trainer brasileiro profissional. Responda SOMENTE JSON válido.' },
                { role: 'user', content: userContent.length === 1 ? userContent[0].text : userContent }
            ];

            return $http.post(OPENAI_API + '/chat/completions', {
                model: 'gpt-4o-mini',
                messages: messages,
                max_tokens: 2500
            }, aiHeaders()).then(function(res) {
                var text = cleanJSON(res.data.choices[0].message.content.trim());
                return JSON.parse(text);
            });
        },

        analyzeBodyPhotos: function(frontPhoto, sidePhoto, profileData) {
            var p = profileData || {};
            var measureFields = 'gordura_pct, peso_gordo, peso_magro, massa_muscular, cintura, quadril, abdomen, coxas, panturrilhas, braco_relaxado, braco_contraido, deltoides, torax';
            var userContent = [];
            userContent.push({ type: 'text', text: 'Você é um educador físico certificado fazendo uma avaliação de progresso fitness. O usuário está usando um app de acompanhamento e pediu para você estimar visualmente a composição corporal dele para fins de acompanhamento de progresso (não diagnóstico médico). Ele consentiu com esta análise.\n\n' +
                'Dados do paciente: ' + (p.sex === 'M' ? 'Masculino' : 'Feminino') + ', ' + (p.age || '?') + ' anos, ' +
                (p.height || '?') + 'cm, ' + (p.weight || '?') + 'kg.\n\n' +
                'Responda em JSON com dois campos:\n' +
                '1. "feedback": texto em português, amigável e profissional com emojis. Inclua: estimativa de % gordura, massa muscular, avaliação de postura/físico, medidas aproximadas e recomendações. Lembre que são estimativas visuais.\n' +
                '2. "measures": objeto com as medidas estimadas (apenas as que conseguir estimar). Campos possíveis: ' + measureFields + '. Valores numéricos.\n\n' +
                'Exemplo: {"feedback":"Texto...", "measures":{"gordura_pct":18,"cintura":82,"braco_relaxado":33}}\n' +
                'Retorne APENAS o JSON, sem markdown code block.' });

            if (frontPhoto) userContent.push({ type: 'image_url', image_url: { url: frontPhoto } });
            if (sidePhoto) userContent.push({ type: 'image_url', image_url: { url: sidePhoto } });

            return $http.post(OPENAI_API + '/chat/completions', {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a certified fitness professional (personal trainer) working in a fitness tracking app. Your role is to provide visual body composition estimates for fitness progress tracking purposes (NOT medical diagnosis). The user has consented to this assessment. Provide approximate visual estimates as a personal trainer would in a gym setting. Always note these are visual estimates. Respond ONLY in valid JSON with Portuguese text in the feedback field.' },
                    { role: 'user', content: userContent }
                ],
                max_tokens: 1000
            }, aiHeaders()).then(function(res) {
                var text = cleanJSON(res.data.choices[0].message.content.trim());
                try { return JSON.parse(text); } catch(e) { return { feedback: text, measures: {} }; }
            });
        },

        analyzeBioReport: function(photo) {
            var measureFields = 'peso, altura, gordura_pct, peso_gordo, peso_magro, massa_muscular, cintura, quadril, abdomen, coxas, panturrilhas, braco_relaxado, braco_contraido, deltoides, torax, dobra_subescapular, dobra_tricipital, dobra_toracica, dobra_axilar, dobra_suprailiaca, dobra_abdominal, dobra_coxas, dobra_panturrilhas';

            return $http.post(OPENAI_API + '/chat/completions', {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'Você é um nutricionista brasileiro. Extraia dados de laudos de bioimpedância. Responda APENAS em JSON válido.' },
                    { role: 'user', content: [
                        { type: 'text', text: 'Extraia os dados deste laudo de bioimpedância.\n\nResponda em JSON com:\n1. "feedback": texto interpretando os dados, explicando cada métrica de forma simples, com recomendações profissionais. Em português, amigável, com emojis.\n2. "measures": objeto com os valores extraídos. Campos possíveis: ' + measureFields + '. Use apenas valores numéricos. Preencha apenas os que encontrar no laudo.\n\nRetorne APENAS o JSON, sem markdown code block.' },
                        { type: 'image_url', image_url: { url: photo } }
                    ]}
                ],
                max_tokens: 1000
            }, aiHeaders()).then(function(res) {
                var text = cleanJSON(res.data.choices[0].message.content.trim());
                try { return JSON.parse(text); } catch(e) { return { feedback: text, measures: {} }; }
            });
        }
    };
    return service;
});
