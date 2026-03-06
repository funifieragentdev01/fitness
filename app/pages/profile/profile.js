angular.module('fitness').controller('ProfileCtrl', function($scope, $rootScope, $http, $location, AuthService, ApiService, PlanService, NotificationService, DataSyncService) {
    var userId = AuthService.getUser();
    // Load profile photo from player.image or profile__c.photo_url
    $scope.profilePhoto = ($rootScope.player && $rootScope.player.image && $rootScope.player.image.original) 
        ? $rootScope.player.image.original.url : null;
    $scope.aiGoal = null;
    $scope.isPremium = PlanService.isPremium();

    // Refresh player data to ensure plan is up-to-date
    AuthService.loadPlayer().then(function() {
        $scope.isPremium = PlanService.isPremium();
    });

    $scope.latestLaudoAnalysis = null;
    $scope.consolidatedMeasures = null;

    var MEASURE_LABELS = {
        peso: 'Peso', altura: 'Altura', imc: 'IMC', gordura_pct: 'Gordura corporal',
        peso_gordo: 'Massa gorda', peso_magro: 'Massa magra', massa_muscular: 'Massa muscular',
        massa_ossea: 'Massa óssea', agua_corporal_pct: 'Água corporal', taxa_metabolica_basal: 'Taxa metabólica basal',
        idade_metabolica: 'Idade metabólica', gordura_visceral: 'Gordura visceral',
        cintura: 'Cintura', quadril: 'Quadril', abdomen: 'Abdômen', coxas: 'Coxas',
        panturrilhas: 'Panturrilhas', braco_relaxado: 'Braço relaxado', braco_contraido: 'Braço contraído',
        deltoides: 'Deltoides', torax: 'Tórax', antebraco: 'Antebraço', pescoco: 'Pescoço',
        dobra_subescapular: 'Dobra subescapular', dobra_tricipital: 'Dobra tricipital',
        dobra_toracica: 'Dobra torácica', dobra_axilar: 'Dobra axilar',
        dobra_suprailiaca: 'Dobra suprailíaca', dobra_abdominal: 'Dobra abdominal',
        dobra_coxas: 'Dobra coxas', dobra_panturrilhas: 'Dobra panturrilhas',
        testosterona: 'Testosterona', colesterol_total: 'Colesterol total',
        hdl: 'HDL', ldl: 'LDL', triglicerides: 'Triglicérides',
        glicemia: 'Glicemia', hemoglobina: 'Hemoglobina'
    };
    var MEASURE_UNITS = {
        peso: 'kg', altura: 'cm', gordura_pct: '%', peso_gordo: 'kg', peso_magro: 'kg',
        massa_muscular: 'kg', massa_ossea: 'kg', agua_corporal_pct: '%',
        taxa_metabolica_basal: 'kcal', gordura_visceral: '',
        cintura: 'cm', quadril: 'cm', abdomen: 'cm', coxas: 'cm', panturrilhas: 'cm',
        braco_relaxado: 'cm', braco_contraido: 'cm', deltoides: 'cm', torax: 'cm',
        antebraco: 'cm', pescoco: 'cm',
        dobra_subescapular: 'mm', dobra_tricipital: 'mm', dobra_toracica: 'mm',
        dobra_axilar: 'mm', dobra_suprailiaca: 'mm', dobra_abdominal: 'mm',
        dobra_coxas: 'mm', dobra_panturrilhas: 'mm',
        testosterona: 'ng/dL', colesterol_total: 'mg/dL', hdl: 'mg/dL', ldl: 'mg/dL',
        triglicerides: 'mg/dL', glicemia: 'mg/dL', hemoglobina: 'g/dL'
    };

    $scope.measureLabel = function(key) { return MEASURE_LABELS[key] || key; };
    $scope.measureUnit = function(key) { return MEASURE_UNITS[key] || ''; };
    $scope.hasMeasures = function() {
        if (!$scope.consolidatedMeasures) return false;
        return Object.keys($scope.consolidatedMeasures).some(function(k) {
            return $scope.consolidatedMeasures[k] != null && $scope.consolidatedMeasures[k] !== '';
        });
    };

    function loadProfileData() {
        if (!userId) return;
        console.log('[Profile] Loading data for userId:', userId);
        ApiService.loadProfile(userId).then(function(res) {
            console.log('[Profile] profile__c response:', res.data ? Object.keys(res.data) : 'null');
            console.log('[Profile] body_analysis in DB:', !!(res.data && res.data.body_analysis));
            console.log('[Profile] laudo_analysis in DB:', !!(res.data && res.data.laudo_analysis));
            if (res.data && res.data._id) {
                $rootScope.profileData = res.data;
                // Always use DB data only — never fall back to localStorage (prevents cross-user leak)
                $rootScope.latestBodyAnalysis = res.data.body_analysis || null;
                $scope.latestLaudoAnalysis = res.data.laudo_analysis || null;
                $scope.consolidatedMeasures = res.data.measures || null;
                $scope.profilePhoto = res.data.photo_url || null;
                $scope.aiGoal = res.data.ai_goal || res.data.aiGoal || null;
            } else {
                // No profile in DB — clear everything
                $rootScope.latestBodyAnalysis = null;
                $scope.latestLaudoAnalysis = null;
                $scope.consolidatedMeasures = null;
                $scope.aiGoal = null;
            }
        }).catch(function() {});

        // Also load latest body_checkin for laudo feedback (filtered by userId)
        ApiService.loadWeightHistory(userId).then(function(res) {
            var results = Array.isArray(res.data) ? res.data : [];
            console.log('[Profile] body_checkin__c count for', userId, ':', results.length);
            if (results.length > 0) {
                console.log('[Profile] body_checkin userIds:', results.map(function(r) { return r.userId; }));
            }
            for (var i = 0; i < results.length; i++) {
                // Double-check userId matches (Funifier _filter may not enforce correctly)
                if (results[i].userId !== userId) {
                    console.warn('[Profile] Skipping checkin from wrong user:', results[i].userId);
                    continue;
                }
                if (results[i].laudo_feedback && !$scope.latestLaudoAnalysis) {
                    console.log('[Profile] Found laudo_feedback from checkin:', results[i]._id);
                    $scope.latestLaudoAnalysis = results[i].laudo_feedback;
                    break;
                }
            }
        }).catch(function() {});
    }
    loadProfileData();

    // Format training time - handle Date objects, ISO strings, and plain time strings
    $scope.formatTime = function(time) {
        if (!time) return '';
        if (typeof time === 'string') {
            // ISO date string like "1970-01-01T10:00:00.000Z"
            if (time.indexOf('T') > -1) {
                var d = new Date(time);
                return d.getUTCHours().toString().padStart(2, '0') + ':' + d.getUTCMinutes().toString().padStart(2, '0');
            }
            // Already "HH:MM" format
            if (/^\d{2}:\d{2}/.test(time)) return time.substring(0, 5);
            return time;
        }
        if (time instanceof Date) {
            return time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0');
        }
        return String(time);
    };

    // Name editing
    $scope.editingName = false;
    $scope.editName = '';
    $scope.startEditName = function() {
        $scope.editName = $rootScope.player.name || '';
        $scope.editingName = true;
    };
    $scope.saveName = function() {
        var newName = ($scope.editName || '').trim();
        if (!newName) return;
        $rootScope.player.name = newName;
        $scope.editingName = false;
        // Update player on server (include name + email + extra to not lose data)
        var API = CONFIG.API;
        $http.post(API + '/v3/player', {
            _id: userId,
            name: newName,
            email: $rootScope.player.email || userId,
            extra: $rootScope.player.extra || {}
        }, AuthService.authHeader()).then(function() {
            console.log('[Profile] Name updated to:', newName);
        }).catch(function(err) {
            console.error('[Profile] Failed to update name:', err);
        });
    };

    // Profile photo upload
    $scope.triggerProfilePhoto = function() {
        document.getElementById('profilePhotoInput').click();
    };

    $scope.onProfilePhoto = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() {
                    var dataUri = e.target.result;
                    $scope.profilePhoto = dataUri;
                    // Upload to Funifier
                    ApiService.uploadImage(dataUri, 'profile-' + userId + '-' + Date.now() + '.jpg')
                        .then(function(res) {
                            if (res.data && res.data.uploads && res.data.uploads[0]) {
                                var url = res.data.uploads[0].url;
                                $scope.profilePhoto = url;
                                // Save URL in profile__c
                                var profileUpdate = angular.copy($rootScope.profileData) || {};
                                profileUpdate._id = userId;
                                profileUpdate.photo_url = url;
                                ApiService.saveProfile(profileUpdate);
                                $rootScope.profileData.photo_url = url;
                                // Save in player.image (correct Funifier structure)
                                var imgEntry = { url: url, size: 0, width: 0, height: 0, depth: 0 };
                                var imgObj = { small: angular.copy(imgEntry), medium: angular.copy(imgEntry), original: angular.copy(imgEntry) };
                                var API = CONFIG.API;
                                $http.post(API + '/v3/player', {
                                    _id: userId,
                                    name: $rootScope.player.name || '',
                                    email: $rootScope.player.email || userId,
                                    image: imgObj,
                                    extra: $rootScope.player.extra || {}
                                }, AuthService.authHeader()).then(function() {
                                    console.log('[Profile] Photo saved to player.image');
                                }).catch(function(err) {
                                    console.error('[Profile] Failed to save photo to player:', err);
                                });
                                $rootScope.player.image = imgObj;
                            }
                        });
                });
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    // Redefine goal - navigate to onboarding step 7 (goal)
    $scope.redefineGoal = function() {
        if (!PlanService.canChange('goal')) {
            $rootScope.openUpgrade('Você já alterou sua meta este mês. Seja Premium para alterações ilimitadas!');
            return;
        }
        PlanService.recordChange('goal');
        $location.path('/onboarding').search({ step: '7' });
    };

    $scope.logout = function() {
        AuthService.logout();
        $location.path('/login');
    };

    // Notification settings
    $scope.notifSupported = NotificationService.isSupported();
    $scope.notifPermission = NotificationService.getPermission();
    // Load notification prefs (localStorage is already populated by loadFromDB on login)
    $scope.notifPrefs = NotificationService.getPreferences();

    $scope.toggleNotifications = function() {
        if ($scope.notifPrefs.enabled) {
            NotificationService.requestPermission().then(function(result) {
                $scope.notifPermission = NotificationService.getPermission();
                if ($scope.notifPermission === 'granted') {
                    NotificationService.savePreferences($scope.notifPrefs);
                    DataSyncService.syncField('fitness_notif_prefs');
                    NotificationService.showLocal('Orvya', 'Notificacoes ativadas! Vamos juntos nessa jornada.');
                } else {
                    $scope.notifPrefs.enabled = false;
                }
                $scope.$applyAsync();
            }).catch(function() {
                $scope.notifPrefs.enabled = false;
                $scope.$applyAsync();
            });
        } else {
            NotificationService.savePreferences($scope.notifPrefs);
        }
    };

    $scope.saveNotifPrefs = function() {
        // Normalize time fields to "HH:MM" strings (AngularJS input[time] may produce Date objects)
        var prefs = angular.copy($scope.notifPrefs);
        ['workoutTime', 'mealsTime', 'checkinTime'].forEach(function(key) {
            var val = prefs[key];
            if (val instanceof Date) {
                prefs[key] = val.getHours().toString().padStart(2, '0') + ':' + val.getMinutes().toString().padStart(2, '0');
            } else if (typeof val === 'string' && val.indexOf('T') > -1) {
                // ISO string like "1970-01-01T07:00:00.000Z"
                var d = new Date(val);
                prefs[key] = d.getUTCHours().toString().padStart(2, '0') + ':' + d.getUTCMinutes().toString().padStart(2, '0');
            }
        });
        $scope.notifPrefs = prefs;
        NotificationService.savePreferences(prefs);
        DataSyncService.syncField('fitness_notif_prefs');
    };

    $scope.confirmDeleteAccount = function() {
        if (!confirm('Tem certeza que deseja excluir sua conta? Todos os seus dados serão apagados permanentemente.')) return;
        if (!confirm('Esta ação não pode ser desfeita. Confirma a exclusão?')) return;
        AuthService.deleteAccount().then(function() {
            $location.path('/landing');
            alert('Conta excluída com sucesso.');
        }).catch(function() {
            alert('Erro ao excluir conta. Tente novamente.');
        });
    };
});
