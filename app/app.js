// Fitness App — Module definition, routes, shared helpers
var app = angular.module('fitness', ['ngSanitize', 'ngRoute']);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/landing', { templateUrl: 'pages/landing/landing.html', controller: 'LandingCtrl' })
        .when('/login', { templateUrl: 'pages/login/login.html', controller: 'LoginCtrl' })
        .when('/signup', { templateUrl: 'pages/signup/signup.html', controller: 'SignupCtrl' })
        .when('/onboarding', { templateUrl: 'pages/onboarding/onboarding.html', controller: 'OnboardingCtrl' })
        .when('/dashboard', { templateUrl: 'pages/dashboard/dashboard.html', controller: 'DashboardCtrl' })
        .when('/meal-plan', { templateUrl: 'pages/meal-plan/meal-plan.html', controller: 'MealPlanCtrl' })
        .when('/meal', { templateUrl: 'pages/meal/meal.html', controller: 'MealCtrl' })
        .when('/workout-plan', { templateUrl: 'pages/workout-plan/workout-plan.html', controller: 'WorkoutPlanCtrl' })
        .when('/workout', { templateUrl: 'pages/workout/workout.html', controller: 'WorkoutCtrl' })
        .when('/water', { templateUrl: 'pages/water/water.html', controller: 'WaterCtrl' })
        .when('/coach', { templateUrl: 'pages/coach/coach.html', controller: 'CoachCtrl' })
        .when('/progress', { templateUrl: 'pages/progress/progress.html', controller: 'ProgressCtrl' })
        .when('/profile', { templateUrl: 'pages/profile/profile.html', controller: 'ProfileCtrl' })
        .when('/body-checkin', { templateUrl: 'pages/body-checkin/body-checkin.html', controller: 'BodyCheckinCtrl' })
        .when('/challenge90', { templateUrl: 'pages/challenge90/challenge90.html', controller: 'Challenge90Ctrl' })
        .when('/contact', { templateUrl: 'pages/contact/contact.html', controller: 'ContactCtrl' })
        .otherwise({ redirectTo: '/landing' });
});

