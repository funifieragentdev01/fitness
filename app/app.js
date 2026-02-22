// FitEvolve — Main App
var app = angular.module('FitEvolve', ['ngSanitize']);

app.controller('AppCtrl', function($scope, $http, $timeout) {
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
    $scope.chatMessages = [
        { role: 'assistant', content: 'Olá! Sou seu coach de nutrição e treino. Como posso te ajudar hoje? 🏔️' }
    ];
    $scope.chatInput = '';
    $scope.chatLoading = false;
    $scope.mealType = '';
    $scope.mealPhoto = null;
    $scope.mealAnalysis = null;

    var token = null;
    var levels = [];

    // ========== Navigation ==========
    $scope.goTo = function(view) {
        $scope.error = '';
        $scope.success = '';
        $scope.view = view;
        if (view === 'dashboard') loadDashboard();
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
        }).catch(function(err) {
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
                $scope.success = 'Conta criada! Faça login para começar.';
                $scope.credentials.username = $scope.reg.username;
                $timeout(function() { $scope.goTo('login'); }, 1500);
            } else {
                $scope.error = res.data.message || 'Erro ao criar conta.';
            }
            $scope.loading = false;
        }).catch(function(err) {
            $scope.error = 'Erro ao criar conta. Tente novamente.';
            $scope.loading = false;
        });
    };

    $scope.logout = function() {
        localStorage.removeItem('fitevolve_token');
        localStorage.removeItem('fitevolve_user');
        token = null;
        $scope.player = {};
        $scope.goTo('login');
    };

    // ========== Load Player Data ==========
    function loadPlayerAndGo() {
        var userId = localStorage.getItem('fitevolve_user');
        $http.get(API + '/v3/player/' + userId, authHeader()).then(function(res) {
            $scope.player = res.data;
            $scope.loading = false;
            $scope.goTo('dashboard');
        }).catch(function() {
            $scope.error = 'Erro ao carregar dados do jogador.';
            $scope.loading = false;
        });
    }

    function loadDashboard() {
        var userId = localStorage.getItem('fitevolve_user');
        if (!token || !userId) return;

        // Load achievements (points)
        $http.get(API + '/v3/achievement?userId=' + userId, authHeader()).then(function(res) {
            var achievements = res.data;
            $scope.playerPoints = { xp: 0, energy: 0 };
            achievements.forEach(function(a) {
                if (a.pointCategory === 'xp') $scope.playerPoints.xp = Math.floor(a.total || 0);
                if (a.pointCategory === 'energy') $scope.playerPoints.energy = Math.floor(a.total || 0);
            });
            updateLevelProgress();
        });

        // Load levels
        $http.get(API + '/v3/level', authHeader()).then(function(res) {
            levels = res.data.sort(function(a, b) { return a.position - b.position; });
            updateLevelProgress();
        });

        // Load challenges
        $http.get(API + '/v3/challenge', authHeader()).then(function(res) {
            $scope.activeChallenges = res.data.slice(0, 5);
        });
    }

    function updateLevelProgress() {
        if (!levels.length) return;
        var xp = $scope.playerPoints.xp || 0;
        var currentLevel = levels[0];
        var next = levels[1];

        for (var i = levels.length - 1; i >= 0; i--) {
            if (xp >= levels[i].minPoints) {
                currentLevel = levels[i];
                next = levels[i + 1] || null;
                break;
            }
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

    $scope.registerWater = function() {
        $scope.todayWater = ($scope.todayWater || 0) + 1;
        logAction('register_water', { cups: 1 }).then(function() {
            // Quick feedback
        });
    };

    // ========== Meal ==========
    $scope.triggerPhotoUpload = function() {
        document.getElementById('mealPhotoInput').click();
    };

    $scope.onMealPhoto = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() {
                    $scope.mealPhoto = e.target.result;
                });
                // Auto-analyze with AI
                analyzeMealPhoto(e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    function analyzeMealPhoto(base64) {
        $scope.loading = true;
        var imageContent = base64.replace(/^data:image\/[a-z]+;base64,/, '');

        $http.post(CONFIG.OPENAI_API + '/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Você é um nutricionista brasileiro analisando a foto de um prato. Responda de forma breve e amigável: 1) Identifique os alimentos. 2) Estime calorias totais. 3) Dê uma dica curta sobre porção ou equilíbrio. Use linguagem simples e emojis. Máximo 100 palavras.'
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analise este prato:' },
                        { type: 'image_url', image_url: { url: base64 } }
                    ]
                }
            ],
            max_tokens: 300
        }, {
            headers: { 'Authorization': 'Bearer ' + CONFIG.OPENAI_KEY, 'Content-Type': 'application/json' }
        }).then(function(res) {
            $scope.mealAnalysis = res.data.choices[0].message.content;
            $scope.loading = false;
        }).catch(function(err) {
            $scope.mealAnalysis = 'Não consegui analisar a foto agora. Registre sua refeição mesmo assim! 😊';
            $scope.loading = false;
        });
    }

    $scope.submitMeal = function() {
        if (!$scope.mealType) return;
        logAction('register_meal', { meal_type: $scope.mealType, photo_url: $scope.mealPhoto ? 'uploaded' : '' });
        if ($scope.mealPhoto) {
            logAction('photo_meal', { photo_url: 'uploaded', feedback: $scope.mealAnalysis || '' });
        }
        $scope.success = '✅ Refeição registrada! +15 XP';
        $scope.mealType = '';
        $scope.mealPhoto = null;
        $scope.mealAnalysis = null;
        $timeout(function() { $scope.goTo('dashboard'); }, 1500);
    };

    // ========== Coach Chat ==========
    $scope.sendChat = function() {
        if (!$scope.chatInput || $scope.chatLoading) return;
        var msg = $scope.chatInput;
        $scope.chatMessages.push({ role: 'user', content: msg });
        $scope.chatInput = '';
        $scope.chatLoading = true;

        var systemPrompt = 'Você é o FitEvolve Coach, um coach de nutrição e treino brasileiro. ' +
            'O jogador se chama ' + ($scope.player.name || 'amigo') + '. ' +
            'Nível atual: ' + ($scope.playerLevel.level || 'Iniciante') + '. XP: ' + ($scope.playerPoints.xp || 0) + '. ' +
            'Responda de forma breve, motivadora e prática. Use linguagem simples e emojis. ' +
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
            headers: { 'Authorization': 'Bearer ' + CONFIG.OPENAI_KEY, 'Content-Type': 'application/json' }
        }).then(function(res) {
            var reply = res.data.choices[0].message.content;
            $scope.chatMessages.push({ role: 'assistant', content: reply });
            $scope.chatLoading = false;
            logAction('interact_coach', { message: msg.substring(0, 100) });
            // Scroll to bottom
            $timeout(function() {
                var el = document.getElementById('chatMessages');
                if (el) el.scrollTop = el.scrollHeight;
            }, 100);
        }).catch(function() {
            $scope.chatMessages.push({ role: 'assistant', content: 'Desculpe, estou com dificuldade agora. Tente novamente em instantes! 🏔️' });
            $scope.chatLoading = false;
        });
    };

    // ========== Init ==========
    function init() {
        token = localStorage.getItem('fitevolve_token');
        var user = localStorage.getItem('fitevolve_user');
        if (token && user) {
            // Try to restore session
            $http.get(API + '/v3/player/' + user, authHeader()).then(function(res) {
                $scope.player = res.data;
                $scope.goTo('dashboard');
            }).catch(function() {
                // Token expired
                $scope.goTo('login');
            });
        } else {
            $timeout(function() {
                // Show splash for 2s then go to login
            }, 2000);
        }
    }

    init();
});
