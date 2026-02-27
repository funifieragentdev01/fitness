angular.module('fitness').controller('BodyCheckinCtrl', function($scope, $rootScope, AuthService, ApiService) {
    $scope.checkin = {};
    $scope.weightHistory = [];
    $scope.checkinHistory = [];

    var userId = AuthService.getUser();

    function loadHistory() {
        if (!userId) return;
        ApiService.loadWeightHistory(userId).then(function(res) {
            if (Array.isArray(res.data)) {
                $scope.checkinHistory = res.data.map(function(w) {
                    return {
                        date: new Date(w.created).toLocaleDateString('pt-BR'),
                        weight: w.weight,
                        photo_front_url: w.photo_front_url || '',
                        photo_side_url: w.photo_side_url || ''
                    };
                });
                $scope.weightHistory = $scope.checkinHistory;
            }
        }).catch(function() { $scope.checkinHistory = []; $scope.weightHistory = []; });
    }

    loadHistory();

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

        var uploadPromises = [];
        var photoUrls = { front: '', side: '' };

        if ($scope.checkin.photo_front) {
            uploadPromises.push(
                ApiService.uploadImage($scope.checkin.photo_front, 'checkin-front-' + Date.now() + '.jpg')
                    .then(function(res) {
                        if (res.data && res.data.uploads && res.data.uploads[0]) {
                            photoUrls.front = res.data.uploads[0].url;
                        }
                    })
            );
        }
        if ($scope.checkin.photo_side) {
            uploadPromises.push(
                ApiService.uploadImage($scope.checkin.photo_side, 'checkin-side-' + Date.now() + '.jpg')
                    .then(function(res) {
                        if (res.data && res.data.uploads && res.data.uploads[0]) {
                            photoUrls.side = res.data.uploads[0].url;
                        }
                    })
            );
        }

        (uploadPromises.length ? Promise.all(uploadPromises) : Promise.resolve())
            .then(function() {
                var data = {
                    userId: userId,
                    weight: parseFloat($scope.checkin.weight),
                    photo_front_url: photoUrls.front,
                    photo_side_url: photoUrls.side,
                    created: new Date().toISOString()
                };
                return ApiService.saveCheckin(data);
            })
            .then(function() {
                $scope.$apply(function() {
                    ApiService.logAction('body_checkin', { weight: parseFloat($scope.checkin.weight) });
                    ApiService.logAction('update_weight', { weight: parseFloat($scope.checkin.weight) });
                    if ($rootScope.profileData) {
                        $rootScope.profileData.weight = parseFloat($scope.checkin.weight);
                        var profileUpdate = angular.copy($rootScope.profileData);
                        profileUpdate._id = userId;
                        ApiService.saveProfile(profileUpdate);
                    }

                    if ($rootScope.challenge90 && $rootScope.challenge90.active) {
                        var ch = $rootScope.challenge90;
                        if (ch.checkpoints) {
                            for (var i = 0; i < ch.checkpoints.length; i++) {
                                if (ch.checkpoints[i].current && !ch.checkpoints[i].done) {
                                    ch.checkpoints[i].done = true;
                                    ch.checkpoints[i].photos = { front: photoUrls.front, side: photoUrls.side };
                                    if (i + 1 < ch.checkpoints.length) ch.checkpoints[i + 1].current = true;
                                    break;
                                }
                            }
                        }
                        localStorage.setItem('fitness_challenge90', JSON.stringify(ch));
                    }

                    $scope.success = '✅ Check-in registrado com sucesso!';
                    if ($scope.checkin.photo_front || $scope.checkin.photo_side) {
                        $rootScope.analyzeBodyPhotos($scope.checkin.photo_front, $scope.checkin.photo_side);
                    }
                    $scope.checkin = {};
                    $scope.loading = false;
                    loadHistory();
                });
            })
            .catch(function(err) {
                $scope.$apply(function() {
                    $scope.success = '✅ Check-in salvo (fotos podem não ter sido enviadas).';
                    $scope.checkin = {};
                    $scope.loading = false;
                });
            });
    };
});