app.run(function($rootScope, $location, $sce, AuthService) {
    // Shared state on $rootScope
    $rootScope.player = {};
    $rootScope.playerPoints = { xp: 0, energy: 0 };
    $rootScope.playerLevel = {};
    $rootScope.nextLevel = null;
    $rootScope.levelProgress = 0;
    $rootScope.profileData = null;
    $rootScope.mealPlan = null;
    $rootScope.workoutPlan = null;
    $rootScope.loading = false;
    $rootScope.error = '';
    $rootScope.success = '';
    $rootScope.challenge90 = null;
    $rootScope.manualMeasures = {};
    $rootScope.latestBodyAnalysis = null;
    $rootScope.showTerms = false;
    $rootScope.showChallengeOffer = false;
    $rootScope.showBodyAnalysis = false;
    $rootScope.bodyAnalysisLoading = false;
    $rootScope.bodyAnalysisResult = null;
    $rootScope.bodyAnalysisError = null;
    $rootScope.bioReportPhoto = null;
    $rootScope.measureCat = {};
    $rootScope.appVersion = CONFIG.VERSION;

    // Upgrade modal
    $rootScope.showUpgradeModal = false;
    $rootScope.upgradeReason = '';
    $rootScope.openUpgrade = function(reason) {
        $rootScope.upgradeReason = reason || 'Faça upgrade para o Premium e desbloqueie todos os recursos!';
        $rootScope.showUpgradeModal = true;
    };
    $rootScope.closeUpgradeModal = function() {
        $rootScope.showUpgradeModal = false;
    };
    $rootScope.upgradeToPremium = function() {
        $rootScope.showUpgradeModal = false;
        $rootScope.success = '🚧 Pagamento será integrado em breve! Contate-nos pelo WhatsApp.';
    };

    // Load saved state
    try { $rootScope.challenge90 = JSON.parse(localStorage.getItem('fitness_challenge90')); } catch(e) {}
    try { var m = JSON.parse(localStorage.getItem('fitness_measures')); if (m) $rootScope.manualMeasures = m; } catch(e) {}
    $rootScope.latestBodyAnalysis = localStorage.getItem('fitness_body_analysis') || null;

    // Shared helpers
    $rootScope.goTo = function(path) {
        $rootScope.error = '';
        $rootScope.success = '';
        $location.path('/' + path);
    };

    $rootScope.formatAnalysis = function(text) {
        if (!text) return '';
        return $sce.trustAsHtml(text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/- /g, '• '));
    };

    $rootScope.openTerms = function($event) {
        if ($event) $event.preventDefault();
        $rootScope.showTerms = true;
    };
    $rootScope.closeTerms = function() { $rootScope.showTerms = false; };
    $rootScope.closeChallengeOffer = function() { $rootScope.showChallengeOffer = false; };
    $rootScope.closeBodyAnalysis = function() { $rootScope.showBodyAnalysis = false; };

    $rootScope.openYoutube = function(exerciseName) {
        var query = encodeURIComponent('como fazer ' + exerciseName + ' exercício');
        window.open('https://www.youtube.com/results?search_query=' + query, '_blank');
    };

    $rootScope.goalLabel = function(g) {
        return { perder_peso: 'Perder peso', ganhar_massa: 'Ganhar massa', saude: 'Saúde geral' }[g] || g;
    };
    $rootScope.equipLabel = function(e) {
        return { none: 'Sem equipamento', basic: 'Básico', gym: 'Academia' }[e] || e;
    };

    // Body Analysis Modal helpers (shared)
    $rootScope.openBodyAnalysisModal = function() {
        $rootScope.showBodyAnalysis = true;
        $rootScope.bodyAnalysisLoading = false;
        $rootScope.bodyAnalysisResult = null;
        $rootScope.bodyAnalysisError = null;
    };

    $rootScope.triggerBioReport = function() { document.getElementById('bioReportInput').click(); };

    $rootScope.onBioReport = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $rootScope.$apply(function() { $rootScope.bioReportPhoto = e.target.result; });
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    $rootScope.countMeasures = function() {
        if (!$rootScope.manualMeasures) return 0;
        var count = 0;
        var extraKeys = ['gordura_pct','peso_gordo','peso_magro','massa_muscular','cintura','quadril','abdomen','coxas','panturrilhas','braco_relaxado','braco_contraido','deltoides','torax','dobra_subescapular','dobra_tricipital','dobra_toracica','dobra_axilar','dobra_suprailiaca','dobra_abdominal','dobra_coxas','dobra_panturrilhas'];
        extraKeys.forEach(function(k) { if ($rootScope.manualMeasures[k]) count++; });
        return count;
    };

    $rootScope.saveManualMeasures = function() {
        var m = $rootScope.manualMeasures || {};
        localStorage.setItem('fitness_measures', JSON.stringify(m));
        saveAnalysisLog('manual', 'Medidas manuais registradas', m);
        $rootScope.latestBodyAnalysis = $rootScope.bodyAnalysisResult || 'Medidas salvas com sucesso!';
        localStorage.setItem('fitness_body_analysis', $rootScope.latestBodyAnalysis);
        $rootScope.showBodyAnalysis = false;
    };

    function saveAnalysisLog(type, feedback, measures) {
        var logs = JSON.parse(localStorage.getItem('fitness_analysis_logs') || '[]');
        logs.push({ type: type, date: new Date().toISOString(), feedback: feedback, measures: measures || {} });
        localStorage.setItem('fitness_analysis_logs', JSON.stringify(logs));
    }
    $rootScope._saveAnalysisLog = saveAnalysisLog;

    // Shared level update
    $rootScope.levels = [];
    $rootScope.updateLevelProgress = function() {
        var levels = $rootScope.levels;
        if (!levels.length) return;
        var xp = $rootScope.playerPoints.xp || 0;
        var currentLevel = levels[0];
        var next = levels[1];
        for (var i = levels.length - 1; i >= 0; i--) {
            if (xp >= levels[i].minPoints) { currentLevel = levels[i]; next = levels[i + 1] || null; break; }
        }
        $rootScope.playerLevel = currentLevel;
        $rootScope.nextLevel = next;
        if (next) {
            var range = next.minPoints - currentLevel.minPoints;
            var progress = xp - currentLevel.minPoints;
            $rootScope.levelProgress = Math.min(100, Math.floor((progress / range) * 100));
        } else {
            $rootScope.levelProgress = 100;
        }
    };

    // Analyze body photos (shared)
    $rootScope.analyzeBodyPhotos = function(frontPhoto, sidePhoto) {
        if (!frontPhoto && !sidePhoto) return;
        var AiService = angular.element(document.body).injector().get('AiService');
        $rootScope.showBodyAnalysis = true;
        $rootScope.bodyAnalysisLoading = true;
        $rootScope.bodyAnalysisResult = null;
        $rootScope.bodyAnalysisError = null;

        var p = $rootScope.profileData || {};
        if (p.weight && !$rootScope.manualMeasures.peso) $rootScope.manualMeasures.peso = parseFloat(p.weight);
        if (p.height && !$rootScope.manualMeasures.altura) $rootScope.manualMeasures.altura = parseFloat(p.height) / 100;

        AiService.analyzeBodyPhotos(frontPhoto, sidePhoto, p).then(function(parsed) {
            $rootScope.bodyAnalysisResult = parsed.feedback || JSON.stringify(parsed);
            if (parsed.measures) {
                Object.keys(parsed.measures).forEach(function(k) {
                    if (parsed.measures[k] != null) $rootScope.manualMeasures[k] = parsed.measures[k];
                });
            }
            $rootScope.bodyAnalysisLoading = false;
            localStorage.setItem('fitness_body_analysis', $rootScope.bodyAnalysisResult);
            $rootScope.latestBodyAnalysis = $rootScope.bodyAnalysisResult;
            saveAnalysisLog('body_photo', $rootScope.bodyAnalysisResult, $rootScope.manualMeasures);
        }).catch(function() {
            $rootScope.bodyAnalysisError = 'Não consegui analisar as fotos agora. Tente novamente.';
            $rootScope.bodyAnalysisLoading = false;
        });
    };

    $rootScope.analyzeBioReport = function() {
        if (!$rootScope.bioReportPhoto) return;
        var AiService = angular.element(document.body).injector().get('AiService');
        $rootScope.bodyAnalysisLoading = true;
        $rootScope.bodyAnalysisResult = null;

        AiService.analyzeBioReport($rootScope.bioReportPhoto).then(function(parsed) {
            $rootScope.bodyAnalysisResult = parsed.feedback || JSON.stringify(parsed);
            if (parsed.measures) {
                Object.keys(parsed.measures).forEach(function(k) {
                    if (parsed.measures[k] != null) $rootScope.manualMeasures[k] = parsed.measures[k];
                });
            }
            $rootScope.bodyAnalysisLoading = false;
            localStorage.setItem('fitness_body_analysis', $rootScope.bodyAnalysisResult);
            $rootScope.latestBodyAnalysis = $rootScope.bodyAnalysisResult;
            $rootScope._saveAnalysisLog('bio_report', $rootScope.bodyAnalysisResult, $rootScope.manualMeasures);
        }).catch(function() {
            $rootScope.bodyAnalysisError = 'Não consegui ler o laudo. Tente com foto mais nítida.';
            $rootScope.bodyAnalysisLoading = false;
        });
    };

    // Challenge90 join from anywhere
    $rootScope.joinChallenge90 = function() {
        var ApiService = angular.element(document.body).injector().get('ApiService');
        var now = new Date();
        var end = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        $rootScope.challenge90 = {
            active: true,
            startDate: now.toISOString(),
            endDate: end.toISOString(),
            currentDay: 1,
            nextCheckpoint: 30,
            checkpoints: [
                { day: 1, done: false, current: true },
                { day: 30, done: false, current: false },
                { day: 60, done: false, current: false },
                { day: 90, done: false, current: false }
            ],
            photos: {}
        };
        localStorage.setItem('fitness_challenge90', JSON.stringify($rootScope.challenge90));
        $rootScope.showChallengeOffer = false;
        ApiService.logAction('daily_challenge', { type: '90_day_challenge', action: 'join' });
        $location.path('/challenge90');
    };

    // Init: auto-login if token exists
    if (AuthService.isLoggedIn()) {
        AuthService.loadPlayer().then(function(player) {
            // Check onboarding
            var userId = AuthService.getUser();
            var ApiService = angular.element(document.body).injector().get('ApiService');
            ApiService.loadProfile(userId).then(function(res) {
                if (res.data && res.data._id) {
                    $rootScope.profileData = res.data;
                    var cachedMeal = localStorage.getItem('fitness_mealplan');
                    var cachedWorkout = localStorage.getItem('fitness_workoutplan');
                    if (cachedMeal && cachedWorkout) {
                        if ($location.path() === '/landing' || $location.path() === '/') {
                            $location.path('/dashboard');
                        }
                    } else {
                        $location.path('/onboarding');
                    }
                } else {
                    $location.path('/onboarding');
                }
            }).catch(function() {
                $location.path('/onboarding');
            });
        }).catch(function() {
            $location.path('/login');
        });
    }
});
