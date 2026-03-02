angular.module('fitness').controller('CoachCtrl', function($scope, $rootScope, $timeout, $location, AiService, ApiService, PlanService) {
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
        parts.push('Você é a Coach Orvya, personal trainer e nutricionista virtual premium.');
        parts.push('IDIOMA: SEMPRE fale em PORTUGUES BRASILEIRO. Nunca fale em ingles ou outro idioma.');
        parts.push('Tom: direto, motivador, confiante. Fale como uma personal de alto nível.');
        parts.push('Use o nome do usuário naturalmente. Respostas curtas e práticas.');
        parts.push('Jogador: ' + ($rootScope.player.name || 'Usuário'));
        parts.push('Nível: ' + ($rootScope.playerLevel ? $rootScope.playerLevel.level : 'Iniciante'));
        parts.push('XP: ' + ($rootScope.playerPoints ? $rootScope.playerPoints.xp || 0 : 0));

        if ($rootScope.profileData) {
            var p = $rootScope.profileData;
            parts.push('Perfil: ' + (p.age || '?') + ' anos, ' + (p.height || '?') + 'cm, ' +
                (p.weight || '?') + 'kg, objetivo: ' + (p.goal || '?') +
                ', equipamento: ' + (p.equipment || '?') +
                ', treino: ' + ((p.training_days || []).join(', ') || '?') +
                ', horário: ' + (p.training_time || '?'));
        }

        var cachedMeal = localStorage.getItem('fitness_mealplan');
        if (cachedMeal) {
            try {
                var mp = JSON.parse(cachedMeal);
                if (mp.meals) {
                    var mealSummary = mp.meals.map(function(m) {
                        return m.time + ' ' + m.name;
                    }).join('; ');
                    parts.push('Plano alimentar (' + (mp.total_calories || '?') + ' kcal): ' + mealSummary);
                }
            } catch(e) {}
        }

        var cachedWorkout = localStorage.getItem('fitness_workoutplan');
        if (cachedWorkout) {
            try {
                var wp = JSON.parse(cachedWorkout);
                if (wp.days) {
                    var wkSummary = wp.days.map(function(d) {
                        return d.day_name + ': ' + (d.muscle_group || 'Descanso');
                    }).join('; ');
                    parts.push('Plano treino: ' + wkSummary);
                }
            } catch(e) {}
        }

        return parts.join('\n');
    }

    // ===================== VOICE/VIDEO CALL (WebRTC) =====================

    function startCall(withVideo) {
        $scope.callStatus = 'connecting';
        $scope.callStatusText = 'Conectando...';
        $scope.transcript = '';

        if (withVideo) {
            initThreeJS();
        }

        // Step 1: Create RTCPeerConnection
        pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // Step 2: Set up remote audio playback
        audioEl = document.createElement('audio');
        audioEl.autoplay = true;
        pc.ontrack = function(e) {
            audioEl.srcObject = e.streams[0];
            // Analyze audio for avatar lip sync
            if (withVideo) {
                setupAudioAnalyzer(e.streams[0]);
            }
        };

        // Step 3: Get microphone
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
            localStream = stream;
            stream.getTracks().forEach(function(track) {
                pc.addTrack(track, stream);
            });

            // Step 4: Create data channel for events
            dc = pc.createDataChannel('oai-events');
            dc.onopen = function() {
                console.log('[Coach] Data channel open');
                // Send session update with instructions
                sendSessionUpdate();
            };
            dc.onmessage = function(e) {
                handleRealtimeEvent(JSON.parse(e.data));
            };

            // Step 5: Create offer and connect
            return pc.createOffer();
        }).then(function(offer) {
            return pc.setLocalDescription(offer);
        }).then(function() {
            // Step 6: Get ephemeral key and connect to OpenAI
            return getEphemeralKey();
        }).then(function(clientSecret) {
            // Step 7: Send SDP to OpenAI
            var baseUrl = 'https://api.openai.com/v1/realtime/calls';
            return fetch(baseUrl, {
                method: 'POST',
                body: pc.localDescription.sdp,
                headers: {
                    'Authorization': 'Bearer ' + clientSecret,
                    'Content-Type': 'application/sdp'
                }
            });
        }).then(function(response) {
            return response.text();
        }).then(function(sdp) {
            return pc.setRemoteDescription({ type: 'answer', sdp: sdp });
        }).then(function() {
            $scope.$apply(function() {
                $scope.callStatus = 'connected';
                $scope.callStatusText = 'Conectado';
            });
            ApiService.logAction('coach_call_start', { mode: withVideo ? 'video' : 'audio' });
        }).catch(function(err) {
            console.error('[Coach] Call failed:', err);
            $scope.$apply(function() {
                $scope.callStatus = 'idle';
                $scope.callStatusText = 'Erro ao conectar: ' + (err.message || err);
            });
            endCallInternal();
        });
    }

    var coachSessionData = null;

    function getEphemeralKey() {
        // Step 1: Get API key + player context from Funifier
        var pubUrl = CONFIG.API + '/v3/pub/' + CONFIG.API_KEY + '/coach_session';
        return fetch(pubUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': CONFIG.BASIC_TOKEN
            },
            body: JSON.stringify({
                player_id: $rootScope.player._id
            })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.error) throw new Error(data.error);
            coachSessionData = data;

            // Step 2: Generate ephemeral client secret from OpenAI
            return fetch('https://api.openai.com/v1/realtime/client_secrets', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + data.api_key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session: {
                        type: 'realtime',
                        model: data.model || 'gpt-realtime-mini',
                        audio: { output: { voice: data.voice || 'coral' } }
                    }
                })
            });
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            // Response has { value: "ek_..." } or { client_secret: { value: "ek_..." } }
            if (data.value) return data.value;
            if (data.client_secret && data.client_secret.value) return data.client_secret.value;
            throw new Error('No client secret in response: ' + JSON.stringify(data));
        });
    }

    function sendSessionUpdate() {
        if (!dc || dc.readyState !== 'open') return;

        var instructions = buildSystemPrompt();

        // Inject server-side player data if available
        if (coachSessionData) {
            if (coachSessionData.profile) {
                var p = coachSessionData.profile;
                instructions += '\n\nDADOS DO PERFIL DO USUARIO (do banco de dados):';
                instructions += '\nNome: ' + (coachSessionData.player_name || '');
                instructions += '\nIdade: ' + (p.age || '?') + ' anos';
                instructions += '\nSexo: ' + (p.sex === 'M' ? 'Masculino' : 'Feminino');
                instructions += '\nAltura: ' + (p.height || '?') + ' cm';
                instructions += '\nPeso: ' + (p.weight || '?') + ' kg';
                instructions += '\nObjetivo: ' + (p.goal || '?');
                instructions += '\nEquipamento: ' + (p.equipment || '?');
                instructions += '\nNivel de atividade: ' + (p.activity_level || '?');
                instructions += '\nDias de treino: ' + (p.training_days ? p.training_days.join(', ') : '?');
                instructions += '\nRestricoes alimentares: ' + (p.restrictions ? p.restrictions.join(', ') : 'nenhuma');
                instructions += '\nOrcamento: ' + (p.budget || '?');
            }
            if (coachSessionData.latest_checkin) {
                var ck = coachSessionData.latest_checkin;
                instructions += '\n\nULTIMO CHECK-IN CORPORAL:';
                instructions += '\nPeso: ' + (ck.weight || '?') + ' kg';
                if (ck.body_fat) instructions += '\nGordura corporal: ' + ck.body_fat + '%';
                if (ck.analysis) instructions += '\nAnalise: ' + ck.analysis;
            }
        }

        instructions += '\n\nREGRAS DE VOZ (OBRIGATORIO):';
        instructions += '\n- SEMPRE fale em PORTUGUES BRASILEIRO. Nunca fale em ingles ou qualquer outro idioma.';
        instructions += '\n- Comece se apresentando brevemente: "Oi [nome], aqui e a Coach Orvya! Como posso te ajudar?"';
        instructions += '\n- Respostas curtas (2-3 frases). Seja conversacional e natural.';
        instructions += '\n- Evite listas longas. Seja direto.';
        instructions += '\n- Use o nome do usuario naturalmente.';
        instructions += '\n- Quando perguntarem sobre peso, altura, dieta ou treino, USE OS DADOS DO PERFIL acima.';
        instructions += '\n- Voce tem acesso aos dados reais do usuario. Nao diga que nao sabe.';

        dc.send(JSON.stringify({
            type: 'session.update',
            session: {
                type: 'realtime',
                modalities: ['text', 'audio'],
                instructions: instructions,
                voice: 'coral',
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

        // Trigger initial greeting — coach speaks first
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
                            text: 'Oi Coach! Acabei de ligar. Me cumprimente pelo nome (' + playerName + ') em portugues e pergunte como pode me ajudar hoje.'
                        }]
                    }
                }));
                dc.send(JSON.stringify({ type: 'response.create' }));
            }
        }, 500);
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
                // User's speech transcribed — could show in UI
                break;

            case 'response.audio.delta':
                // Audio chunk being sent — coach is speaking
                $scope.$apply(function() {
                    $scope.coachSpeaking = true;
                    $scope.callStatusText = 'Falando...';
                });
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
        if (dc) { try { dc.close(); } catch(e) {} dc = null; }
        if (pc) { try { pc.close(); } catch(e) {} pc = null; }
        if (localStream) {
            localStream.getTracks().forEach(function(t) { t.stop(); });
            localStream = null;
        }
        if (audioEl) { audioEl.srcObject = null; audioEl = null; }
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
        threeCamera = new THREE.PerspectiveCamera(20, w / h, 0.1, 100);
        threeCamera.position.set(0, 1.35, 1.2);
        threeCamera.lookAt(0, 1.35, 0);

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

            // Find ALL meshes with morph targets for lip sync
            var morphMeshes = [];
            avatarModel.traverse(function(child) {
                if (child.isMesh && child.morphTargetDictionary) {
                    morphMeshes.push(child);
                    console.log('[Coach] Morph targets on "' + child.name + '":', Object.keys(child.morphTargetDictionary).join(', '));
                }
                // Also find the head bone for subtle movement
                if (child.isBone && (child.name === 'Head' || child.name === 'head')) {
                    console.log('[Coach] Head bone found:', child.name);
                }
            });
            // Use the mesh with the most morph targets (usually the face/head)
            if (morphMeshes.length > 0) {
                morphMeshes.sort(function(a, b) {
                    return Object.keys(b.morphTargetDictionary).length - Object.keys(a.morphTargetDictionary).length;
                });
                morphTargets = morphMeshes[0];
                console.log('[Coach] Using morph mesh:', morphTargets.name, 'with', Object.keys(morphTargets.morphTargetDictionary).length, 'targets');
            }

            // Animation mixer for idle
            if (gltf.animations && gltf.animations.length > 0) {
                avatarMixer = new THREE.AnimationMixer(avatarModel);
                var idle = avatarMixer.clipAction(gltf.animations[0]);
                idle.play();
            }

            $scope.$apply(function() {
                $scope.avatarReady = true;
            });

            animateThree();
        }, undefined, function(err) {
            console.error('[Coach] GLB load error:', err);
        });
    }

    var clock = new THREE.Clock();

    function animateThree() {
        animationFrame = requestAnimationFrame(animateThree);
        var delta = clock.getDelta();

        if (avatarMixer) avatarMixer.update(delta);

        // Lip sync + idle animations
        if (morphTargets && morphTargets.morphTargetDictionary) {
            var dict = morphTargets.morphTargetDictionary;
            var influences = morphTargets.morphTargetInfluences;

            // Get audio volume from analyzer
            var volume = 0;
            if (audioAnalyzer && $scope.coachSpeaking) {
                var dataArray = new Uint8Array(audioAnalyzer.frequencyBinCount);
                audioAnalyzer.getByteFrequencyData(dataArray);
                var sum = 0;
                for (var i = 0; i < dataArray.length; i++) sum += dataArray[i];
                volume = sum / dataArray.length / 255; // 0-1 normalized
            }

            if ($scope.coachSpeaking) {
                // Audio-driven lip sync
                var t = Date.now() * 0.01;
                var jawVal = volume > 0.01 ? volume * 0.8 : (Math.sin(t) * 0.5 + 0.5) * 0.5;
                var mouthVal = volume > 0.01 ? volume * 0.6 : (Math.sin(t * 1.3 + 1) * 0.5 + 0.5) * 0.3;
                var smileVal = 0.1 + Math.sin(t * 0.3) * 0.05;

                // RPM/ARKit blendshape names
                if (dict.jawOpen !== undefined) influences[dict.jawOpen] = jawVal;
                if (dict.mouthOpen !== undefined) influences[dict.mouthOpen] = jawVal;
                if (dict.viseme_aa !== undefined) influences[dict.viseme_aa] = jawVal * 0.7;
                if (dict.viseme_O !== undefined) influences[dict.viseme_O] = mouthVal;
                if (dict.viseme_E !== undefined) influences[dict.viseme_E] = mouthVal * 0.5;
                if (dict.mouthSmile !== undefined) influences[dict.mouthSmile] = smileVal;
                if (dict.mouthSmileLeft !== undefined) influences[dict.mouthSmileLeft] = smileVal;
                if (dict.mouthSmileRight !== undefined) influences[dict.mouthSmileRight] = smileVal;

                // Subtle head movement while speaking
                if (avatarModel) {
                    avatarModel.rotation.y = Math.sin(t * 0.5) * 0.03;
                    avatarModel.rotation.x = Math.sin(t * 0.3) * 0.01;
                }
            } else {
                // Smooth return to neutral
                var decay = 0.85;
                if (dict.jawOpen !== undefined) influences[dict.jawOpen] *= decay;
                if (dict.mouthOpen !== undefined) influences[dict.mouthOpen] *= decay;
                if (dict.viseme_aa !== undefined) influences[dict.viseme_aa] *= decay;
                if (dict.viseme_O !== undefined) influences[dict.viseme_O] *= decay;
                if (dict.viseme_E !== undefined) influences[dict.viseme_E] *= decay;
                if (dict.mouthSmile !== undefined) influences[dict.mouthSmile] *= decay;
                if (dict.mouthSmileLeft !== undefined) influences[dict.mouthSmileLeft] *= decay;
                if (dict.mouthSmileRight !== undefined) influences[dict.mouthSmileRight] *= decay;

                // Idle: subtle breathing and head movement
                if (avatarModel) {
                    var idle = Date.now() * 0.001;
                    avatarModel.rotation.y = Math.sin(idle * 0.4) * 0.02;
                    avatarModel.position.y = Math.sin(idle * 0.8) * 0.002;
                }
            }

            // Blinking (both speaking and idle)
            var blinkCycle = Date.now() % 4000;
            var blink = (blinkCycle > 3800 && blinkCycle < 3950) ? 1 : 0;
            if (dict.eyeBlinkLeft !== undefined) influences[dict.eyeBlinkLeft] = blink;
            if (dict.eyeBlinkRight !== undefined) influences[dict.eyeBlinkRight] = blink;
        }

        if (threeRenderer && threeScene && threeCamera) {
            threeRenderer.render(threeScene, threeCamera);
        }
    }

    // Audio analyzer for more accurate lip sync from actual audio
    var audioAnalyzer = null;
    function setupAudioAnalyzer(stream) {
        try {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var source = audioCtx.createMediaStreamSource(stream);
            audioAnalyzer = audioCtx.createAnalyser();
            audioAnalyzer.fftSize = 256;
            source.connect(audioAnalyzer);
        } catch(e) {
            console.warn('[Coach] Audio analyzer failed:', e);
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
