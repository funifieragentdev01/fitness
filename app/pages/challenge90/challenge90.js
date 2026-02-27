angular.module('fitness').controller('Challenge90Ctrl', function($scope, $rootScope, $location, AuthService, ApiService) {
    $scope.weightHistory = [];
    $scope.testimonial = {};
    $scope.firstPhoto = '';
    $scope.lastPhoto = '';

    var userId = AuthService.getUser();

    // Calculate current day
    if ($rootScope.challenge90 && $rootScope.challenge90.startDate) {
        var start = new Date($rootScope.challenge90.startDate);
        var now = new Date();
        var diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
        $rootScope.challenge90.currentDay = Math.min(diffDays, 90);

        if ($rootScope.challenge90.checkpoints) {
            $rootScope.challenge90.checkpoints.forEach(function(cp, idx) {
                cp.current = false;
                if (!cp.done && diffDays >= cp.day) {
                    var prevAllDone = true;
                    for (var i = 0; i < idx; i++) {
                        if (!$rootScope.challenge90.checkpoints[i].done) prevAllDone = false;
                    }
                    if (prevAllDone) cp.current = true;
                }
            });
        }
        localStorage.setItem('fitness_challenge90', JSON.stringify($rootScope.challenge90));
    }

    // Extract first and last photos from checkpoints
    if ($rootScope.challenge90 && $rootScope.challenge90.checkpoints) {
        var cps = $rootScope.challenge90.checkpoints;
        for (var i = 0; i < cps.length; i++) {
            if (cps[i].photos && cps[i].photos.front) {
                if (!$scope.firstPhoto) $scope.firstPhoto = cps[i].photos.front;
                $scope.lastPhoto = cps[i].photos.front;
            }
        }
    }

    // Also try loading from check-in history if no checkpoint photos
    if (!$scope.firstPhoto && userId) {
        ApiService.loadWeightHistory(userId).then(function(res) {
            if (Array.isArray(res.data) && res.data.length) {
                // Sort by date ascending
                var sorted = res.data.filter(function(w) { return w.photo_front_url; })
                    .sort(function(a, b) {
                        var da = a.created && a.created.$date ? new Date(a.created.$date) : new Date(a.created);
                        var db = b.created && b.created.$date ? new Date(b.created.$date) : new Date(b.created);
                        return da - db;
                    });
                if (sorted.length) {
                    $scope.firstPhoto = $scope.firstPhoto || sorted[0].photo_front_url;
                    $scope.lastPhoto = sorted[sorted.length - 1].photo_front_url;
                }
            }
        });
    }

    $scope.goToCheckin = function(checkpointDay) {
        // Find current checkpoint day if not specified
        if (!checkpointDay && $rootScope.challenge90 && $rootScope.challenge90.checkpoints) {
            for (var i = 0; i < $rootScope.challenge90.checkpoints.length; i++) {
                if ($rootScope.challenge90.checkpoints[i].current && !$rootScope.challenge90.checkpoints[i].done) {
                    checkpointDay = $rootScope.challenge90.checkpoints[i].day;
                    break;
                }
            }
        }
        $location.path('/body-checkin').search({ from: 'challenge90', checkpoint: checkpointDay || 1 });
    };

    $scope.formatDate = function(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    ApiService.loadWeightHistory(userId).then(function(res) {
        if (Array.isArray(res.data)) {
            $scope.weightHistory = res.data.map(function(w) {
                return { date: ApiService.readDate(w.created).toLocaleDateString('pt-BR'), weight: w.weight };
            });
        }
    }).catch(function() {});

    $scope.shareChallenge = function() {
        var text = '🏆 Estou no Desafio 90 Dias do CoachFit AI! Dia ' + ($rootScope.challenge90.currentDay || 1) + '/90. Bora evoluir juntos? 💪';
        if (navigator.share) {
            navigator.share({ title: 'Desafio 90 Dias', text: text });
        } else {
            prompt('Copie e compartilhe:', text);
        }
    };

    $scope.submitTestimonial = function() {
        if (!$scope.testimonial.text || !$scope.testimonial.rating) return;
        var data = {
            userId: userId,
            userName: ($rootScope.player && $rootScope.player.name) ? $rootScope.player.name.split(' ')[0] : 'Usuário',
            userPhoto: ($rootScope.profileData && $rootScope.profileData.photo_url) ? $rootScope.profileData.photo_url : '',
            rating: $scope.testimonial.rating,
            text: $scope.testimonial.text,
            publishOnHome: $scope.testimonial.publishOnHome || false,
            firstPhoto: $scope.firstPhoto,
            lastPhoto: $scope.lastPhoto,
            created: ApiService.bsonDate()
        };
        $scope.savingTestimonial = true;
        ApiService.saveTestimonial(data).then(function() {
            $scope.testimonialSaved = true;
        }).catch(function() {
            $scope.savingTestimonial = false;
            alert('Erro ao enviar. Tente novamente.');
        });
    };

    $scope.quitChallenge90 = function() {
        if (!confirm('Tem certeza que quer desistir do desafio?')) return;
        $rootScope.challenge90 = null;
        localStorage.removeItem('fitness_challenge90');
        $location.path('/dashboard');
    };
});
