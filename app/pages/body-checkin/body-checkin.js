angular.module('fitness').controller('BodyCheckinCtrl', function($scope, $rootScope, $sce, AuthService, ApiService, AiService) {
    $scope.checkin = {};
    $scope.checkinHistory = [];
    $scope.step = 1;
    $scope.analyzing = false;
    $scope.analyzingLaudo = false;
    $scope.analysisResult = null;
    $scope.laudoResult = null;
    $scope.bioReportPhoto = null;
    $scope.manualMeasures = $rootScope.manualMeasures || {};

    var userId = AuthService.getUser();

    function loadHistory() {
        if (!userId) return;
        ApiService.loadWeightHistory(userId).then(function(res) {
            if (Array.isArray(res.data)) {
                $scope.checkinHistory = res.data.map(function(w) {
                    return {
                        date: ApiService.readDate(w.created).toLocaleDateString('pt-BR'),
                        weight: w.weight,
                        photo_front_url: w.photo_front_url || '',
                        photo_side_url: w.photo_side_url || ''
                    };
                });
            }
        }).catch(function() { $scope.checkinHistory = []; });
    }
    loadHistory();

    $scope.handleBack = function() {
        if ($scope.step === 2) { $scope.step = 1; }
        else if ($scope.step === 3) { $scope.step = 2; }
        else { $scope.goTo('profile'); }
    };

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

    $scope.triggerBioReport = function() { document.getElementById('bioReportInputCheckin').click(); };

    $scope.onBioReport = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() { $scope.bioReportPhoto = e.target.result; $scope.laudoResult = null; });
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    // Step 1 → Step 2: Analyze photos then advance
    $scope.analyzeAndAdvance = function() {
        if (!$scope.checkin.weight) return;
        $scope.analyzing = true;

        var p = $rootScope.profileData || {};
        if (p.weight && !$scope.manualMeasures.peso) $scope.manualMeasures.peso = parseFloat(p.weight);
        if (p.height && !$scope.manualMeasures.altura) $scope.manualMeasures.altura = parseFloat(p.height) / 100;
        $scope.manualMeasures.peso = parseFloat($scope.checkin.weight);

        AiService.analyzeBodyPhotos($scope.checkin.photo_front, $scope.checkin.photo_side, p).then(function(parsed) {
            $scope.analysisResult = parsed.feedback || JSON.stringify(parsed);
            if (parsed.measures) {
                Object.keys(parsed.measures).forEach(function(k) {
                    if (parsed.measures[k] != null) $scope.manualMeasures[k] = parsed.measures[k];
                });
            }
            $scope.analyzing = false;
            $scope.step = 2;
        }).catch(function() {
            $scope.analysisResult = 'Não consegui analisar as fotos agora. Você pode salvar o check-in mesmo assim.';
            $scope.analyzing = false;
            $scope.step = 2;
        });
    };

    // Step 1: Save without analysis
    $scope.saveCheckinOnly = function() {
        doSaveCheckin();
    };

    // Step 2/3: Save with analysis
    $scope.saveCheckinWithAnalysis = function() {
        // Save measures
        localStorage.setItem('fitness_measures', JSON.stringify($scope.manualMeasures));
        $rootScope.manualMeasures = $scope.manualMeasures;
        if ($scope.analysisResult) {
            localStorage.setItem('fitness_body_analysis', $scope.analysisResult);
            $rootScope.latestBodyAnalysis = $scope.analysisResult;
        }
        doSaveCheckin();
    };

    function doSaveCheckin() {
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
                    created: ApiService.bsonDate()
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

                    // Update challenge90 checkpoints
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

                    $scope.step = 'done';
                    $scope.loading = false;
                    loadHistory();
                });
            })
            .catch(function() {
                $scope.$apply(function() {
                    $scope.step = 'done';
                    $scope.loading = false;
                });
            });
    }

    // Analyze bio report (step 3)
    $scope.analyzeBioReport = function() {
        if (!$scope.bioReportPhoto) return;
        $scope.analyzingLaudo = true;
        $scope.laudoResult = null;

        AiService.analyzeBioReport($scope.bioReportPhoto).then(function(parsed) {
            $scope.laudoResult = parsed.feedback || JSON.stringify(parsed);
            if (parsed.measures) {
                Object.keys(parsed.measures).forEach(function(k) {
                    if (parsed.measures[k] != null) $scope.manualMeasures[k] = parsed.measures[k];
                });
            }
            $scope.analyzingLaudo = false;
        }).catch(function() {
            $scope.laudoResult = 'Não consegui ler o laudo. Tente com foto mais nítida.';
            $scope.analyzingLaudo = false;
        });
    };

    $scope.startNew = function() {
        $scope.checkin = {};
        $scope.step = 1;
        $scope.analysisResult = null;
        $scope.laudoResult = null;
        $scope.bioReportPhoto = null;
    };

    $scope.formatAnalysis = function(text) {
        return $rootScope.formatAnalysis(text);
    };
});
