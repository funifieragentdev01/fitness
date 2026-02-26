angular.module('fitness').controller('BodyCheckinCtrl', function($scope, $rootScope, AuthService, ApiService) {
    $scope.checkin = {};
    $scope.weightHistory = [];

    var userId = AuthService.getUser();

    function loadWeightHistory() {
        if (!userId) return;
        ApiService.loadWeightHistory(userId).then(function(res) {
            if (Array.isArray(res.data)) {
                $scope.weightHistory = res.data.map(function(w) {
                    return { date: new Date(w.created).toLocaleDateString('pt-BR'), weight: w.weight };
                });
            }
        }).catch(function() { $scope.weightHistory = []; });
    }

    loadWeightHistory();

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
        $rootScope.loading = true;
        var data = {
            userId: userId,
            weight: parseFloat($scope.checkin.weight),
            photo_front: $scope.checkin.photo_front ? 'uploaded' : '',
            photo_side: $scope.checkin.photo_side ? 'uploaded' : '',
            created: new Date().toISOString()
        };

        ApiService.saveCheckin(data).then(function() {
            ApiService.logAction('body_checkin', { weight: data.weight });
            ApiService.logAction('update_weight', { weight: data.weight });
            if ($rootScope.profileData) {
                $rootScope.profileData.weight = data.weight;
                var profileUpdate = angular.copy($rootScope.profileData);
                profileUpdate._id = userId;
                ApiService.saveProfile(profileUpdate);
            }
            $rootScope.success = '✅ Check-in registrado! +10 XP';
            if ($scope.checkin.photo_front || $scope.checkin.photo_side) {
                $rootScope.analyzeBodyPhotos($scope.checkin.photo_front, $scope.checkin.photo_side);
            }
            $scope.checkin = {};
            $rootScope.loading = false;
            loadWeightHistory();
        }).catch(function() {
            $rootScope.success = '✅ Check-in salvo!';
            $scope.checkin = {};
            $rootScope.loading = false;
        });
    };
});
