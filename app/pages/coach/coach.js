angular.module('fitness').controller('CoachCtrl', function($scope, $rootScope, $timeout, AiService, ApiService) {
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
        if (!$scope.chat.input || $scope.chatLoading) return;
        var msg = $scope.chat.input;
        $scope.chatMessages.push({ role: 'user', content: msg });
        $scope.chat.input = '';
        $scope.chatLoading = true;

        var profileInfo = '';
        if ($rootScope.profileData) {
            profileInfo = ' Perfil: ' + $rootScope.profileData.age + ' anos, ' + $rootScope.profileData.height + 'cm, ' +
                $rootScope.profileData.weight + 'kg, objetivo: ' + ($rootScope.profileData.goal || '') +
                ', equipamento: ' + ($rootScope.profileData.equipment || '') + '.';
        }

        var systemPrompt = 'Você é o FitEvolve Coach, um coach de nutrição e treino brasileiro. ' +
            'O jogador se chama ' + ($rootScope.player.name || 'amigo') + '. ' +
            'Nível atual: ' + ($rootScope.playerLevel.level || 'Iniciante') + '. XP: ' + ($rootScope.playerPoints.xp || 0) + '.' +
            profileInfo +
            ' Responda de forma breve, motivadora e prática. Use linguagem coloquial brasileira e emojis. ' +
            'Se perguntarem sobre comida, considere a realidade brasileira (arroz, feijão, etc). ' +
            'Máximo 150 palavras por resposta.';

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
