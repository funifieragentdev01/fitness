angular.module('fitness').controller('CoachCtrl', function($scope, $rootScope, $timeout, $http, $location, AiService, ApiService, PlanService, AuthService) {
    $scope.isPremium = PlanService.isPremium();
    $scope.coachLocked = false; // Chat always accessible; voice/video gated in enterMode
    $scope.mode = 'select';
    $scope.callStatus = 'idle'; // idle, connecting, connected
    $scope.callStatusText = '';
    $scope.coachSpeaking = false;
    $scope.isMuted = false;
    $scope.transcript = '';
    $scope.avatarReady = false;
    $scope.chat = { input: '' };
    $scope.chatMessages = [
        { role: 'assistant', content: 'E aí! Sou o Coach Orvya, seu personal de nutrição e treino. Como posso te ajudar hoje?' }
    ];
    $scope.chatLoading = false;
    $scope.debugPrompt = null;
    var isTestMode = $rootScope.player && $rootScope.player.extra && $rootScope.player.extra.teste === true;

    $scope.callHistory = [];

    // Load call history
    (function loadCallHistory() {
        var userId = AuthService.getUser();
        if (!userId) return;
        $http({
            method: 'GET',
            url: CONFIG.API + '/v3/database/checkin__c?strict=true&_filter=' + encodeURIComponent(JSON.stringify({ userId: userId, mode: { $exists: true } })) + '&_sort=-created&_limit=20',
            headers: { 'Authorization': 'Bearer ' + AuthService.getToken() }
        }).then(function(res) {
            if (Array.isArray(res.data)) {
                $scope.callHistory = res.data.map(function(c) {
                    var dur = c.duration_seconds || 0;
                    var mins = Math.floor(dur / 60);
                    var secs = dur % 60;
                    var started = c.started && c.started.$date ? new Date(c.started.$date) : new Date(c._created || 0);
                    return {
                        mode: c.mode,
                        date: started.toLocaleDateString('pt-BR') + ' ' + started.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        duration: mins + 'min ' + secs + 's',
                        transcript: c.transcript || []
                    };
                });
            }
        }).catch(function() {});
    })();

    // WebRTC state
    var pc = null;
    var dc = null; // data channel
    var audioEl = null;
    var localStream = null;

    // Three.js state
    var threeScene = null, threeCamera = null, threeRenderer = null;
    var avatarMixer = null, avatarModel = null, morphTargets = null;
    var animationFrame = null;

    $scope.goBack = function() {
        if ($scope.mode === 'chat') {
            $scope.mode = 'select';
        } else {
            $location.path('/dashboard');
        }
    };

    // ===================== MODE SELECTION =====================

    $scope.enterMode = function(mode) {
        if (mode === 'audio' || mode === 'video') {
            if (!$scope.isPremium) {
                $rootScope.openUpgrade('Ligação por voz e vídeo são exclusivos do plano Premium!');
                return;
            }
        }
        if (mode === 'chat' && ($scope.mode === 'audio' || $scope.mode === 'video')) {
            endCallInternal();
        }
        $scope.mode = mode;
        if (mode === 'audio') {
            $timeout(function() { startCall(false); }, 300);
        } else if (mode === 'video') {
            $timeout(function() { startCall(true); }, 300);
        }
    };

    // ===================== CHAT MODE =====================

    $scope.sendChat = function() {
        if ($scope.coachLocked) {
            $rootScope.openUpgrade('O Coach é exclusivo do plano Premium. Faça upgrade!');
            return;
        }
        if (!$scope.chat.input || $scope.chatLoading) return;
        var msg = $scope.chat.input;
        $scope.chatMessages.push({ role: 'user', content: msg });
        $scope.chat.input = '';
        $scope.chatLoading = true;

        var systemPrompt = buildSystemPrompt();
        if (isTestMode) $scope.debugPrompt = systemPrompt;
        var messages = [{ role: 'system', content: systemPrompt }];
        $scope.chatMessages.forEach(function(m) {
            messages.push({ role: m.role, content: m.content });
        });

        AiService.sendChat(messages).then(function(reply) {
            $scope.chatMessages.push({ role: 'assistant', content: reply });
            $scope.chatLoading = false;
            ApiService.logAction('interact_coach', { message: msg.substring(0, 100) });
            scrollChat();
        }).catch(function() {
            $scope.chatMessages.push({ role: 'assistant', content: 'Desculpa, tô com dificuldade agora. Tenta de novo!' });
            $scope.chatLoading = false;
        });
    };

    function scrollChat() {
        $timeout(function() {
            var el = document.getElementById('chatMessages');
            if (el) el.scrollTop = el.scrollHeight;
        }, 100);
    }

    // ===================== SYSTEM PROMPT BUILDER =====================

    function buildSystemPrompt() {
        var parts = [];
        parts.push('Voce eh a Coach Orvya, personal trainer e nutricionista virtual do app Orvya.');
        parts.push('IDIOMA: SEMPRE fale em PORTUGUES BRASILEIRO.');
        parts.push('Tom: direto, motivador. Respostas curtas e praticas.');
        parts.push('Voce eh o Coach PESSOAL deste usuario. Voce ja conhece ele. NUNCA pergunte quem ele eh.');
        parts.push('');
        parts.push('=== DADOS DO USUARIO ===');
        parts.push('Nome: ' + ($rootScope.player.name || 'Usuario'));

        if ($rootScope.profileData) {
            var p = $rootScope.profileData;
            parts.push('Idade: ' + (p.age || '?') + ' anos');
            parts.push('Sexo: ' + (p.sex === 'M' ? 'Masculino' : 'Feminino'));
            parts.push('Altura: ' + (p.height || '?') + ' cm');
            parts.push('Peso atual: ' + (p.weight || '?') + ' kg');
            parts.push('Objetivo: ' + (p.goal || '?'));
            parts.push('Equipamento: ' + (p.equipment || '?'));
            parts.push('Nivel atividade: ' + (p.activity_level || '?'));
            parts.push('Dias de treino: ' + ((p.training_days || []).join(', ') || '?'));
            parts.push('Restricoes: ' + ((p.restrictions || []).join(', ') || 'nenhuma'));
        }

        var bodyAnalysis = localStorage.getItem('fitness_body_analysis');
        if (bodyAnalysis) {
            parts.push('');
            parts.push('=== ULTIMA ANALISE CORPORAL ===');
            parts.push(bodyAnalysis.substring(0, 1500));
        }

        var cachedMeal = localStorage.getItem('fitness_mealplan');
        if (cachedMeal) {
            try {
                var mp = JSON.parse(cachedMeal);
                parts.push('');
                parts.push('=== PLANO ALIMENTAR ===');
                parts.push('Calorias: ' + (mp.total_calories || '?') + ' kcal, Proteina: ' + (mp.total_protein || '?') + 'g');
                if (mp.meals) {
                    mp.meals.forEach(function(m) {
                        parts.push(m.time + ' ' + m.name + ': ' + (m.foods ? m.foods.map(function(f){ return f.food || f.name || f; }).join(', ') : ''));
                    });
                }
            } catch(e) {}
        }

        var cachedWorkout = localStorage.getItem('fitness_workoutplan');
        if (cachedWorkout) {
            try {
                var wp = JSON.parse(cachedWorkout);
                parts.push('');
                parts.push('=== PLANO DE TREINO ===');
                if (wp.days) {
                    wp.days.forEach(function(d) {
                        var exs = d.exercises ? d.exercises.map(function(ex) { return ex.name; }).join(', ') : '';
                        parts.push(d.day_name + ' (' + (d.muscle_group || 'Descanso') + '): ' + exs);
                    });
                }
            } catch(e) {}
        }

        parts.push('');
        parts.push('REGRA: Quando perguntarem peso, altura, dieta, treino, RESPONDA COM OS DADOS ACIMA. Voce TEM acesso.');

        return parts.join('\n');
    }

    // ===================== VOICE/VIDEO CALL (WebRTC) =====================

    function startCall(withVideo) {
        $scope.callStatus = 'connecting';
        $scope.callStatusText = 'Carregando dados...';
        $scope.transcript = '';

        if (withVideo) {
            initThreeJS();
        }

        // Step 1: Fetch player data + ephemeral key FIRST (before WebRTC)
        var playerId = AuthService.getUser();
        console.log('[Coach] Starting call for player:', playerId);
        var pubUrl = CONFIG.API + '/v3/pub/' + CONFIG.API_KEY + '/coach_session';
        fetch(pubUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': CONFIG.BASIC_TOKEN },
            body: JSON.stringify({ player_id: AuthService.getUser() })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.error) throw new Error(data.error);
            coachSessionData = data;
            console.log('[Coach] Session data loaded:', JSON.stringify({
                name: data.player_name,
                hasProfile: !!data.profile,
                profileWeight: data.profile ? data.profile.weight : null,
                hasCheckin: !!data.latest_checkin
            }));

            // Step 2: Build instructions and generate ephemeral key WITH instructions
            $scope.$apply(function() { $scope.callStatusText = 'Obtendo chave...'; });

            // Build full instructions now (data is loaded)
            var fullInstructions = buildVoiceInstructions();
            console.log('[Coach] Instructions built, length:', fullInstructions.length);

            // Set debug prompt for testers
            if (isTestMode) {
                try { $scope.$apply(function() { $scope.debugPrompt = fullInstructions; }); } catch(e) { $scope.debugPrompt = fullInstructions; }
            }

            return fetch('https://api.openai.com/v1/realtime/client_secrets', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + data.api_key, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session: {
                        type: 'realtime',
                        model: data.model || 'gpt-realtime-mini',
                        instructions: fullInstructions,
                        audio: { output: { voice: data.voice || 'coral' } }
                    }
                })
            });
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var clientSecret = data.value || (data.client_secret && data.client_secret.value);
            if (!clientSecret) throw new Error('No client secret');
            console.log('[Coach] Ephemeral key obtained');

            // Step 3: Now set up WebRTC with data already loaded
            $scope.$apply(function() { $scope.callStatusText = 'Conectando...'; });
            return connectWebRTC(clientSecret, withVideo);
        })
        .then(function() {
            $scope.$apply(function() {
                $scope.callStatus = 'connected';
                $scope.callStatusText = 'Conectado';
            });
            ApiService.logAction('coach_call_start', { mode: withVideo ? 'video' : 'audio' });
        })
        .catch(function(err) {
            console.error('[Coach] Call failed:', err);
            $scope.$apply(function() {
                $scope.callStatus = 'idle';
                $scope.callStatusText = 'Erro ao conectar: ' + (err.message || err);
            });
            endCallInternal();
        });
    }

    function connectWebRTC(clientSecret, withVideo) {
        return new Promise(function(resolve, reject) {
            pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            audioEl = document.createElement('audio');
            audioEl.autoplay = true;
            pc.ontrack = function(e) {
                audioEl.srcObject = e.streams[0];
                if (withVideo) setupAudioAnalyzer(e.streams[0]);
            };

            navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
                localStream = stream;
                stream.getTracks().forEach(function(track) { pc.addTrack(track, stream); });

                dc = pc.createDataChannel('oai-events');
                dc.onopen = function() {
                    console.log('[Coach] Data channel open, coachSessionData:', !!coachSessionData);
                    // Instructions already set via ephemeral key, but also send session.update as backup
                    sendSessionUpdate();
                };
                dc.onmessage = function(e) {
                    var evt = JSON.parse(e.data);
                    // Log session events for debugging
                    if (evt.type === 'session.created' || evt.type === 'session.updated') {
                        console.log('[Coach] ' + evt.type, JSON.stringify(evt).substring(0, 300));
                    }
                    if (evt.type === 'error') {
                        console.error('[Coach] API Error:', JSON.stringify(evt));
                    }
                    handleRealtimeEvent(evt);
                };

                return pc.createOffer();
            }).then(function(offer) {
                return pc.setLocalDescription(offer);
            }).then(function() {
                return fetch('https://api.openai.com/v1/realtime/calls', {
                    method: 'POST',
                    body: pc.localDescription.sdp,
                    headers: { 'Authorization': 'Bearer ' + clientSecret, 'Content-Type': 'application/sdp' }
                });
            }).then(function(response) {
                return response.text();
            }).then(function(sdp) {
                return pc.setRemoteDescription({ type: 'answer', sdp: sdp });
            }).then(resolve).catch(reject);
        });
    }

    var coachSessionData = null;

    // Build voice instructions (used for ephemeral key AND session.update)
    function buildVoiceInstructions() {
        var instructions = buildSystemPrompt();

        instructions += '\n\nREGRAS DE VOZ (OBRIGATORIO):';
        instructions += '\n- SEMPRE fale em PORTUGUES BRASILEIRO. Nunca fale em ingles ou qualquer outro idioma.';
        instructions += '\n- Respostas curtas (2-3 frases). Seja conversacional e natural.';
        instructions += '\n- Evite listas longas. Seja direto.';
        instructions += '\n- Use o nome do usuario naturalmente.';
        instructions += '\n- Voce eh o Coach pessoal DESTE usuario. Voce ja conhece ele. NAO pergunte quem ele eh.';
        instructions += '\n- Quando perguntarem sobre peso, altura, dieta, treino, medidas, use os DADOS abaixo. NAO diga que nao sabe.';

        // === ALL USER DATA (from Funifier DB via coach_session, with localStorage fallback) ===
        if (coachSessionData) {
            instructions += '\n\n=== DADOS DO USUARIO ===';
            instructions += '\nNome completo: ' + (coachSessionData.player_name || 'Usuario');

            if (coachSessionData.profile) {
                var sp = coachSessionData.profile;
                instructions += '\nIdade: ' + (sp.age || '?') + ' anos';
                instructions += '\nSexo: ' + (sp.sex === 'M' ? 'Masculino' : 'Feminino');
                instructions += '\nAltura: ' + (sp.height || '?') + ' cm';
                instructions += '\nPeso cadastrado: ' + (sp.weight || '?') + ' kg';
                instructions += '\nObjetivo: ' + (sp.goal || '?');
                instructions += '\nEquipamento: ' + (sp.equipment || '?');
                instructions += '\nNivel de atividade: ' + (sp.activity_level || '?');
                instructions += '\nDias de treino: ' + (sp.training_days ? sp.training_days.join(', ') : '?');
                instructions += '\nRestricoes alimentares: ' + (sp.restrictions ? sp.restrictions.join(', ') : 'nenhuma');
                instructions += '\nOrcamento alimentar: ' + (sp.budget || '?');

                // Synced data from profile__c (body analysis, measures, ai goal, plans)
                if (sp.body_analysis) {
                    instructions += '\n\n=== ULTIMA ANALISE CORPORAL ===';
                    var ba = typeof sp.body_analysis === 'string' ? sp.body_analysis : JSON.stringify(sp.body_analysis);
                    instructions += '\n' + ba.substring(0, 1500);
                }
                if (sp.measures) {
                    instructions += '\n\n=== MEDIDAS CORPORAIS ===';
                    var ms = sp.measures;
                    Object.keys(ms).forEach(function(k) {
                        if (ms[k]) instructions += '\n' + k + ': ' + ms[k];
                    });
                }
                if (sp.ai_goal) {
                    instructions += '\n\n=== META DO USUARIO (IA) ===';
                    var goal = sp.ai_goal;
                    if (typeof goal === 'string') instructions += '\n' + goal.substring(0, 500);
                    else if (goal.text) instructions += '\n' + goal.text.substring(0, 500);
                    else instructions += '\n' + JSON.stringify(goal).substring(0, 500);
                }
                if (sp.mealplan) {
                    instructions += '\n\n=== PLANO ALIMENTAR ===';
                    var mpv = sp.mealplan;
                    instructions += '\nCalorias diarias: ' + (mpv.total_calories || '?') + ' kcal';
                    instructions += '\nProteina: ' + (mpv.total_protein || '?') + 'g';
                    if (mpv.meals) {
                        mpv.meals.forEach(function(m) {
                            instructions += '\n' + (m.time || '') + ' ' + (m.name || '') + ': ' + (m.foods ? m.foods.map(function(f){ return f.food || f.name || f; }).join(', ') : '');
                        });
                    }
                }
                if (sp.workoutplan) {
                    instructions += '\n\n=== PLANO DE TREINO ===';
                    var wpv = sp.workoutplan;
                    if (wpv.days) {
                        wpv.days.forEach(function(d) {
                            var exercises = d.exercises ? d.exercises.map(function(ex) { return ex.name + ' ' + (ex.sets || '') + 'x' + (ex.reps || ''); }).join(', ') : '';
                            instructions += '\n' + (d.day_name || '') + ' (' + (d.muscle_group || 'Descanso') + '): ' + exercises;
                        });
                    }
                }
            }
            if (coachSessionData.latest_checkin) {
                var ck = coachSessionData.latest_checkin;
                instructions += '\n\nUltimo peso registrado: ' + (ck.weight || '?') + ' kg';
                if (ck.body_fat) instructions += '\nGordura corporal: ' + ck.body_fat + '%';
            }
        }

        // Fallback: if DB data missing, try localStorage
        if (!coachSessionData || !coachSessionData.profile || !coachSessionData.profile.mealplan) {
            var cachedMealV = localStorage.getItem('fitness_mealplan');
            if (cachedMealV) {
                try {
                    var mpLocal = JSON.parse(cachedMealV);
                    instructions += '\n\n=== PLANO ALIMENTAR (cache) ===';
                    instructions += '\nCalorias: ' + (mpLocal.total_calories || '?') + ' kcal';
                } catch(e) {}
            }
            var cachedWorkoutV = localStorage.getItem('fitness_workoutplan');
            if (cachedWorkoutV) {
                try {
                    var wpLocal = JSON.parse(cachedWorkoutV);
                    instructions += '\n\n=== PLANO DE TREINO (cache) ===';
                    if (wpLocal.days) {
                        wpLocal.days.forEach(function(d) {
                            instructions += '\n' + (d.day_name || '') + ': ' + (d.muscle_group || '');
                        });
                    }
                } catch(e) {}
            }
        }

        instructions += '\n\n=== REGRA FINAL ===';
        instructions += '\nVoce EH o Coach pessoal deste usuario. Voce CONHECE todos os dados acima.';
        instructions += '\nQuando perguntarem qualquer informacao que esta nos dados acima, RESPONDA DIRETAMENTE com o valor.';
        instructions += '\nNUNCA pergunte "em qual app?" ou "quem eh voce?". Voce ja sabe tudo.';

        return instructions;
    }

    // ===================== VOICE TOOLS DEFINITION =====================

    var voiceTools = [
        {
            type: 'function',
            name: 'update_meal_plan',
            description: 'Regenera o plano alimentar do usuario com base em um pedido ou ajuste. Use quando o usuario pedir para mudar a dieta, trocar alimentos, ajustar calorias, etc.',
            parameters: { type: 'object', properties: { feedback: { type: 'string', description: 'O que o usuario quer mudar no plano alimentar' } }, required: ['feedback'] }
        },
        {
            type: 'function',
            name: 'update_workout_plan',
            description: 'Regenera o plano de treino do usuario com base em um pedido ou ajuste. Use quando o usuario pedir para mudar exercicios, dias, intensidade, etc.',
            parameters: { type: 'object', properties: { feedback: { type: 'string', description: 'O que o usuario quer mudar no plano de treino' } }, required: ['feedback'] }
        },
        {
            type: 'function',
            name: 'update_goal',
            description: 'Atualiza a meta do usuario. Use quando o usuario disser que quer mudar seu objetivo (ex: perder peso, ganhar massa, etc).',
            parameters: { type: 'object', properties: { new_goal: { type: 'string', description: 'A nova meta do usuario em texto livre' } }, required: ['new_goal'] }
        },
        {
            type: 'function',
            name: 'add_measures',
            description: 'Registra novas medidas corporais informadas pelo usuario. Use quando o usuario disser medidas como peso, cintura, braco, gordura, etc.',
            parameters: { type: 'object', properties: {
                peso: { type: 'number', description: 'Peso em kg' },
                gordura_pct: { type: 'number', description: 'Percentual de gordura' },
                massa_muscular: { type: 'number', description: 'Massa muscular em kg' },
                cintura: { type: 'number', description: 'Cintura em cm' },
                quadril: { type: 'number', description: 'Quadril em cm' },
                braco: { type: 'number', description: 'Braco em cm' },
                coxas: { type: 'number', description: 'Coxas em cm' },
                torax: { type: 'number', description: 'Torax em cm' },
                panturrilhas: { type: 'number', description: 'Panturrilhas em cm' }
            }}
        },
        {
            type: 'function',
            name: 'log_water',
            description: 'Registra agua ingerida pelo usuario. Use quando o usuario disser que bebeu agua.',
            parameters: { type: 'object', properties: { ml: { type: 'number', description: 'Quantidade em ml (padrao 250ml se nao especificado)' } } }
        },
        {
            type: 'function',
            name: 'log_meal',
            description: 'Registra uma refeicao feita pelo usuario. Use quando o usuario disser que comeu algo.',
            parameters: { type: 'object', properties: { meal_name: { type: 'string', description: 'Nome da refeicao (ex: almoco, lanche)' }, foods: { type: 'string', description: 'O que comeu' } }, required: ['foods'] }
        }
    ];

    // ===================== CALL HISTORY STATE =====================

    var callStartTime = null;
    var callTranscriptLog = []; // {role, text, time}

    function sendSessionUpdate() {
        if (!dc || dc.readyState !== 'open') {
            console.warn('[Coach] sendSessionUpdate: dc not ready');
            return;
        }

        // Track call start
        callStartTime = new Date();
        callTranscriptLog = [];

        // Send session.update with tools + backup instructions
        var instructions = buildVoiceInstructions();

        // Add tool usage instructions
        instructions += '\n\n=== FERRAMENTAS DISPONIVEIS ===';
        instructions += '\nVoce tem ferramentas para MODIFICAR dados do usuario durante a conversa:';
        instructions += '\n- update_meal_plan: quando pedirem para mudar a dieta';
        instructions += '\n- update_workout_plan: quando pedirem para mudar o treino';
        instructions += '\n- update_goal: quando pedirem para mudar a meta';
        instructions += '\n- add_measures: quando informarem novas medidas corporais';
        instructions += '\n- log_water: quando disserem que beberam agua';
        instructions += '\n- log_meal: quando disserem que comeram algo';
        instructions += '\nUse as ferramentas PROATIVAMENTE quando o usuario mencionar algo relevante.';

        console.log('[Coach] Sending session.update with tools, instructions length:', instructions.length);

        dc.send(JSON.stringify({
            type: 'session.update',
            session: {
                modalities: ['text', 'audio'],
                instructions: instructions,
                voice: 'coral',
                tools: voiceTools,
                input_audio_transcription: {
                    model: 'gpt-4o-transcribe'
                },
                turn_detection: {
                    type: 'server_vad',
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 500
                }
            }
        }));

        // Trigger initial greeting after session.update processes
        setTimeout(function() {
            if (dc && dc.readyState === 'open') {
                var playerName = (coachSessionData && coachSessionData.player_name) ? coachSessionData.player_name.split(' ')[0] : 'amigo';
                dc.send(JSON.stringify({
                    type: 'conversation.item.create',
                    item: {
                        type: 'message',
                        role: 'user',
                        content: [{
                            type: 'input_text',
                            text: 'Oi Coach! Acabei de ligar. Me cumprimente pelo nome (' + playerName + ') em portugues brasileiro e pergunte como pode me ajudar hoje.'
                        }]
                    }
                }));
                dc.send(JSON.stringify({ type: 'response.create' }));
            }
        }, 1200);
    }

    // ===================== TOOL EXECUTION =====================

    function executeVoiceTool(callId, fnName, args) {
        console.log('[Coach] Tool call:', fnName, args);
        var userId = AuthService.getUser();
        var result = { success: false, message: '' };

        try {
            switch (fnName) {
                case 'add_measures':
                    // Save measures to profile
                    var measures = $rootScope.profileData ? angular.copy($rootScope.profileData.measures || {}) : {};
                    Object.keys(args).forEach(function(k) {
                        if (args[k] != null) measures[k] = args[k];
                    });
                    if (args.peso) {
                        // Also save as body checkin
                        ApiService.saveBodyCheckin({
                            userId: userId,
                            weight: args.peso,
                            measures: args,
                            created: ApiService.bsonDate(),
                            source: 'voice_coach'
                        });
                    }
                    if ($rootScope.profileData) {
                        $rootScope.profileData.measures = measures;
                        if (args.peso) $rootScope.profileData.weight = args.peso;
                        var pu = angular.copy($rootScope.profileData);
                        pu._id = userId;
                        ApiService.saveProfile(pu);
                    }
                    localStorage.setItem('fitness_measures', JSON.stringify(measures));
                    result = { success: true, message: 'Medidas salvas: ' + Object.keys(args).filter(function(k) { return args[k] != null; }).join(', ') };
                    break;

                case 'log_water':
                    var ml = args.ml || 250;
                    var today = new Date().toISOString().slice(0, 10);
                    var waterKey = 'water_' + today;
                    var waterData = JSON.parse(localStorage.getItem(waterKey) || '{"total":0,"logs":[]}');
                    waterData.total += ml;
                    waterData.logs.push({ ml: ml, time: new Date().toISOString() });
                    localStorage.setItem(waterKey, JSON.stringify(waterData));
                    // Also save to checkin__c
                    ApiService.saveCheckinDoc({
                        _id: userId + '_water_' + today,
                        userId: userId,
                        type: 'water',
                        total_ml: waterData.total,
                        logs: waterData.logs,
                        date: ApiService.bsonDate(),
                        created: ApiService.bsonDate()
                    });
                    result = { success: true, message: 'Registrado ' + ml + 'ml de agua. Total hoje: ' + waterData.total + 'ml' };
                    break;

                case 'log_meal':
                    var mealToday = new Date().toISOString().slice(0, 10);
                    var mealKey = 'water_meal_' + mealToday; // reuse water pattern
                    ApiService.saveCheckinDoc({
                        _id: userId + '_meal_' + mealToday + '_' + Date.now(),
                        userId: userId,
                        type: 'meal',
                        meal_name: args.meal_name || 'refeicao',
                        foods: args.foods,
                        date: ApiService.bsonDate(),
                        created: ApiService.bsonDate(),
                        source: 'voice_coach'
                    });
                    result = { success: true, message: 'Refeicao registrada: ' + args.foods };
                    break;

                case 'update_meal_plan':
                    // Use AiService to adjust meal plan
                    $scope.callStatusText = 'Ajustando dieta...';
                    AiService.adjustMealPlan($rootScope.mealPlan || {}, args.feedback, $rootScope.profileData || {}).then(function(adj) {
                        if (adj.meals) {
                            if (!$rootScope.mealPlan) $rootScope.mealPlan = {};
                            $rootScope.mealPlan.meals = adj.meals;
                            if (adj.total_calories) $rootScope.mealPlan.total_calories = adj.total_calories;
                            localStorage.setItem('fitness_mealplan', JSON.stringify($rootScope.mealPlan));
                            angular.element(document.body).injector().get('DataSyncService').syncField('fitness_mealplan');
                        }
                        sendToolResult(callId, { success: true, message: 'Plano alimentar atualizado com sucesso! ' + (adj.feedback || '') });
                    }).catch(function() {
                        sendToolResult(callId, { success: false, message: 'Nao consegui atualizar o plano alimentar agora.' });
                    });
                    return; // async - don't send result yet

                case 'update_workout_plan':
                    $scope.callStatusText = 'Ajustando treino...';
                    AiService.adjustWorkoutPlan($rootScope.workoutPlan || {}, args.feedback, $rootScope.profileData || {}).then(function(adj) {
                        if (adj.days) {
                            if (!$rootScope.workoutPlan) $rootScope.workoutPlan = {};
                            $rootScope.workoutPlan.days = adj.days;
                            localStorage.setItem('fitness_workoutplan', JSON.stringify($rootScope.workoutPlan));
                            angular.element(document.body).injector().get('DataSyncService').syncField('fitness_workoutplan');
                        }
                        sendToolResult(callId, { success: true, message: 'Plano de treino atualizado! ' + (adj.feedback || '') });
                    }).catch(function() {
                        sendToolResult(callId, { success: false, message: 'Nao consegui atualizar o plano de treino agora.' });
                    });
                    return; // async

                case 'update_goal':
                    if ($rootScope.profileData) {
                        $rootScope.profileData.ai_goal = { summary: args.new_goal, timestamp: new Date().toISOString() };
                        var goalProfile = angular.copy($rootScope.profileData);
                        goalProfile._id = userId;
                        ApiService.saveProfile(goalProfile);
                        localStorage.setItem('fitness_ai_goal', JSON.stringify($rootScope.profileData.ai_goal));
                    }
                    result = { success: true, message: 'Meta atualizada para: ' + args.new_goal };
                    break;

                default:
                    result = { success: false, message: 'Ferramenta desconhecida: ' + fnName };
            }
        } catch (e) {
            result = { success: false, message: 'Erro: ' + e.message };
        }

        sendToolResult(callId, result);
    }

    function sendToolResult(callId, result) {
        if (!dc || dc.readyState !== 'open') return;
        console.log('[Coach] Tool result:', callId, result);
        dc.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
                type: 'function_call_output',
                call_id: callId,
                output: JSON.stringify(result)
            }
        }));
        dc.send(JSON.stringify({ type: 'response.create' }));
        $scope.$apply(function() { $scope.callStatusText = 'Conectado'; });
    }

    // ===================== CALL HISTORY SAVE =====================

    function saveCallHistory(mode) {
        if (!callStartTime) return;
        var duration = Math.round((new Date() - callStartTime) / 1000);
        if (duration < 3) return; // ignore very short calls

        var userId = AuthService.getUser();
        var callId = userId + '_call_' + callStartTime.toISOString().replace(/[:.]/g, '-');

        var callData = {
            _id: callId,
            userId: userId,
            mode: mode,
            started: ApiService.bsonDate(callStartTime),
            ended: ApiService.bsonDate(),
            duration_seconds: duration,
            transcript: callTranscriptLog,
            created: ApiService.bsonDate()
        };

        ApiService.saveCheckinDoc(callData).then(function() {
            console.log('[Coach] Call history saved:', callId, duration + 's');
        }).catch(function(err) {
            console.warn('[Coach] Failed to save call history:', err);
        });

        // Log action
        ApiService.logAction('coach_call_end', { mode: mode, duration: duration });
    }

    function handleRealtimeEvent(event) {
        switch (event.type) {
            case 'response.audio_transcript.delta':
                $scope.$apply(function() {
                    $scope.transcript = ($scope.transcript || '') + (event.delta || '');
                    $scope.coachSpeaking = true;
                });
                break;

            case 'response.audio_transcript.done':
                // Log coach transcript
                if (event.transcript) {
                    callTranscriptLog.push({ role: 'coach', text: event.transcript, time: new Date().toISOString() });
                }
                $scope.$apply(function() {
                    $scope.coachSpeaking = false;
                });
                break;

            case 'response.done':
                $scope.$apply(function() {
                    $scope.coachSpeaking = false;
                    $scope.callStatusText = 'Conectado';
                });
                break;

            case 'input_audio_buffer.speech_started':
                $scope.$apply(function() {
                    $scope.callStatusText = 'Ouvindo...';
                    $scope.coachSpeaking = false;
                    $scope.transcript = '';
                });
                break;

            case 'input_audio_buffer.speech_stopped':
                $scope.$apply(function() {
                    $scope.callStatusText = 'Processando...';
                });
                break;

            case 'conversation.item.input_audio_transcription.completed':
                // User's speech transcribed — log it
                if (event.transcript) {
                    callTranscriptLog.push({ role: 'user', text: event.transcript, time: new Date().toISOString() });
                }
                break;

            case 'response.audio.delta':
                // Audio chunk being sent — coach is speaking
                $scope.$apply(function() {
                    $scope.coachSpeaking = true;
                    $scope.callStatusText = 'Falando...';
                });
                break;

            case 'response.function_call_arguments.done':
                // Tool call from the AI
                console.log('[Coach] Function call:', event.name, event.arguments);
                try {
                    var toolArgs = JSON.parse(event.arguments || '{}');
                    executeVoiceTool(event.call_id, event.name, toolArgs);
                } catch(e) {
                    console.error('[Coach] Tool parse error:', e);
                    sendToolResult(event.call_id, { success: false, message: 'Erro ao processar ferramenta' });
                }
                break;

            case 'error':
                console.error('[Coach] Realtime error:', event.error);
                break;
        }
    }

    // ===================== CALL CONTROLS =====================

    $scope.toggleMute = function() {
        $scope.isMuted = !$scope.isMuted;
        if (localStream) {
            localStream.getAudioTracks().forEach(function(track) {
                track.enabled = !$scope.isMuted;
            });
        }
    };

    $scope.endCall = function() {
        endCallInternal();
        $scope.mode = 'select';
    };

    function endCallInternal() {
        // Save call history before cleanup
        if (callStartTime && $scope.mode) {
            saveCallHistory($scope.mode);
            callStartTime = null;
        }
        if (dc) { try { dc.close(); } catch(e) {} dc = null; }
        if (pc) { try { pc.close(); } catch(e) {} pc = null; }
        if (localStream) {
            localStream.getTracks().forEach(function(t) { t.stop(); });
            localStream = null;
        }
        if (audioEl) { audioEl.srcObject = null; audioEl = null; }
        if (audioCtx) { try { audioCtx.close(); } catch(e) {} audioCtx = null; }
        audioAnalyzer = null;
        speakingSmooth = 0;
        if (animationFrame) { cancelAnimationFrame(animationFrame); animationFrame = null; }
        if (threeRenderer) {
            threeRenderer.dispose();
            var container = document.getElementById('avatarContainer');
            if (container) {
                var canvas = container.querySelector('canvas');
                if (canvas) container.removeChild(canvas);
            }
            threeRenderer = null;
        }
        $scope.callStatus = 'idle';
        $scope.coachSpeaking = false;
        $scope.transcript = '';
        $scope.avatarReady = false;
    }

    // ===================== THREE.JS AVATAR =====================

    function initThreeJS() {
        var container = document.getElementById('avatarContainer');
        if (!container) return;

        var w = container.clientWidth || 350;
        var h = container.clientHeight || 400;

        // Scene
        threeScene = new THREE.Scene();
        threeScene.background = new THREE.Color(0x0a0a0a);

        // Camera — framing head and shoulders (RPM avatars are ~1.7m tall, head at ~1.6)
        threeCamera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
        threeCamera.position.set(0, 1.52, 1.3);
        threeCamera.lookAt(0, 1.48, 0);

        // Renderer
        threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        threeRenderer.setSize(w, h);
        threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        threeRenderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(threeRenderer.domElement);

        // Lights
        var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        threeScene.add(ambientLight);

        var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(0.5, 1.5, 1);
        threeScene.add(dirLight);

        // Subtle orange rim light for brand
        var rimLight = new THREE.PointLight(0xF26B1D, 0.4, 3);
        rimLight.position.set(-0.5, 1.6, -0.3);
        threeScene.add(rimLight);

        // Load GLB
        var loader = new THREE.GLTFLoader();
        loader.load('models/coach-avatar-female.glb', function(gltf) {
            avatarModel = gltf.scene;
            threeScene.add(avatarModel);

            // Find mesh with most morph targets (Wolf3D_Avatar has 52 ARKit blendshapes)
            var bestMesh = null, bestCount = 0;
            avatarModel.traverse(function(child) {
                if (child.isMesh && child.morphTargetDictionary) {
                    var count = Object.keys(child.morphTargetDictionary).length;
                    console.log('[Coach] Morph mesh "' + child.name + '": ' + count + ' targets');
                    if (count > bestCount) {
                        bestCount = count;
                        bestMesh = child;
                    }
                }
            });
            if (bestMesh) {
                morphTargets = bestMesh;
                console.log('[Coach] Using morph mesh:', morphTargets.name, 'with', bestCount, 'targets:',
                    Object.keys(morphTargets.morphTargetDictionary).join(', '));
            } else {
                console.warn('[Coach] NO morph targets found in GLB!');
            }

            // Animation mixer for idle
            if (gltf.animations && gltf.animations.length > 0) {
                avatarMixer = new THREE.AnimationMixer(avatarModel);
                var idle = avatarMixer.clipAction(gltf.animations[0]);
                idle.play();
            }

            console.log('[Coach] Avatar loaded. morphTargets:', !!morphTargets,
                'morphCount:', morphTargets ? Object.keys(morphTargets.morphTargetDictionary).length : 0,
                'animations:', gltf.animations ? gltf.animations.length : 0);

            $scope.$apply(function() {
                $scope.avatarReady = true;
            });

            animateThree();
        }, undefined, function(err) {
            console.error('[Coach] GLB load error:', err);
        });
    }

    var clock = new THREE.Clock();
    var isSpeaking = false; // driven by audio volume, not data channel events
    var speakingSmooth = 0; // smoothed speaking volume for animation

    function animateThree() {
        animationFrame = requestAnimationFrame(animateThree);
        var delta = clock.getDelta();
        var t = Date.now() * 0.001; // seconds

        if (avatarMixer) avatarMixer.update(delta);

        // Animate the model — visible body movement
        if (avatarModel) {
            if (isSpeaking) {
                // Talking: noticeable head/body animation
                avatarModel.position.y = Math.sin(t * 1.5) * 0.015;
                avatarModel.rotation.y = Math.sin(t * 1.2) * 0.12 + Math.sin(t * 2.5) * 0.05;
                avatarModel.rotation.x = Math.sin(t * 0.8 + 1) * 0.06;
                avatarModel.rotation.z = Math.sin(t * 0.7) * 0.04;
            } else {
                // Idle: clear breathing + gentle sway
                avatarModel.position.y = Math.sin(t * 0.9) * 0.015;
                avatarModel.rotation.y = Math.sin(t * 0.5) * 0.08;
                avatarModel.rotation.x = Math.sin(t * 0.35 + 0.5) * 0.03;
                avatarModel.rotation.z = Math.sin(t * 0.3) * 0.015;
            }
        }

        // Morph target animations (lip sync + blink + expressions)
        if (morphTargets && morphTargets.morphTargetDictionary) {
            var dict = morphTargets.morphTargetDictionary;
            var inf = morphTargets.morphTargetInfluences;

            // Get audio volume from analyzer — THIS drives isSpeaking
            var volume = 0;
            if (audioAnalyzer) {
                try {
                    var dataArray = new Uint8Array(audioAnalyzer.frequencyBinCount);
                    audioAnalyzer.getByteFrequencyData(dataArray);
                    var sum = 0;
                    for (var i = 0; i < dataArray.length; i++) sum += dataArray[i];
                    volume = sum / dataArray.length / 255;
                } catch(e) {}
            }

            // Determine speaking from actual audio volume (not data channel events)
            speakingSmooth = speakingSmooth * 0.7 + volume * 0.3;
            isSpeaking = speakingSmooth > 0.015;

            if (isSpeaking) {
                // Lip sync using ARKit blendshapes (jawOpen, mouthSmileLeft/Right, etc.)
                var fast = t * 10;
                var jawVal, smileVal;

                if (volume > 0.02) {
                    jawVal = Math.min(volume * 2.5, 1.0);
                } else {
                    // Fallback: dramatic sine-wave lip sync
                    jawVal = (Math.sin(fast) * 0.5 + 0.5) * 0.7 + 0.15;
                }
                smileVal = 0.15 + Math.sin(t * 0.4) * 0.08;

                // Jaw and mouth — main lip sync
                setMorph(dict, inf, 'jawOpen', jawVal);
                setMorph(dict, inf, 'mouthClose', 0); // ensure mouth opens
                setMorph(dict, inf, 'mouthFunnel', jawVal * 0.3 * (Math.sin(fast * 1.3) * 0.5 + 0.5));
                setMorph(dict, inf, 'mouthPucker', jawVal * 0.2 * (Math.sin(fast * 0.9 + 2) * 0.5 + 0.5));
                setMorph(dict, inf, 'mouthLowerDownLeft', jawVal * 0.4);
                setMorph(dict, inf, 'mouthLowerDownRight', jawVal * 0.4);
                setMorph(dict, inf, 'mouthUpperUpLeft', jawVal * 0.15);
                setMorph(dict, inf, 'mouthUpperUpRight', jawVal * 0.15);
                setMorph(dict, inf, 'mouthStretchLeft', jawVal * 0.1);
                setMorph(dict, inf, 'mouthStretchRight', jawVal * 0.1);

                // Smile
                setMorph(dict, inf, 'mouthSmileLeft', smileVal);
                setMorph(dict, inf, 'mouthSmileRight', smileVal);

                // Cheeks puff slightly
                setMorph(dict, inf, 'cheekPuff', jawVal * 0.08);

                // Eyebrows — expressive while talking
                setMorph(dict, inf, 'browInnerUp', 0.25 + Math.sin(t * 1.8) * 0.2);
                setMorph(dict, inf, 'browOuterUpLeft', 0.15 + Math.sin(t * 1.2) * 0.1);
                setMorph(dict, inf, 'browOuterUpRight', 0.15 + Math.sin(t * 1.3 + 0.5) * 0.1);

                // Eyes look around subtly while talking
                setMorph(dict, inf, 'eyeLookUpLeft', 0.05 + Math.sin(t * 0.7) * 0.05);
                setMorph(dict, inf, 'eyeLookUpRight', 0.05 + Math.sin(t * 0.7) * 0.05);
            } else {
                // Decay all mouth/brow morphs to neutral smoothly
                var decayNames = ['jawOpen', 'mouthClose', 'mouthFunnel', 'mouthPucker',
                    'mouthLowerDownLeft', 'mouthLowerDownRight', 'mouthUpperUpLeft', 'mouthUpperUpRight',
                    'mouthStretchLeft', 'mouthStretchRight', 'cheekPuff',
                    'browInnerUp', 'browOuterUpLeft', 'browOuterUpRight',
                    'eyeLookUpLeft', 'eyeLookUpRight'];
                for (var m = 0; m < decayNames.length; m++) {
                    decayMorph(dict, inf, decayNames[m], 0.92);
                }

                // Idle: gentle smile + slight brow
                setMorph(dict, inf, 'mouthSmileLeft', 0.08 + Math.sin(t * 0.3) * 0.04);
                setMorph(dict, inf, 'mouthSmileRight', 0.08 + Math.sin(t * 0.3) * 0.04);
                setMorph(dict, inf, 'browInnerUp', 0.05 + Math.sin(t * 0.2) * 0.03);
                
                // Idle eye movement (looking around)
                setMorph(dict, inf, 'eyeLookInLeft', Math.max(0, Math.sin(t * 0.25) * 0.12));
                setMorph(dict, inf, 'eyeLookOutLeft', Math.max(0, -Math.sin(t * 0.25) * 0.12));
                setMorph(dict, inf, 'eyeLookInRight', Math.max(0, -Math.sin(t * 0.25) * 0.12));
                setMorph(dict, inf, 'eyeLookOutRight', Math.max(0, Math.sin(t * 0.25) * 0.12));
            }

            // Blinking — every 2.5-5 seconds
            var blinkPeriod = 3000 + Math.sin(t * 0.17) * 1500;
            var blinkPhase = (Date.now() % blinkPeriod) / blinkPeriod;
            var blink = (blinkPhase > 0.94 && blinkPhase < 0.98) ? 1.0 : 0;
            setMorph(dict, inf, 'eyeBlinkLeft', blink);
            setMorph(dict, inf, 'eyeBlinkRight', blink);
        }

        // Sync UI speaking state from audio detection (throttled)
        if (morphTargets && Math.floor(t * 4) !== Math.floor((t - delta) * 4)) {
            try { $scope.$apply(function() { $scope.coachSpeaking = isSpeaking; }); } catch(e) {}
        }

        if (threeRenderer && threeScene && threeCamera) {
            threeRenderer.render(threeScene, threeCamera);
        }
    }

    function setMorph(dict, inf, name, val) {
        if (dict[name] !== undefined) inf[dict[name]] = val;
    }

    function decayMorph(dict, inf, name, factor) {
        if (dict[name] !== undefined) inf[dict[name]] *= factor;
    }

    // Audio analyzer for lip sync from actual audio output
    var audioAnalyzer = null;
    var audioCtx = null;
    function setupAudioAnalyzer(stream) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioAnalyzer = audioCtx.createAnalyser();
            audioAnalyzer.fftSize = 256;
            audioAnalyzer.smoothingTimeConstant = 0.3;

            // Try MediaStreamSource first (works in most browsers for remote streams)
            var source = audioCtx.createMediaStreamSource(stream);
            source.connect(audioAnalyzer);
            // Don't connect analyzer to destination — audio already plays via <audio> element
            console.log('[Coach] Audio analyzer connected via MediaStreamSource');
        } catch(e) {
            console.warn('[Coach] MediaStreamSource failed, trying audio element:', e);
            // Fallback: connect via the <audio> element
            try {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                audioAnalyzer = audioCtx.createAnalyser();
                audioAnalyzer.fftSize = 256;
                audioAnalyzer.smoothingTimeConstant = 0.3;
                var elSource = audioCtx.createMediaElementSource(audioEl);
                elSource.connect(audioAnalyzer);
                audioAnalyzer.connect(audioCtx.destination); // must reconnect to hear audio
                console.log('[Coach] Audio analyzer connected via MediaElementSource');
            } catch(e2) {
                console.error('[Coach] Audio analyzer completely failed:', e2);
            }
        }
    }

    // ===================== CLEANUP =====================

    $scope.$on('$destroy', function() {
        endCallInternal();
    });

    $scope.$on('$locationChangeStart', function() {
        endCallInternal();
    });
});
