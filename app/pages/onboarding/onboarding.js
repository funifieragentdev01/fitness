angular.module('fitness').controller('OnboardingCtrl', function($scope, $rootScope, $location, $timeout, $interval, AuthService, ApiService, AiService) {
    $scope.onboardingStep = 1;
    $scope.onboardingTotalSteps = 9;
    $scope.onboarding = {
        sex: '', restrictions: [], budget: 'medium', equipment: 'none',
        activity_level: 'leve', training_days: [], training_time: '07:00',
        meal_routine: getDefaultMealRoutine()
    };
    $scope.aiGoal = null;
    $scope.goalLoading = false;
    $scope.goalForm = { feedback: '' };
    $scope.generatingMessage = '';
    $scope.generatingProgress = 0;

    $scope.weekDays = [
        { id: 'seg', short: 'Seg', name: 'Segunda' },
        { id: 'ter', short: 'Ter', name: 'Terça' },
        { id: 'qua', short: 'Qua', name: 'Quarta' },
        { id: 'qui', short: 'Qui', name: 'Quinta' },
        { id: 'sex', short: 'Sex', name: 'Sexta' },
        { id: 'sab', short: 'Sáb', name: 'Sábado' },
        { id: 'dom', short: 'Dom', name: 'Domingo' }
    ];

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

    // Check if we have existing profile and should resume
    if ($rootScope.profileData && !localStorage.getItem('fitness_mealplan')) {
        $scope.onboarding = buildOnboardingFromProfile($rootScope.profileData);
        $scope.onboardingStep = 1;
        startGeneratingPlans();
    }

    function buildOnboardingFromProfile(p) {
        return {
            sex: p.sex || 'M', age: p.age, height: p.height, weight: p.weight,
            goal: p.goal, restrictions: p.restrictions || [], budget: p.budget || 'medium',
            equipment: p.equipment || 'none', training_days: p.training_days || [],
            training_time: p.training_time || '', meal_routine: p.meal_routine || getDefaultMealRoutine(),
            activity_level: p.activity_level || 'leve'
        };
    }

    function formatTime(timeObj) {
        if (typeof timeObj === 'string') return timeObj;
        if (timeObj instanceof Date) {
            return timeObj.getHours().toString().padStart(2, '0') + ':' + timeObj.getMinutes().toString().padStart(2, '0');
        }
        return '12:00';
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
        if ($scope.canAdvanceOnboarding() && $scope.onboardingStep < 8) $scope.onboardingStep++;
    };
    $scope.prevOnboardingStep = function() {
        if ($scope.onboardingStep > 1) $scope.onboardingStep--;
    };
    $scope.goToOnboardingStep = function(step) { $scope.onboardingStep = step; };

    // Photo uploads
    $scope.triggerSpacePhoto = function() { document.getElementById('spacePhotoInput').click(); };
    $scope.onSpacePhoto = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) { $scope.$apply(function() { $scope.onboarding.space_photo = e.target.result; }); };
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

    // Inline body analysis (no modal)
    $scope.onboardingAnalyzing = false;
    $scope.onboardingAnalysisResult = null;
    $scope.analyzeOnboardingPhotos = function() {
        $scope.onboardingAnalyzing = true;
        var p = { weight: $scope.onboarding.weight, height: $scope.onboarding.height, sex: $scope.onboarding.sex, age: $scope.onboarding.age };
        AiService.analyzeBodyPhotos($scope.onboarding.body_photo_front, $scope.onboarding.body_photo_side, p).then(function(parsed) {
            $scope.onboardingAnalysisResult = parsed.feedback || JSON.stringify(parsed);
            $scope.onboardingAnalyzing = false;
        }).catch(function() {
            $scope.onboardingAnalysisResult = 'Não consegui analisar as fotos agora. Continue e analise depois no perfil.';
            $scope.onboardingAnalyzing = false;
        });
    };

    // AI Goal
    $scope.generateAIGoal = function() {
        $scope.goalLoading = true;
        $scope.onboardingStep = 7;
        AiService.generateAIGoal($scope.onboarding).then(function(goal) {
            $scope.aiGoal = goal;
            $scope.goalLoading = false;
        }).catch(function() {
            $scope.aiGoal = { summary: 'Com base nos seus dados, recomendo uma abordagem gradual e consistente.', tip: 'Consistência é mais importante que intensidade!' };
            $scope.goalLoading = false;
        });
    };

    $scope.adjustGoal = function() {
        if (!$scope.goalForm.feedback) return;
        $scope.goalLoading = true;
        AiService.adjustGoal($scope.aiGoal, $scope.goalForm.feedback, $scope.onboarding).then(function(goal) {
            $scope.aiGoal = goal;
            $scope.goalLoading = false;
            $scope.goalForm.feedback = '';
        }).catch(function() { $scope.goalLoading = false; });
    };

    // Plan generation
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

        var userId = AuthService.getUser();
        var data = angular.copy($scope.onboarding);
        data._id = userId;
        data.created = ApiService.bsonDate();
        var mealTimes = data.meal_routine.filter(function(m) { return m.enabled; }).map(function(m) {
            return { id: m.id, label: m.label, time: (typeof m.time === 'object' && m.time) ? formatTime(m.time) : m.time };
        });
        data.meal_times = mealTimes;
        delete data.body_photo_front;
        delete data.body_photo_side;
        delete data.space_photo;

        ApiService.saveProfile(data).then(function() { $rootScope.profileData = data; }).catch(function() {});

        var mealDone = false, workoutDone = false;
        function checkDone() {
            if (mealDone && workoutDone) {
                $interval.cancel(msgInterval);
                $interval.cancel(progressInterval);
                $scope.generatingProgress = 100;
                $timeout(function() { $scope.onboardingStep = 9; }, 800);
            }
        }

        function createFallbackMealPlan(mealTimes) {
            var meals = (mealTimes || []).map(function(m) {
                return { time: m.time || '12:00', name: m.label || 'Refeição', description: 'Plano será gerado em breve', foods: [{ food: 'Alimento', quantity: '1 porção', calories: 200 }], total_calories: 200 };
            });
            return { meals: meals, total_calories: meals.length * 200, date: new Date().toLocaleDateString('pt-BR'), timestamp: new Date().toISOString() };
        }

        function createFallbackWorkoutPlan(trainingDays) {
            var wkDays = [
                { id: 'seg', name: 'Segunda' }, { id: 'ter', name: 'Terça' }, { id: 'qua', name: 'Quarta' },
                { id: 'qui', name: 'Quinta' }, { id: 'sex', name: 'Sexta' }, { id: 'sab', name: 'Sábado' }, { id: 'dom', name: 'Domingo' }
            ];
            var days = wkDays.map(function(d) {
                var isTraining = (trainingDays || []).indexOf(d.id) > -1;
                return { day_name: d.name, muscle_group: isTraining ? 'Treino geral' : null, exercises: isTraining ? [{ name: 'Exercício', sets: 3, reps: '12', weight_suggestion: '' }] : [], duration_minutes: isTraining ? 45 : 0 };
            });
            return { days: days, date: new Date().toLocaleDateString('pt-BR'), timestamp: new Date().toISOString() };
        }

        AiService.generateMealPlan(data).then(function(plan) {
            $rootScope.mealPlan = plan;
            localStorage.setItem('fitness_mealplan', JSON.stringify(plan));
            mealDone = true; checkDone();
        }).catch(function() {
            $rootScope.mealPlan = createFallbackMealPlan(mealTimes);
            localStorage.setItem('fitness_mealplan', JSON.stringify($rootScope.mealPlan));
            mealDone = true; checkDone();
        });

        AiService.generateWorkoutPlan(data).then(function(plan) {
            $rootScope.workoutPlan = plan;
            localStorage.setItem('fitness_workoutplan', JSON.stringify(plan));
            workoutDone = true; checkDone();
        }).catch(function() {
            $rootScope.workoutPlan = createFallbackWorkoutPlan(data.training_days);
            localStorage.setItem('fitness_workoutplan', JSON.stringify($rootScope.workoutPlan));
            workoutDone = true; checkDone();
        });
    }
    $scope.startGeneratingPlans = startGeneratingPlans;

    $scope.completeOnboarding = function() {
        ApiService.logAction('complete_onboarding', { goal: ($rootScope.profileData || {}).goal });
        $location.path('/dashboard');
    };

    // 90-Day Challenge from onboarding
    $scope.joinChallenge90FromOnboarding = function() {
        $rootScope.challenge90 = {
            active: true,
            startDate: new Date().toISOString(),
            day: 0,
            photos: { day0_front: $scope.onboarding.body_photo_front || null, day0_side: $scope.onboarding.body_photo_side || null }
        };
        localStorage.setItem('fitness_challenge90', JSON.stringify($rootScope.challenge90));
        ApiService.logAction('daily_challenge', { type: '90_day_challenge', action: 'join' });
        $scope.completeOnboarding();
    };
});
