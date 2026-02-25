// FitEvolve — Main App
var app = angular.module('FitEvolve', ['ngSanitize']);

app.controller('AppCtrl', function($scope, $http, $timeout, $interval, $sce) {
    var API = CONFIG.API;
    var API_KEY = CONFIG.API_KEY;
    var BASIC_TOKEN = CONFIG.BASIC_TOKEN;

    // ========== State ==========
    $scope.view = 'splash';
    $scope.loading = false;
    $scope.error = '';
    $scope.success = '';
    $scope.credentials = {};
    $scope.reg = {};
    $scope.player = {};
    $scope.playerPoints = { xp: 0, energy: 0 };
    $scope.playerLevel = {};
    $scope.nextLevel = null;
    $scope.levelProgress = 0;
    $scope.streak = { days: 0 };
    $scope.activeChallenges = [];
    $scope.todayWater = 0;
    $scope.waterCups = [1,2,3,4,5,6,7,8];
    $scope.chatMessages = [
        { role: 'assistant', content: 'E aí! Sou seu coach de nutrição e treino. Como posso te ajudar hoje? 🏔️' }
    ];
    // FIX BUG #2: Use object pattern to avoid ng-if child scope issue
    $scope.chat = { input: '' };
    $scope.chatLoading = false;
    $scope.mealType = '';
    $scope.mealPhoto = null;
    $scope.mealAnalysis = null;
    $scope.profileData = null;
    $scope.mealPlan = null;
    $scope.workoutPlan = null;
    $scope.weightHistory = [];
    $scope.allLevels = [];
    $scope.xpBars = [];
    $scope.completedChallenges = 0;
    $scope.activeChallengesCount = 0;
    $scope.checkin = {};
    $scope.workoutLog = {};
    $scope.nextMeal = null;
    $scope.registeringMeal = null;
    $scope.generatingMessage = '';
    $scope.generatingProgress = 0;
    $scope.nextActions = [];

    // Water tracking
    $scope.waterCupSize = 250;
    $scope.setWaterCupSize = function(size) { $scope.waterCupSize = size; };
    $scope.waterGoalMl = 2800;
    $scope.waterMl = 0;
    $scope.waterCupsToday = 0;
    $scope.waterCupsGoal = 11;
    $scope.waterPercent = 0;
    $scope.waterCupsArray = [];

    // Modals
    $scope.showTerms = false;
    $scope.showYoutube = false;
    $scope.youtubeExercise = '';
    $scope.youtubeUrl = '';
    $scope.showBodyAnalysis = false;
    $scope.bodyAnalysisLoading = false;
    $scope.bodyAnalysisResult = null;
    $scope.bodyAnalysisError = null;
    $scope.bioReportPhoto = null;
    $scope.manualMeasures = {};
    $scope.latestBodyAnalysis = null;

    // Adjust plans
    $scope.showMealAdjust = false;
    $scope.mealForm = { adjustText: '' };
    $scope.mealAdjustFeedback = null;
    $scope.showWorkoutAdjust = false;
    $scope.workoutForm = { adjustText: '' };
    $scope.workoutAdjustPhoto = null;
    $scope.workoutAdjustFeedback = null;

    $scope.workoutTypes = [
        { id: 'musculacao', name: 'Musculação', icon: '🏋️' },
        { id: 'cardio', name: 'Cardio', icon: '🏃' },
        { id: 'funcional', name: 'Funcional', icon: '⚡' },
        { id: 'yoga', name: 'Yoga/Alongamento', icon: '🧘' },
        { id: 'luta', name: 'Luta', icon: '🥊' },
        { id: 'esporte', name: 'Esporte', icon: '⚽' }
    ];

    // Onboarding state
    $scope.onboardingStep = 1;
    $scope.onboardingTotalSteps = 9;
    $scope.onboarding = { restrictions: [], training_days: [], meal_routine: [] };

    $scope.weekDays = [
        { id: 'seg', short: 'Seg', name: 'Segunda' },
        { id: 'ter', short: 'Ter', name: 'Terça' },
        { id: 'qua', short: 'Qua', name: 'Quarta' },
        { id: 'qui', short: 'Qui', name: 'Quinta' },
        { id: 'sex', short: 'Sex', name: 'Sexta' },
        { id: 'sab', short: 'Sáb', name: 'Sábado' },
        { id: 'dom', short: 'Dom', name: 'Domingo' }
    ];

    var token = null;
    var levels = [];

    var motivationalMessages = [
        '💪 Preparando seu plano alimentar personalizado...',
        '🥗 Selecionando os melhores alimentos pro seu objetivo...',
        '🏋️ Montando seu plano de treino ideal...',
        '📊 Calculando calorias e macros...',
        '🔥 Quase lá! Seu plano tá ficando incrível...',
        '⚡ Finalizando seus planos personalizados...',
        '🎯 Cada dia é uma chance de evoluir!',
        '🏔️ A jornada de mil milhas começa com um passo...'
    ];

    // ========== Navigation ==========
    $scope.goTo = function(view) {
        $scope.error = '';
        $scope.success = '';
        $scope.view = view;
        if (view === 'dashboard') loadDashboard();
        if (view === 'meal-plan') loadMealPlan();
        if (view === 'workout-plan') loadWorkoutPlan();
        if (view === 'progress') loadProgress();
        if (view === 'body-checkin') { $scope.checkin = {}; loadWeightHistory(); }
        if (view === 'profile') loadProfileData();
        if (view === 'workout') { $scope.workoutLog = {}; }
        if (view === 'onboarding') startOnboarding();
        if (view === 'water') loadWaterScreen();
        if (view === 'coach') {
            $timeout(function() {
                var el = document.getElementById('chatMessages');
                if (el) el.scrollTop = el.scrollHeight;
            }, 100);
        }
    };

    // ========== Terms Modal ==========
    $scope.openTerms = function($event) {
        if ($event) $event.preventDefault();
        $scope.showTerms = true;
    };

    $scope.closeTerms = function() {
        $scope.showTerms = false;
    };

    // ========== Format Analysis ==========
    $scope.formatAnalysis = function(text) {
        if (!text) return '';
        return $sce.trustAsHtml(text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/- /g, '• '));
    };

    // ========== YouTube Modal ==========
    $scope.openYoutube = function(exerciseName) {
        var query = encodeURIComponent('como fazer ' + exerciseName + ' exercício');
        window.open('https://www.youtube.com/results?search_query=' + query, '_blank');
    };

    $scope.closeYoutube = function() {
        $scope.showYoutube = false;
        $scope.youtubeUrl = '';
    };

    // ========== Auth ==========
    function authHeader() {
        return { headers: { 'Authorization': 'Bearer ' + token } };
    }

    $scope.login = function() {
        $scope.loading = true;
        $scope.error = '';
        $http.post(API + '/v3/auth/token', {
            apiKey: API_KEY,
            grant_type: 'password',
            username: $scope.credentials.username,
            password: $scope.credentials.password
        }).then(function(res) {
            token = res.data.access_token;
            localStorage.setItem('fitevolve_token', token);
            localStorage.setItem('fitevolve_user', $scope.credentials.username);
            loadPlayerAndGo();
        }).catch(function() {
            $scope.error = 'Usuário ou senha incorretos.';
            $scope.loading = false;
        });
    };

    $scope.register = function() {
        if (!$scope.reg.terms) { $scope.error = 'Aceite os termos de uso.'; return; }
        if ($scope.reg.password.length < 6) { $scope.error = 'Senha deve ter no mínimo 6 caracteres.'; return; }
        $scope.loading = true;
        $scope.error = '';
        $scope.success = '';

        $http.put(API + '/v3/database/signup__c', {
            _id: $scope.reg.username,
            name: $scope.reg.name,
            email: $scope.reg.email,
            password: $scope.reg.password
        }, { headers: { 'Authorization': BASIC_TOKEN } }).then(function(res) {
            if (res.data && res.data.status === 'OK') {
                $scope.success = 'Conta criada! Faça login para começar. 🎉';
                $scope.credentials.username = $scope.reg.username;
                $timeout(function() { $scope.goTo('login'); }, 1500);
            } else {
                $scope.error = res.data.message || 'Erro ao criar conta.';
            }
            $scope.loading = false;
        }).catch(function() {
            $scope.error = 'Erro ao criar conta. Tente novamente.';
            $scope.loading = false;
        });
    };

    $scope.confirmDeleteAccount = function() {
        if (!confirm('Tem certeza que deseja excluir sua conta? Todos os seus dados serão apagados permanentemente.')) return;
        if (!confirm('Esta ação não pode ser desfeita. Confirma a exclusão?')) return;

        var userId = localStorage.getItem('fitevolve_user');
        // Delete player — trigger after_delete handles cleanup of signup__c, profile__c, body_checkin__c
        $http.delete(API + '/v3/player/' + userId, authHeader()).then(function() {
            // Clear all local data
            var keys = Object.keys(localStorage);
            keys.forEach(function(k) { if (k.indexOf('fitevolve') === 0) localStorage.removeItem(k); });
            token = null;
            $scope.player = {};
            $scope.goTo('splash');
            alert('Conta excluída com sucesso.');
        }).catch(function() {
            alert('Erro ao excluir conta. Tente novamente.');
        });
    };

    $scope.logout = function() {
        localStorage.removeItem('fitevolve_token');
        localStorage.removeItem('fitevolve_user');
        token = null;
        $scope.player = {};
        $scope.profileData = null;
        $scope.mealPlan = null;
        $scope.workoutPlan = null;
        $scope.goTo('login');
    };

    // ========== Load Player Data ==========
    function loadPlayerAndGo() {
        var userId = localStorage.getItem('fitevolve_user');
        $http.get(API + '/v3/player/' + userId, authHeader()).then(function(res) {
            $scope.player = res.data;
            $scope.loading = false;
            checkOnboarding();
        }).catch(function() {
            $scope.error = 'Erro ao carregar dados do jogador.';
            $scope.loading = false;
        });
    }

    // ========== Onboarding ==========
    function checkOnboarding() {
        var userId = localStorage.getItem('fitevolve_user');
        $http.get(API + '/v3/database/profile__c/' + userId, authHeader()).then(function(res) {
            if (res.data && res.data._id) {
                $scope.profileData = res.data;
                var cachedMeal = localStorage.getItem('fitevolve_mealplan');
                var cachedWorkout = localStorage.getItem('fitevolve_workoutplan');
                if (cachedMeal && cachedWorkout) {
                    $scope.goTo('dashboard');
                } else {
                    $scope.onboardingStep = 1;
                    $scope.onboarding = buildOnboardingFromProfile(res.data);
                    $scope.view = 'onboarding';
                    startGeneratingPlans();
                }
            } else {
                startOnboarding();
            }
        }).catch(function() {
            startOnboarding();
        });
    }

    function buildOnboardingFromProfile(p) {
        return {
            sex: p.sex || 'M',
            age: p.age,
            height: p.height,
            weight: p.weight,
            goal: p.goal,
            restrictions: p.restrictions || [],
            budget: p.budget || 'medium',
            equipment: p.equipment || 'none',
            training_days: p.training_days || [],
            training_time: p.training_time || '',
            meal_routine: p.meal_routine || getDefaultMealRoutine(),
            activity_level: p.activity_level || 'leve'
        };
    }

    function getDefaultMealRoutine() {
        return [
            { id: 'cafe', label: 'Café da manhã', time: '07:00', enabled: true },
            { id: 'lanche_manha', label: 'Lanche da manhã', time: '10:00', enabled: true },
            { id: 'almoco', label: 'Almoço', time: '12:00', enabled: true },
            { id: 'lanche_tarde', label: 'Lanche da tarde', time: '15:00', enabled: true },
            { id: 'jantar', label: 'Jantar', time: '19:00', enabled: true },
            { id: 'ceia', label: 'Ceia', time: '21:00', enabled: false }
        ];
    }

    function startOnboarding() {
        $scope.onboardingStep = 1;
        $scope.onboarding = {
            sex: '',
            restrictions: [],
            budget: 'medium',
            equipment: 'none',
            activity_level: 'leve',
            training_days: [],
            training_time: '07:00',
            meal_routine: getDefaultMealRoutine()
        };
        $scope.view = 'onboarding';
    }

    $scope.toggleRestriction = function(r) {
        var idx = $scope.onboarding.restrictions.indexOf(r);
        if (r === 'nenhuma') {
            $scope.onboarding.restrictions = idx > -1 ? [] : ['nenhuma'];
        } else {
            var ni = $scope.onboarding.restrictions.indexOf('nenhuma');
            if (ni > -1) $scope.onboarding.restrictions.splice(ni, 1);
            if (idx > -1) $scope.onboarding.restrictions.splice(idx, 1);
            else $scope.onboarding.restrictions.push(r);
        }
    };

    $scope.toggleTrainingDay = function(dayId) {
        var idx = $scope.onboarding.training_days.indexOf(dayId);
        if (idx > -1) $scope.onboarding.training_days.splice(idx, 1);
        else $scope.onboarding.training_days.push(dayId);
    };

    $scope.canAdvanceOnboarding = function() {
        if ($scope.onboardingStep === 1) return $scope.onboarding.sex && $scope.onboarding.age && $scope.onboarding.height && $scope.onboarding.weight && $scope.onboarding.goal;
        if ($scope.onboardingStep === 2) return $scope.onboarding.meal_routine.filter(function(m) { return m.enabled; }).length >= 2;
        if ($scope.onboardingStep === 3) return $scope.onboarding.budget;
        if ($scope.onboardingStep === 4) return $scope.onboarding.training_days.length >= 1;
        if ($scope.onboardingStep === 5) return $scope.onboarding.equipment;
        return true;
    };

    $scope.nextOnboardingStep = function() {
        if ($scope.canAdvanceOnboarding() && $scope.onboardingStep < 8) {
            $scope.onboardingStep++;
        }
    };

    // FIX BUG #1: Back button uses function to avoid child scope write issue
    $scope.prevOnboardingStep = function() {
        if ($scope.onboardingStep > 1) {
            $scope.onboardingStep--;
        }
    };

    $scope.goToOnboardingStep = function(step) {
        $scope.onboardingStep = step;
    };

    // Photo uploads for onboarding
    $scope.triggerSpacePhoto = function() {
        document.getElementById('spacePhotoInput').click();
    };

    $scope.onSpacePhoto = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() { $scope.onboarding.space_photo = e.target.result; });
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    $scope.triggerBodyPhoto = function(type) {
        document.getElementById('bodyPhoto' + (type === 'front' ? 'Front' : 'Side') + 'Input').click();
    };

    $scope.onBodyPhoto = function(type, input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() {
                    if (type === 'front') $scope.onboarding.body_photo_front = e.target.result;
                    else $scope.onboarding.body_photo_side = e.target.result;
                });
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    // ========== AI Goal Setting ==========
    $scope.aiGoal = null;
    $scope.goalLoading = false;

    $scope.generateAIGoal = function() {
        $scope.goalLoading = true;
        $scope.onboardingStep = 7;
        var ob = $scope.onboarding;

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

        $http.post(CONFIG.OPENAI_API + '/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Você é um nutricionista e personal trainer. Responda apenas em JSON válido.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 500
        }, {
            headers: { 'Authorization': 'Bearer ' + CONFIG.OPENAI_KEY }
        }).then(function(res) {
            var text = res.data.choices[0].message.content.trim();
            // Remove markdown code block if present
            text = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
            try {
                $scope.aiGoal = JSON.parse(text);
            } catch(e) {
                $scope.aiGoal = { summary: text, tip: '' };
            }
            $scope.goalLoading = false;
        }).catch(function() {
            $scope.aiGoal = { summary: 'Com base nos seus dados, recomendo uma abordagem gradual e consistente. Vamos definir metas realistas durante a geração do seu plano.', tip: 'Consistência é mais importante que intensidade!' };
            $scope.goalLoading = false;
        });
    };

    $scope.goalForm = { feedback: '' };

    $scope.adjustGoal = function() {
        if (!$scope.goalForm.feedback) return;
        $scope.goalLoading = true;
        var ob = $scope.onboarding;

        var prompt = 'Você é um nutricionista e personal trainer brasileiro certificado. O paciente recebeu esta meta:\n\n' +
            JSON.stringify($scope.aiGoal) + '\n\n' +
            'Dados: ' + (ob.sex === 'M' ? 'Masculino' : 'Feminino') + ', ' + ob.age + ' anos, ' + ob.height + 'cm, ' + ob.weight + 'kg, objetivo: ' + ob.goal + '.\n\n' +
            'O paciente fez esta consideração:\n"' + $scope.goalForm.feedback + '"\n\n' +
            'Como profissional, avalie a solicitação, faça os ajustes que considerar pertinentes e dê um feedback profissional. Se a solicitação não for recomendada, explique educadamente o porquê e sugira alternativas.\n\n' +
            'Responda em JSON com os mesmos campos: summary (inclua o feedback sobre a solicitação do paciente), target_weight, target_bf, timeline, tip, daily_calories.\n' +
            'Retorne APENAS o JSON, sem markdown code block.';

        $http.post(CONFIG.OPENAI_API + '/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Você é um nutricionista e personal trainer. Responda apenas em JSON válido.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 600
        }, {
            headers: { 'Authorization': 'Bearer ' + CONFIG.OPENAI_KEY }
        }).then(function(res) {
            var text = res.data.choices[0].message.content.trim().replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
            try { $scope.aiGoal = JSON.parse(text); } catch(e) { $scope.aiGoal = { summary: text, tip: '' }; }
            $scope.goalLoading = false;
            $scope.goalForm.feedback = '';
        }).catch(function() {
            $scope.goalLoading = false;
        });
    };

    // ========== 90-Day Challenge ==========
    $scope.joinChallenge90FromOnboarding = function() {
        $scope.challenge90 = {
            active: true,
            startDate: new Date().toISOString(),
            day: 0,
            photos: { day0_front: $scope.onboarding.body_photo_front || null, day0_side: $scope.onboarding.body_photo_side || null }
        };
        localStorage.setItem('fitevolve_challenge90', JSON.stringify($scope.challenge90));
        logAction('daily_challenge', { type: '90_day_challenge', action: 'join' });
        $scope.completeOnboarding();
    };

    $scope.joinChallenge90 = function() {
        $scope.challenge90 = {
            active: true,
            startDate: new Date().toISOString(),
            day: 0,
            photos: {}
        };
        localStorage.setItem('fitevolve_challenge90', JSON.stringify($scope.challenge90));
        $scope.showChallengeOffer = false;
        logAction('daily_challenge', { type: '90_day_challenge', action: 'join' });
    };

    // ========== Plan Generation During Onboarding ==========
    function startGeneratingPlans() {
        $scope.onboardingStep = 8;
        $scope.generatingProgress = 0;
        $scope.generatingMessage = motivationalMessages[0];

        var msgIdx = 0;
        var msgInterval = $interval(function() {
            msgIdx = (msgIdx + 1) % motivationalMessages.length;
            $scope.generatingMessage = motivationalMessages[msgIdx];
        }, 3000);

        var progressInterval = $interval(function() {
            if ($scope.generatingProgress < 90) $scope.generatingProgress += Math.random() * 8 + 2;
        }, 500);

        var userId = localStorage.getItem('fitevolve_user');
        var data = angular.copy($scope.onboarding);
        data._id = userId;
        data.created = new Date().toISOString();
        var mealTimes = data.meal_routine.filter(function(m) { return m.enabled; }).map(function(m) {
            return { id: m.id, label: m.label, time: (typeof m.time === 'object' && m.time) ? formatTime(m.time) : m.time };
        });
        data.meal_times = mealTimes;

        // Strip base64 images before saving to Funifier (BSON size limit)
        delete data.body_photo_front;
        delete data.body_photo_side;
        delete data.space_photo;

        $http.put(API + '/v3/database/profile__c', data, authHeader()).then(function() {
            $scope.profileData = data;
        }).catch(function() {});

        var mealDone = false, workoutDone = false;
        function checkDone() {
            if (mealDone && workoutDone) {
                $interval.cancel(msgInterval);
                $interval.cancel(progressInterval);
                $scope.generatingProgress = 100;
                $timeout(function() { $scope.onboardingStep = 9; }, 800);
            }
        }

        generateMealPlanAPI(data).then(function(plan) {
            $scope.mealPlan = plan;
            localStorage.setItem('fitevolve_mealplan', JSON.stringify(plan));
            mealDone = true;
            checkDone();
        }).catch(function() {
            $scope.mealPlan = createFallbackMealPlan(mealTimes);
            localStorage.setItem('fitevolve_mealplan', JSON.stringify($scope.mealPlan));
            mealDone = true;
            checkDone();
        });

        generateWorkoutPlanAPI(data).then(function(plan) {
            $scope.workoutPlan = plan;
            localStorage.setItem('fitevolve_workoutplan', JSON.stringify(plan));
            workoutDone = true;
            checkDone();
        }).catch(function() {
            $scope.workoutPlan = createFallbackWorkoutPlan(data.training_days);
            localStorage.setItem('fitevolve_workoutplan', JSON.stringify($scope.workoutPlan));
            workoutDone = true;
            checkDone();
        });
    }
    $scope.startGeneratingPlans = startGeneratingPlans;

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

    // FEATURE #4: AI flexibility on meal times
    function generateMealPlanAPI(profileData) {
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

        return $http.post(CONFIG.OPENAI_API + '/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Você é um nutricionista brasileiro profissional. Responda SOMENTE JSON válido, sem blocos de código.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 2000
        }, {
            headers: { 'Authorization': 'Bearer ' + CONFIG.OPENAI_KEY }
        }).then(function(res) {
            var text = res.data.choices[0].message.content.trim();
            text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            var plan = JSON.parse(text);
            plan.date = new Date().toLocaleDateString('pt-BR');
            plan.timestamp = new Date().toISOString();
            return plan;
        });
    }

    function generateWorkoutPlanAPI(profileData) {
        var p = profileData;
        var equipMap = { none: 'apenas peso corporal', basic: 'halteres e elásticos', gym: 'academia completa' };
        var goalMap = { perder_peso: 'perder peso/gordura', ganhar_massa: 'ganhar massa muscular', saude: 'saúde geral' };
        var dayNames = {};
        $scope.weekDays.forEach(function(d) { dayNames[d.id] = d.name; });
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

        return $http.post(CONFIG.OPENAI_API + '/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Você é um personal trainer brasileiro. Responda SOMENTE JSON válido, sem blocos de código.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 2000
        }, {
            headers: { 'Authorization': 'Bearer ' + CONFIG.OPENAI_KEY }
        }).then(function(res) {
            var text = res.data.choices[0].message.content.trim();
            text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            var plan = JSON.parse(text);
            plan.date = new Date().toLocaleDateString('pt-BR');
            plan.timestamp = new Date().toISOString();
            // Sort days in correct order: Seg, Ter, Qua, Qui, Sex, Sab, Dom
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
    }

    function createFallbackMealPlan(mealTimes) {
        var meals = (mealTimes || []).map(function(m) {
            return { time: m.time || '12:00', name: m.label || 'Refeição', description: 'Plano será gerado em breve', foods: [{ food: 'Alimento', quantity: '1 porção', calories: 200 }], total_calories: 200 };
        });
        return { meals: meals, total_calories: meals.length * 200, date: new Date().toLocaleDateString('pt-BR'), timestamp: new Date().toISOString() };
    }

    function createFallbackWorkoutPlan(trainingDays) {
        var days = $scope.weekDays.map(function(d) {
            var isTraining = (trainingDays || []).indexOf(d.id) > -1;
            return { day_name: d.name, muscle_group: isTraining ? 'Treino geral' : null, exercises: isTraining ? [{ name: 'Exercício', sets: 3, reps: '12', weight_suggestion: '' }] : [], duration_minutes: isTraining ? 45 : 0 };
        });
        return { days: days, date: new Date().toLocaleDateString('pt-BR'), timestamp: new Date().toISOString() };
    }

    $scope.completeOnboarding = function() {
        logAction('complete_onboarding', { goal: $scope.profileData.goal });
        $scope.goTo('dashboard');
    };

    function loadProfileData() {
        var userId = localStorage.getItem('fitevolve_user');
        if (!token) return;
        $http.get(API + '/v3/database/profile__c/' + userId, authHeader()).then(function(res) {
            if (res.data && res.data._id) {
                $scope.profileData = res.data;
                // Load latest body analysis
                var savedAnalysis = localStorage.getItem('fitevolve_body_analysis');
                if (savedAnalysis) $scope.latestBodyAnalysis = savedAnalysis;
            }
        }).catch(function() {});
    }

    $scope.goalLabel = function(g) {
        return { perder_peso: 'Perder peso', ganhar_massa: 'Ganhar massa', saude: 'Saúde geral' }[g] || g;
    };
    $scope.equipLabel = function(e) {
        return { none: 'Sem equipamento', basic: 'Básico', gym: 'Academia' }[e] || e;
    };

    // ========== Dashboard ==========
    function loadDashboard() {
        var userId = localStorage.getItem('fitevolve_user');
        if (!token || !userId) return;
        loadWater();
        loadProfileData();
        updateNextMeal();
        updateNextActions();

        $http.get(API + '/v3/achievement?userId=' + userId, authHeader()).then(function(res) {
            $scope.playerPoints = { xp: 0, energy: 0 };
            res.data.forEach(function(a) {
                if (a.item === 'xp' && a.type === 0) $scope.playerPoints.xp += Math.floor(a.total || 0);
                if (a.item === 'energy' && a.type === 0) $scope.playerPoints.energy += Math.floor(a.total || 0);
            });
            updateLevelProgress();
        });

        $http.get(API + '/v3/level', authHeader()).then(function(res) {
            levels = res.data.sort(function(a, b) { return a.position - b.position; });
            updateLevelProgress();
        });

        $http.get(API + '/v3/challenge', authHeader()).then(function(res) {
            $scope.activeChallenges = res.data.slice(0, 5);
        });
    }

    function updateNextMeal() {
        var cached = localStorage.getItem('fitevolve_mealplan');
        if (!cached) { $scope.nextMeal = null; return; }
        try {
            var plan = JSON.parse(cached);
            if (!plan.meals || !plan.meals.length) { $scope.nextMeal = null; return; }
            var now = new Date();
            var nowMinutes = now.getHours() * 60 + now.getMinutes();
            var next = null;
            for (var i = 0; i < plan.meals.length; i++) {
                var parts = (plan.meals[i].time || '12:00').split(':');
                var mealMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
                if (mealMinutes > nowMinutes) { next = plan.meals[i]; break; }
            }
            $scope.nextMeal = next || plan.meals[0];
        } catch(e) { $scope.nextMeal = null; }
    }

    // FEATURE #11: Dashboard next actions
    function updateNextActions() {
        $scope.nextActions = [];
        var now = new Date();
        var nowMinutes = now.getHours() * 60 + now.getMinutes();

        // Next meal
        if ($scope.nextMeal) {
            $scope.nextActions.push({
                icon: '🍽️',
                title: $scope.nextMeal.time + ' — ' + $scope.nextMeal.name,
                desc: $scope.nextMeal.description || ($scope.nextMeal.foods ? $scope.nextMeal.foods.map(function(f){return f.food;}).join(', ') : ''),
                onClick: function() { $scope.goTo('meal-plan'); }
            });
        }

        // Water reminder
        var waterPct = $scope.waterMl / ($scope.waterGoalMl || 2800) * 100;
        if (waterPct < 100) {
            $scope.nextActions.push({
                icon: '💧',
                title: 'Beber água',
                desc: ($scope.waterMl || 0) + 'ml / ' + ($scope.waterGoalMl || 2800) + 'ml',
                onClick: function() { $scope.goTo('water'); }
            });
        }

        // Next workout
        var cachedWorkout = localStorage.getItem('fitevolve_workoutplan');
        if (cachedWorkout) {
            try {
                var wp = JSON.parse(cachedWorkout);
                if (wp.days) {
                    var todayIdx = new Date().getDay();
                    var dayMap = [6, 0, 1, 2, 3, 4, 5];
                    var idx = dayMap[todayIdx];
                    var today = wp.days[idx];
                    if (today && today.muscle_group && !today.done) {
                        $scope.nextActions.push({
                            icon: '💪',
                            title: 'Treino de hoje: ' + today.muscle_group,
                            desc: (today.exercises ? today.exercises.length : 0) + ' exercícios' + (today.duration_minutes ? ' • ~' + today.duration_minutes + 'min' : ''),
                            onClick: function() { $scope.goTo('workout-plan'); }
                        });
                    }
                }
            } catch(e) {}
        }
    }

    function updateLevelProgress() {
        if (!levels.length) return;
        var xp = $scope.playerPoints.xp || 0;
        var currentLevel = levels[0];
        var next = levels[1];
        for (var i = levels.length - 1; i >= 0; i--) {
            if (xp >= levels[i].minPoints) { currentLevel = levels[i]; next = levels[i + 1] || null; break; }
        }
        $scope.playerLevel = currentLevel;
        $scope.nextLevel = next;
        if (next) {
            var range = next.minPoints - currentLevel.minPoints;
            var progress = xp - currentLevel.minPoints;
            $scope.levelProgress = Math.min(100, Math.floor((progress / range) * 100));
        } else {
            $scope.levelProgress = 100;
        }
    }

    // ========== Actions ==========
    function logAction(actionId, attributes) {
        var userId = localStorage.getItem('fitevolve_user');
        return $http.post(API + '/v3/action/log', {
            actionId: actionId,
            userId: userId,
            attributes: attributes || {}
        }, authHeader());
    }

    // ========== Water Tracking (FEATURE #10) ==========
    function waterKey() { return 'fitevolve_water_' + new Date().toISOString().slice(0, 10); }
    function waterMlKey() { return 'fitevolve_waterml_' + new Date().toISOString().slice(0, 10); }

    function loadWater() {
        $scope.waterMl = parseInt(localStorage.getItem(waterMlKey()) || '0');
        $scope.waterCupsToday = parseInt(localStorage.getItem(waterKey()) || '0');
        // Calculate goal based on weight
        if ($scope.profileData && $scope.profileData.weight) {
            $scope.waterGoalMl = Math.round($scope.profileData.weight * 35);
        } else {
            $scope.waterGoalMl = 2800;
        }
        $scope.waterCupsGoal = Math.ceil($scope.waterGoalMl / $scope.waterCupSize);
        $scope.waterPercent = Math.min(100, Math.round(($scope.waterMl / $scope.waterGoalMl) * 100));
        $scope.waterCupsArray = new Array(Math.max($scope.waterCupsToday, $scope.waterCupsGoal));
    }

    function loadWaterScreen() {
        if ($scope.profileData && $scope.profileData.weight) {
            $scope.waterGoalMl = Math.round($scope.profileData.weight * 35);
        }
        loadWater();
    }

    $scope.registerWater = function() {
        $scope.goTo('water');
    };

    $scope.registerWaterCup = function() {
        $scope.waterCupsToday++;
        $scope.waterMl += $scope.waterCupSize;
        localStorage.setItem(waterKey(), $scope.waterCupsToday);
        localStorage.setItem(waterMlKey(), $scope.waterMl);
        $scope.waterPercent = Math.min(100, Math.round(($scope.waterMl / $scope.waterGoalMl) * 100));
        $scope.waterCupsGoal = Math.ceil($scope.waterGoalMl / $scope.waterCupSize);
        $scope.waterCupsArray = new Array(Math.max($scope.waterCupsToday, $scope.waterCupsGoal));
        logAction('register_water', { cups: 1, ml: $scope.waterCupSize });
    };

    // ========== Meal Plan (Daily) ==========
    function loadMealPlan() {
        var cached = localStorage.getItem('fitevolve_mealplan');
        if (cached) {
            try { $scope.mealPlan = JSON.parse(cached); } catch(e) { $scope.mealPlan = null; }
        } else {
            $scope.mealPlan = null;
        }
        $scope.showMealAdjust = false;
        $scope.mealAdjustFeedback = null;
    }

    $scope.generateMealPlan = function() {
        if (!$scope.profileData) {
            loadProfileData();
            if (!$scope.profileData) { $scope.error = 'Complete seu perfil primeiro.'; return; }
        }
        $scope.loading = true;
        generateMealPlanAPI($scope.profileData).then(function(plan) {
            $scope.mealPlan = plan;
            localStorage.setItem('fitevolve_mealplan', JSON.stringify(plan));
            $scope.loading = false;
        }).catch(function() {
            $scope.error = 'Erro ao gerar plano. Tente novamente.';
            $scope.loading = false;
        });
    };

    // Toggle functions (avoid ng-if child scope issues)
    $scope.toggleMealAdjust = function() { $scope.showMealAdjust = !$scope.showMealAdjust; };
    $scope.toggleWorkoutAdjust = function() { $scope.showWorkoutAdjust = !$scope.showWorkoutAdjust; };

    $scope.regenerateMealPlan = function() {
        if (!$scope.profileData) return;
        $scope.loading = true;
        generateMealPlanAPI($scope.profileData).then(function(plan) {
            $scope.mealPlan = plan;
            localStorage.setItem('fitevolve_mealplan', JSON.stringify(plan));
            $scope.loading = false;
        }).catch(function() { $scope.loading = false; });
    };

    $scope.regenerateWorkoutPlan = function() {
        if (!$scope.profileData) return;
        $scope.loading = true;
        generateWorkoutPlanAPI($scope.profileData).then(function(plan) {
            $scope.workoutPlan = plan;
            localStorage.setItem('fitevolve_workoutplan', JSON.stringify(plan));
            $scope.loading = false;
        }).catch(function() { $scope.loading = false; });
    };

    // FEATURE #5: Adjust meal plan
    $scope.adjustMealPlan = function() {
        if (!$scope.mealForm.adjustText || !$scope.mealPlan) return;
        $scope.loading = true;
        $scope.mealAdjustFeedback = null;
        var p = $scope.profileData || {};
        var goalMap = { perder_peso: 'perder peso', ganhar_massa: 'ganhar massa', saude: 'saúde geral' };

        var prompt = 'Você é um nutricionista brasileiro profissional. O paciente tem o seguinte plano alimentar:\n' +
            JSON.stringify($scope.mealPlan) + '\n\n' +
            'Perfil: ' + (p.sex === 'M' ? 'Masculino' : 'Feminino') + ', ' + p.age + ' anos, ' + p.height + 'cm, ' + p.weight + 'kg. ' +
            'Objetivo: ' + (goalMap[p.goal] || 'saúde geral') + '. ' +
            'Restrições: ' + ((p.restrictions && p.restrictions.length) ? p.restrictions.join(', ') : 'nenhuma') + '.\n\n' +
            'O paciente pediu este ajuste: "' + $scope.mealForm.adjustText + '"\n\n' +
            'Faça o ajuste se for profissionalmente apropriado. Mantenha dentro das metas calóricas. ' +
            'Responda em JSON com este formato: {"feedback":"explicação do que você mudou e por quê (em português)","meals":[...],"total_calories":XXXX}\n' +
            'O campo feedback deve explicar as mudanças de forma amigável. Responda SOMENTE JSON válido, sem markdown.';

        $http.post(CONFIG.OPENAI_API + '/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Você é um nutricionista brasileiro. Responda SOMENTE JSON válido.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 2500
        }, {
            headers: { 'Authorization': 'Bearer ' + CONFIG.OPENAI_KEY }
        }).then(function(res) {
            var text = res.data.choices[0].message.content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
            var result = JSON.parse(text);
            $scope.mealAdjustFeedback = result.feedback;
            if (result.meals) {
                $scope.mealPlan.meals = result.meals;
                if (result.total_calories) $scope.mealPlan.total_calories = result.total_calories;
                $scope.mealPlan.date = new Date().toLocaleDateString('pt-BR');
                localStorage.setItem('fitevolve_mealplan', JSON.stringify($scope.mealPlan));
            }
            $scope.loading = false;
        }).catch(function() {
            $scope.mealAdjustFeedback = 'Não consegui ajustar agora. Tente novamente! 😊';
            $scope.loading = false;
        });
    };

    $scope.isNextMeal = function(meal) {
        if (!$scope.nextMeal) return false;
        return meal.time === $scope.nextMeal.time && meal.name === $scope.nextMeal.name;
    };

    function mealRegKey() { return 'fitevolve_meals_' + new Date().toISOString().slice(0, 10); }

    $scope.isMealRegistered = function(meal) {
        try {
            var regs = JSON.parse(localStorage.getItem(mealRegKey()) || '[]');
            return regs.indexOf(meal.time + '_' + meal.name) > -1;
        } catch(e) { return false; }
    };

    function markMealRegistered(meal) {
        var key = mealRegKey();
        var regs = [];
        try { regs = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
        var id = meal.time + '_' + meal.name;
        if (regs.indexOf(id) === -1) regs.push(id);
        localStorage.setItem(key, JSON.stringify(regs));
    }

    $scope.registerMealPhoto = function(meal) {
        $scope.registeringMeal = meal;
        $scope.mealPhoto = null;
        $scope.mealAnalysis = null;
        $scope.mealType = meal.name;
        $scope.view = 'meal';
    };

    // ========== Meal Photo ==========
    $scope.triggerPhotoUpload = function() { document.getElementById('mealPhotoInput').click(); };

    $scope.onMealPhoto = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() { $scope.mealPhoto = e.target.result; });
                analyzeMealPhoto(e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    function analyzeMealPhoto(base64) {
        $scope.loading = true;
        var plannedMeal = $scope.registeringMeal || {};
        var plannedCalories = plannedMeal.total_calories || 0;
        var plannedFoods = (plannedMeal.foods || []).map(function(f) { return f.food + ' (' + f.quantity + ')'; }).join(', ');

        var compareInstruction = '';
        if (plannedCalories > 0) {
            compareInstruction = '\n\nIMPORTANTE: Esta refeição estava planejada com ' + plannedCalories + ' kcal (' + plannedFoods + '). ' +
                'Compare o que você vê na foto com o planejado. Se a quantidade de calorias estimada da foto for significativamente MAIOR que o planejado, ' +
                'avise o usuário de forma educada e sugira ajustes na porção. Ex: "Seu prato tem aproximadamente X kcal, mas o planejado era Y kcal. ' +
                'Tente reduzir a porção de [alimento] para ficar mais próximo da meta." ' +
                'Se estiver dentro da faixa planejada (+/- 20%), parabenize o usuário.';
        }

        $http.post(CONFIG.OPENAI_API + '/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Você é um nutricionista brasileiro profissional analisando a foto de um prato. Responda de forma breve e amigável: 1) Identifique os alimentos e quantidades. 2) Estime calorias totais. 3) Compare com o planejado se disponível. 4) Dê feedback profissional sobre porção. Use linguagem simples e emojis. Máximo 150 palavras.' },
                { role: 'user', content: [
                    { type: 'text', text: 'Analise este prato:' + compareInstruction },
                    { type: 'image_url', image_url: { url: base64 } }
                ]}
            ],
            max_tokens: 400
        }, {
            headers: { 'Authorization': 'Bearer ' + CONFIG.OPENAI_KEY }
        }).then(function(res) {
            $scope.mealAnalysis = res.data.choices[0].message.content;
            $scope.loading = false;
        }).catch(function() {
            $scope.mealAnalysis = 'Não consegui analisar agora. Registre assim mesmo! 😊';
            $scope.loading = false;
        });
    }

    $scope.submitMeal = function() {
        var mealName = $scope.mealType || ($scope.registeringMeal ? $scope.registeringMeal.name : 'Refeição');
        logAction('register_meal', { meal_type: mealName, photo_url: $scope.mealPhoto ? 'uploaded' : '' });
        if ($scope.mealPhoto) logAction('photo_meal', { photo_url: 'uploaded', feedback: $scope.mealAnalysis || '' });
        if ($scope.registeringMeal) markMealRegistered($scope.registeringMeal);
        $scope.success = '✅ Refeição registrada! +15 XP';
        $scope.mealType = '';
        $scope.mealPhoto = null;
        $scope.mealAnalysis = null;
        $scope.registeringMeal = null;
        $timeout(function() { $scope.goTo('meal-plan'); }, 1500);
    };

    // ========== Workout Quick Log ==========
    $scope.submitWorkout = function() {
        if (!$scope.workoutLog.type || !$scope.workoutLog.duration) return;
        $scope.loading = true;
        logAction('complete_workout', {
            type: $scope.workoutLog.type,
            duration: $scope.workoutLog.duration,
            notes: $scope.workoutLog.notes || ''
        }).then(function() {
            $scope.success = '✅ Treino registrado! +20 XP 💪';
            $scope.loading = false;
            $timeout(function() { $scope.goTo('dashboard'); }, 1500);
        }).catch(function() {
            $scope.success = '✅ Treino registrado!';
            $scope.loading = false;
            $timeout(function() { $scope.goTo('dashboard'); }, 1500);
        });
    };

    // ========== Coach Chat (BUG #2 FIXED) ==========
    $scope.sendChat = function() {
        if (!$scope.chat.input || $scope.chatLoading) return;
        var msg = $scope.chat.input;
        $scope.chatMessages.push({ role: 'user', content: msg });
        $scope.chat.input = '';
        $scope.chatLoading = true;

        var profileInfo = '';
        if ($scope.profileData) {
            profileInfo = ' Perfil: ' + $scope.profileData.age + ' anos, ' + $scope.profileData.height + 'cm, ' +
                $scope.profileData.weight + 'kg, objetivo: ' + ($scope.profileData.goal || '') +
                ', equipamento: ' + ($scope.profileData.equipment || '') + '.';
        }

        var systemPrompt = 'Você é o FitEvolve Coach, um coach de nutrição e treino brasileiro. ' +
            'O jogador se chama ' + ($scope.player.name || 'amigo') + '. ' +
            'Nível atual: ' + ($scope.playerLevel.level || 'Iniciante') + '. XP: ' + ($scope.playerPoints.xp || 0) + '.' +
            profileInfo +
            ' Responda de forma breve, motivadora e prática. Use linguagem coloquial brasileira e emojis. ' +
            'Se perguntarem sobre comida, considere a realidade brasileira (arroz, feijão, etc). ' +
            'Máximo 150 palavras por resposta.';

        var messages = [{ role: 'system', content: systemPrompt }];
        $scope.chatMessages.forEach(function(m) {
            messages.push({ role: m.role, content: m.content });
        });

        $http.post(CONFIG.OPENAI_API + '/chat/completions', {
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 400
        }, {
            headers: { 'Authorization': 'Bearer ' + CONFIG.OPENAI_KEY }
        }).then(function(res) {
            var reply = res.data.choices[0].message.content;
            $scope.chatMessages.push({ role: 'assistant', content: reply });
            $scope.chatLoading = false;
            logAction('interact_coach', { message: msg.substring(0, 100) });
            $timeout(function() {
                var el = document.getElementById('chatMessages');
                if (el) el.scrollTop = el.scrollHeight;
            }, 100);
        }).catch(function() {
            $scope.chatMessages.push({ role: 'assistant', content: 'Desculpa, tô com dificuldade agora. Tenta de novo! 🏔️' });
            $scope.chatLoading = false;
        });
    };

    // ========== Workout Plan ==========
    function loadWorkoutPlan() {
        var cached = localStorage.getItem('fitevolve_workoutplan');
        if (cached) {
            try {
                $scope.workoutPlan = JSON.parse(cached);
                if ($scope.workoutPlan.days) {
                    var todayIdx = new Date().getDay();
                    var dayMap = [6, 0, 1, 2, 3, 4, 5];
                    var idx = dayMap[todayIdx];
                    if ($scope.workoutPlan.days[idx]) $scope.workoutPlan.days[idx].open = true;
                }
            } catch(e) { $scope.workoutPlan = null; }
        } else {
            $scope.workoutPlan = null;
        }
        $scope.showWorkoutAdjust = false;
        $scope.workoutAdjustFeedback = null;
    }

    $scope.generateWorkoutPlan = function() {
        if (!$scope.profileData) {
            loadProfileData();
            if (!$scope.profileData) { $scope.error = 'Complete seu perfil primeiro.'; return; }
        }
        $scope.loading = true;
        generateWorkoutPlanAPI($scope.profileData).then(function(plan) {
            $scope.workoutPlan = plan;
            localStorage.setItem('fitevolve_workoutplan', JSON.stringify(plan));
            $scope.loading = false;
        }).catch(function() {
            $scope.error = 'Erro ao gerar plano. Tente novamente.';
            $scope.loading = false;
        });
    };

    $scope.markWorkoutDone = function(day) {
        day.done = true;
        logAction('complete_workout', { day: day.day_name, focus: day.muscle_group });
        if ($scope.workoutPlan) localStorage.setItem('fitevolve_workoutplan', JSON.stringify($scope.workoutPlan));
    };

    // FEATURE #7: Adjust workout plan
    $scope.triggerAdjustSpacePhoto = function() {
        document.getElementById('adjustSpacePhotoInput').click();
    };

    $scope.onAdjustSpacePhoto = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() { $scope.workoutAdjustPhoto = e.target.result; });
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    $scope.adjustWorkoutPlan = function() {
        if (!$scope.workoutForm.adjustText || !$scope.workoutPlan) return;
        $scope.loading = true;
        $scope.workoutAdjustFeedback = null;
        var p = $scope.profileData || {};
        var equipMap = { none: 'peso corporal', basic: 'halteres e elásticos', gym: 'academia completa' };
        var goalMap = { perder_peso: 'perder peso', ganhar_massa: 'ganhar massa', saude: 'saúde geral' };

        var messages = [
            { role: 'system', content: 'Você é um personal trainer brasileiro profissional. Responda SOMENTE JSON válido.' }
        ];

        var userContent = [];
        userContent.push({ type: 'text', text: 'Você é um personal trainer. O aluno tem este plano de treino:\n' +
            JSON.stringify($scope.workoutPlan) + '\n\n' +
            'Perfil: ' + (p.sex === 'M' ? 'Masculino' : 'Feminino') + ', ' + p.age + ' anos, ' + p.height + 'cm, ' + p.weight + 'kg. ' +
            'Objetivo: ' + (goalMap[p.goal] || 'saúde geral') + '. Equipamento atual: ' + (equipMap[p.equipment] || 'peso corporal') + '.\n\n' +
            'O aluno pediu: "' + $scope.workoutForm.adjustText + '"\n\n' +
            'Adapte o treino considerando o grupo muscular que ele precisa treinar e o equipamento disponível. ' +
            'Responda em JSON: {"feedback":"explicação amigável do que mudou","days":[...]}\n' +
            'Responda SOMENTE JSON válido, sem markdown.' });

        if ($scope.workoutAdjustPhoto) {
            userContent.push({ type: 'image_url', image_url: { url: $scope.workoutAdjustPhoto } });
        }

        messages.push({ role: 'user', content: userContent.length === 1 ? userContent[0].text : userContent });

        $http.post(CONFIG.OPENAI_API + '/chat/completions', {
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 2500
        }, {
            headers: { 'Authorization': 'Bearer ' + CONFIG.OPENAI_KEY }
        }).then(function(res) {
            var text = res.data.choices[0].message.content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
            var result = JSON.parse(text);
            $scope.workoutAdjustFeedback = result.feedback;
            if (result.days) {
                $scope.workoutPlan.days = result.days;
                $scope.workoutPlan.date = new Date().toLocaleDateString('pt-BR');
                localStorage.setItem('fitevolve_workoutplan', JSON.stringify($scope.workoutPlan));
            }
            $scope.loading = false;
        }).catch(function() {
            $scope.workoutAdjustFeedback = 'Não consegui ajustar agora. Tenta de novo! 😊';
            $scope.loading = false;
        });
    };

    // ========== Body Analysis (FEATURE #9) ==========
    $scope.analyzeBodyPhotos = function(frontPhoto, sidePhoto) {
        if (!frontPhoto && !sidePhoto) return;
        $scope.showBodyAnalysis = true;
        $scope.bodyAnalysisLoading = true;
        $scope.bodyAnalysisResult = null;
        $scope.bodyAnalysisError = null;

        var p = $scope.profileData || $scope.onboarding || {};
        // Sync peso/altura from onboarding/profile
        if (p.weight && !$scope.manualMeasures.peso) $scope.manualMeasures.peso = parseFloat(p.weight);
        if (p.height && !$scope.manualMeasures.altura) $scope.manualMeasures.altura = parseFloat(p.height) / 100;
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

        $http.post(CONFIG.OPENAI_API + '/chat/completions', {
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are a certified fitness professional (personal trainer) working in a fitness tracking app. Your role is to provide visual body composition estimates for fitness progress tracking purposes (NOT medical diagnosis). The user has consented to this assessment. Provide approximate visual estimates as a personal trainer would in a gym setting. Always note these are visual estimates. Respond ONLY in valid JSON with Portuguese text in the feedback field.' },
                { role: 'user', content: userContent }
            ],
            max_tokens: 1000
        }, {
            headers: { 'Authorization': 'Bearer ' + CONFIG.OPENAI_KEY }
        }).then(function(res) {
            var text = res.data.choices[0].message.content.trim();
            text = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
            try {
                var parsed = JSON.parse(text);
                $scope.bodyAnalysisResult = parsed.feedback || text;
                // Auto-fill measures
                if (parsed.measures) {
                    if (!$scope.manualMeasures) $scope.manualMeasures = {};
                    Object.keys(parsed.measures).forEach(function(k) {
                        if (parsed.measures[k] != null) $scope.manualMeasures[k] = parsed.measures[k];
                    });
                }
            } catch(e) {
                $scope.bodyAnalysisResult = text;
            }
            $scope.bodyAnalysisLoading = false;
            localStorage.setItem('fitevolve_body_analysis', $scope.bodyAnalysisResult);
            $scope.latestBodyAnalysis = $scope.bodyAnalysisResult;
            // Save analysis log
            saveAnalysisLog('body_photo', $scope.bodyAnalysisResult, $scope.manualMeasures);
        }).catch(function() {
            $scope.bodyAnalysisError = 'Não consegui analisar as fotos agora. Tente novamente.';
            $scope.bodyAnalysisLoading = false;
        });
    };

    $scope.triggerBioReport = function() { document.getElementById('bioReportInput').click(); };

    $scope.onBioReport = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() { $scope.bioReportPhoto = e.target.result; });
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    $scope.analyzeBioReport = function() {
        if (!$scope.bioReportPhoto) return;
        $scope.bodyAnalysisLoading = true;
        $scope.bodyAnalysisResult = null;

        var measureFields = 'peso, altura, gordura_pct, peso_gordo, peso_magro, massa_muscular, cintura, quadril, abdomen, coxas, panturrilhas, braco_relaxado, braco_contraido, deltoides, torax, dobra_subescapular, dobra_tricipital, dobra_toracica, dobra_axilar, dobra_suprailiaca, dobra_abdominal, dobra_coxas, dobra_panturrilhas';

        $http.post(CONFIG.OPENAI_API + '/chat/completions', {
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Você é um nutricionista brasileiro. Extraia dados de laudos de bioimpedância. Responda APENAS em JSON válido.' },
                { role: 'user', content: [
                    { type: 'text', text: 'Extraia os dados deste laudo de bioimpedância.\n\nResponda em JSON com:\n1. "feedback": texto interpretando os dados, explicando cada métrica de forma simples, com recomendações profissionais. Em português, amigável, com emojis.\n2. "measures": objeto com os valores extraídos. Campos possíveis: ' + measureFields + '. Use apenas valores numéricos. Preencha apenas os que encontrar no laudo.\n\nRetorne APENAS o JSON, sem markdown code block.' },
                    { type: 'image_url', image_url: { url: $scope.bioReportPhoto } }
                ]}
            ],
            max_tokens: 1000
        }, {
            headers: { 'Authorization': 'Bearer ' + CONFIG.OPENAI_KEY }
        }).then(function(res) {
            var text = res.data.choices[0].message.content.trim();
            text = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
            try {
                var parsed = JSON.parse(text);
                $scope.bodyAnalysisResult = parsed.feedback || text;
                if (parsed.measures) {
                    if (!$scope.manualMeasures) $scope.manualMeasures = {};
                    Object.keys(parsed.measures).forEach(function(k) {
                        if (parsed.measures[k] != null) $scope.manualMeasures[k] = parsed.measures[k];
                    });
                }
            } catch(e) {
                $scope.bodyAnalysisResult = text;
            }
            $scope.bodyAnalysisLoading = false;
            localStorage.setItem('fitevolve_body_analysis', $scope.bodyAnalysisResult);
            $scope.latestBodyAnalysis = $scope.bodyAnalysisResult;
            saveAnalysisLog('bio_report', $scope.bodyAnalysisResult, $scope.manualMeasures);
        }).catch(function() {
            $scope.bodyAnalysisError = 'Não consegui ler o laudo. Tente com foto mais nítida.';
            $scope.bodyAnalysisLoading = false;
        });
    };

    // Save analysis log to localStorage history
    function saveAnalysisLog(type, feedback, measures) {
        var logs = JSON.parse(localStorage.getItem('fitevolve_analysis_logs') || '[]');
        logs.push({
            type: type,
            date: new Date().toISOString(),
            feedback: feedback,
            measures: measures || {}
        });
        localStorage.setItem('fitevolve_analysis_logs', JSON.stringify(logs));
    }

    // Count filled measures
    $scope.countMeasures = function() {
        if (!$scope.manualMeasures) return 0;
        var count = 0;
        var extraKeys = ['gordura_pct','peso_gordo','peso_magro','massa_muscular','cintura','quadril','abdomen','coxas','panturrilhas','braco_relaxado','braco_contraido','deltoides','torax','dobra_subescapular','dobra_tricipital','dobra_toracica','dobra_axilar','dobra_suprailiaca','dobra_abdominal','dobra_coxas','dobra_panturrilhas'];
        extraKeys.forEach(function(k) { if ($scope.manualMeasures[k]) count++; });
        return count;
    };

    $scope.saveManualMeasures = function() {
        var m = $scope.manualMeasures || {};
        localStorage.setItem('fitevolve_measures', JSON.stringify(m));
        saveAnalysisLog('manual', 'Medidas manuais registradas', m);
        $scope.latestBodyAnalysis = $scope.bodyAnalysisResult || 'Medidas salvas com sucesso!';
        localStorage.setItem('fitevolve_body_analysis', $scope.latestBodyAnalysis);
        $scope.showBodyAnalysis = false;
    };

    // ========== Body Check-in (FEATURE #8: front + side) ==========
    $scope.triggerCheckinPhoto = function(type) {
        document.getElementById('checkinPhoto' + (type === 'front' ? 'Front' : 'Side') + 'Input').click();
    };

    $scope.onCheckinPhotoType = function(type, input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() {
                    if (type === 'front') $scope.checkin.photo_front = e.target.result;
                    else $scope.checkin.photo_side = e.target.result;
                });
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    $scope.submitCheckin = function() {
        if (!$scope.checkin.weight) return;
        $scope.loading = true;
        var userId = localStorage.getItem('fitevolve_user');
        var data = {
            userId: userId,
            weight: parseFloat($scope.checkin.weight),
            photo_front: $scope.checkin.photo_front ? 'uploaded' : '',
            photo_side: $scope.checkin.photo_side ? 'uploaded' : '',
            created: new Date().toISOString()
        };

        $http.put(API + '/v3/database/body_checkin__c', data, authHeader()).then(function() {
            logAction('body_checkin', { weight: data.weight });
            logAction('update_weight', { weight: data.weight });
            if ($scope.profileData) {
                $scope.profileData.weight = data.weight;
                var profileUpdate = angular.copy($scope.profileData);
                profileUpdate._id = userId;
                $http.put(API + '/v3/database/profile__c', profileUpdate, authHeader());
            }
            $scope.success = '✅ Check-in registrado! +10 XP';
            // Auto-analyze body photos if both present
            if ($scope.checkin.photo_front || $scope.checkin.photo_side) {
                $scope.analyzeBodyPhotos($scope.checkin.photo_front, $scope.checkin.photo_side);
            }
            $scope.checkin = {};
            $scope.loading = false;
            loadWeightHistory();
        }).catch(function() {
            $scope.success = '✅ Check-in salvo!';
            $scope.checkin = {};
            $scope.loading = false;
        });
    };

    // ========== Progress ==========
    function loadProgress() {
        var userId = localStorage.getItem('fitevolve_user');
        if (!token) return;

        $http.get(API + '/v3/level', authHeader()).then(function(res) {
            levels = res.data.sort(function(a, b) { return a.position - b.position; });
            var xp = $scope.playerPoints.xp || 0;
            $scope.allLevels = levels.map(function(lv) {
                return { level: lv.level, minPoints: lv.minPoints, reached: xp >= lv.minPoints, current: false };
            });
            for (var i = $scope.allLevels.length - 1; i >= 0; i--) {
                if ($scope.allLevels[i].reached) { $scope.allLevels[i].current = true; break; }
            }
            updateLevelProgress();
        });

        $http.get(API + '/v3/achievement?userId=' + userId, authHeader()).then(function(res) {
            $scope.playerPoints = { xp: 0, energy: 0 };
            res.data.forEach(function(a) {
                if (a.item === 'xp' && a.type === 0) $scope.playerPoints.xp += Math.floor(a.total || 0);
                if (a.item === 'energy' && a.type === 0) $scope.playerPoints.energy += Math.floor(a.total || 0);
            });
            var total = $scope.playerPoints.xp || 0;
            var weeks = ['S1', 'S2', 'S3', 'S4'];
            var maxBar = Math.max(total, 1);
            $scope.xpBars = weeks.map(function(w, i) {
                var val = i === weeks.length - 1 ? total : Math.floor(Math.random() * total * 0.3);
                return { label: w, value: val, pct: Math.min(100, (val / maxBar) * 100) };
            });
        });

        $http.get(API + '/v3/challenge', authHeader()).then(function(res) {
            $scope.activeChallengesCount = res.data.length;
            $scope.completedChallenges = res.data.filter(function(c) { return c.completed; }).length;
        });

        loadWeightHistory();
    }

    function loadWeightHistory() {
        var userId = localStorage.getItem('fitevolve_user');
        if (!token) return;
        $http({
            method: 'GET',
            url: API + '/v3/database/body_checkin__c?_filter=' + encodeURIComponent(JSON.stringify({ userId: userId })) + '&_sort=-created&_limit=20',
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(function(res) {
            if (Array.isArray(res.data)) {
                $scope.weightHistory = res.data.map(function(w) {
                    return { date: new Date(w.created).toLocaleDateString('pt-BR'), weight: w.weight, photo: w.photo || null };
                });
            }
        }).catch(function() { $scope.weightHistory = []; });
    }

    // ========== Init ==========
    function init() {
        // Load challenge90 from localStorage
        try { $scope.challenge90 = JSON.parse(localStorage.getItem('fitevolve_challenge90')); } catch(e) {}
        // Load saved measures
        try { var m = JSON.parse(localStorage.getItem('fitevolve_measures')); if (m) $scope.manualMeasures = m; } catch(e) {}
        // Load body analysis
        $scope.latestBodyAnalysis = localStorage.getItem('fitevolve_body_analysis') || null;

        token = localStorage.getItem('fitevolve_token');
        var user = localStorage.getItem('fitevolve_user');
        if (token && user) {
            $http.get(API + '/v3/player/' + user, authHeader()).then(function(res) {
                $scope.player = res.data;
                checkOnboarding();
            }).catch(function() {
                $scope.goTo('login');
            });
        }
    }

    init();
});
