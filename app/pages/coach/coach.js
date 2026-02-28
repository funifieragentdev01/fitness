angular.module('fitness').controller('CoachCtrl', function($scope, $rootScope, $timeout, AiService, ApiService, PlanService) {
    $scope.coachLocked = !PlanService.canAccessCoach();

    if ($scope.coachLocked) {
        $rootScope.openUpgrade('O Coach é exclusivo do plano Premium. Faça upgrade para ter seu coach personalizado!');
    }

    $scope.chatMessages = [
        { role: 'assistant', content: 'E aí! Sou seu coach de nutrição e treino. Como posso te ajudar hoje? 🏔️' }
    ];
    $scope.chat = { input: '' };
    $scope.chatLoading = false;

    $timeout(function() {
        var el = document.getElementById('chatMessages');
        if (el) el.scrollTop = el.scrollHeight;
    }, 100);

    $scope.sendChat = function() {
        if ($scope.coachLocked) {
            $rootScope.openUpgrade('O Coach é exclusivo do plano Premium. Faça upgrade para ter seu coach personalizado!');
            return;
        }
        if (!$scope.chat.input || $scope.chatLoading) return;
        var msg = $scope.chat.input;
        $scope.chatMessages.push({ role: 'user', content: msg });
        $scope.chat.input = '';
        $scope.chatLoading = true;

        var profileInfo = '';
        if ($rootScope.profileData) {
            var p = $rootScope.profileData;
            profileInfo = ' Perfil: ' + p.age + ' anos, ' + p.height + 'cm, ' +
                p.weight + 'kg, objetivo: ' + (p.goal || '') +
                ', equipamento: ' + (p.equipment || '') +
                ', dias de treino: ' + ((p.training_days || []).join(', ') || 'não informado') +
                ', horário: ' + (p.training_time || 'não informado') + '.';
        }

        var mealInfo = '';
        var cachedMeal = localStorage.getItem('fitness_mealplan');
        if (cachedMeal) {
            try {
                var mp = JSON.parse(cachedMeal);
                if (mp.meals) {
                    mealInfo = '\n\nPLANO ALIMENTAR ATUAL DO PACIENTE (' + (mp.total_calories || '?') + ' kcal/dia):\n';
                    mp.meals.forEach(function(m) {
                        mealInfo += m.time + ' - ' + m.name + ': ' + (m.foods || []).map(function(f) { return f.food + ' (' + f.quantity + ')'; }).join(', ') + ' [' + (m.total_calories || '?') + ' kcal]\n';
                    });
                }
            } catch(e) {}
        }

        var workoutInfo = '';
        var cachedWorkout = localStorage.getItem('fitness_workoutplan');
        if (cachedWorkout) {
            try {
                var wp = JSON.parse(cachedWorkout);
                if (wp.days) {
                    workoutInfo = '\nPLANO DE TREINO ATUAL DO PACIENTE:\n';
                    wp.days.forEach(function(d) {
                        if (d.muscle_group) {
                            workoutInfo += d.day_name + ' - ' + d.muscle_group + ': ' + (d.exercises || []).map(function(e) { return e.name + ' ' + e.sets + 'x' + e.reps; }).join(', ') + '\n';
                        } else {
                            workoutInfo += d.day_name + ' - Descanso\n';
                        }
                    });
                }
            } catch(e) {}
        }

        var systemPrompt = 'Você é o Coach, um coach de nutrição e treino brasileiro. ' +
            'O jogador se chama ' + ($rootScope.player.name || 'amigo') + '. ' +
            'Nível atual: ' + ($rootScope.playerLevel.level || 'Iniciante') + '. XP: ' + ($rootScope.playerPoints.xp || 0) + '.' +
            profileInfo + mealInfo + workoutInfo +
            '\nResponda de forma breve, motivadora e prática. Use linguagem coloquial brasileira e emojis. ' +
            'Quando o paciente perguntar sobre sua dieta ou treino, responda com base nos dados acima. ' +
            'Se perguntarem sobre comida, considere a realidade brasileira (arroz, feijão, etc). ' +
            'Máximo 200 palavras por resposta.';

        var messages = [{ role: 'system', content: systemPrompt }];
        $scope.chatMessages.forEach(function(m) {
            messages.push({ role: m.role, content: m.content });
        });

        AiService.sendChat(messages).then(function(reply) {
            $scope.chatMessages.push({ role: 'assistant', content: reply });
            $scope.chatLoading = false;
            ApiService.logAction('interact_coach', { message: msg.substring(0, 100) });
            $timeout(function() {
                var el = document.getElementById('chatMessages');
                if (el) el.scrollTop = el.scrollHeight;
            }, 100);
        }).catch(function() {
            $scope.chatMessages.push({ role: 'assistant', content: 'Desculpa, tô com dificuldade agora. Tenta de novo! 🏔️' });
            $scope.chatLoading = false;
        });
    };
});
