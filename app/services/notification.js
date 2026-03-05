// NotificationService — Push notifications + local reminders
angular.module('fitness').factory('NotificationService', function($http, $rootScope) {
    var API = CONFIG.API;
    var API_KEY = CONFIG.API_KEY;
    var BASIC_TOKEN = CONFIG.BASIC_TOKEN;
    var PUB_URL = API + '/v3/pub/' + API_KEY;
    var VAPID_KEY = CONFIG.VAPID_PUBLIC_KEY;

    // Convert VAPID key from base64url to Uint8Array
    function urlBase64ToUint8Array(base64String) {
        var padding = '='.repeat((4 - base64String.length % 4) % 4);
        var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        var rawData = window.atob(base64);
        var outputArray = new Uint8Array(rawData.length);
        for (var i = 0; i < rawData.length; i++) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    var service = {
        // Check if push is supported
        isSupported: function() {
            return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
        },

        // Get current permission state
        getPermission: function() {
            if (!('Notification' in window)) return 'unsupported';
            return Notification.permission; // 'default', 'granted', 'denied'
        },

        // Request notification permission and subscribe to push
        requestPermission: function() {
            if (!service.isSupported()) {
                return Promise.reject('Push notifications not supported');
            }
            return Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    return service.subscribePush();
                }
                return permission;
            });
        },

        // Subscribe to web push via service worker
        subscribePush: function() {
            return navigator.serviceWorker.ready.then(function(registration) {
                return registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
                }).then(function(subscription) {
                    // Send subscription to backend
                    return service.saveSubscription(subscription);
                });
            });
        },

        // Save push subscription to Funifier
        saveSubscription: function(subscription) {
            var userId = localStorage.getItem('fitness_user');
            if (!userId) return Promise.resolve();
            var subJSON = subscription.toJSON();
            return $http.post(PUB_URL + '/push_subscribe', {
                playerId: userId,
                subscription: {
                    endpoint: subJSON.endpoint,
                    keys: subJSON.keys
                }
            }).then(function() {
                localStorage.setItem('fitness_push_subscribed', 'true');
                return 'subscribed';
            });
        },

        // Check if already subscribed
        isSubscribed: function() {
            return localStorage.getItem('fitness_push_subscribed') === 'true';
        },

        // Send a local notification (for immediate feedback)
        showLocal: function(title, body, tag) {
            if (Notification.permission !== 'granted') return;
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(function(reg) {
                    reg.showNotification(title, {
                        body: body,
                        icon: 'img/icon-192.png',
                        badge: 'img/icon-192.png',
                        tag: tag || 'orvya-' + Date.now(),
                        vibrate: [200, 100, 200],
                        data: { url: '/' }
                    });
                });
            }
        },

        // Schedule daily local reminders (using setTimeout for current session)
        scheduleReminders: function() {
            var prefs = service.getPreferences();
            if (!prefs.enabled) return;

            // Schedule reminders for today
            var now = new Date();
            var today = now.toISOString().slice(0, 10);

            if (prefs.workout && prefs.workoutTime) {
                scheduleAt(prefs.workoutTime, 'Hora do treino!', 'Bora treinar? Seu plano de hoje te espera.', 'orvya-workout');
            }
            if (prefs.meals && prefs.mealsTime) {
                scheduleAt(prefs.mealsTime, 'Hora da refeicao!', 'Registre sua refeicao e mantenha o foco.', 'orvya-meal');
            }
            if (prefs.water) {
                // Water reminder every 2 hours from 8am to 10pm
                for (var h = 8; h <= 22; h += 2) {
                    scheduleAt(pad(h) + ':00', 'Beba agua!', 'Lembre-se de se hidratar.', 'orvya-water-' + h);
                }
            }
            if (prefs.checkin && prefs.checkinTime) {
                scheduleAt(prefs.checkinTime, 'Check-in diario', 'Como foi seu dia? Registre seu progresso.', 'orvya-checkin');
            }
        },

        // Get/set notification preferences
        getPreferences: function() {
            var stored = localStorage.getItem('fitness_notif_prefs');
            if (stored) {
                try { return JSON.parse(stored); } catch(e) {}
            }
            return {
                enabled: false,
                workout: true,
                workoutTime: '07:00',
                meals: true,
                mealsTime: '12:00',
                water: true,
                checkin: true,
                checkinTime: '21:00'
            };
        },

        savePreferences: function(prefs) {
            localStorage.setItem('fitness_notif_prefs', JSON.stringify(prefs));
            if (prefs.enabled) {
                service.scheduleReminders();
            }
        }
    };

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function scheduleAt(timeStr, title, body, tag) {
        var now = new Date();
        var parts = timeStr.split(':');
        var target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(parts[0]), parseInt(parts[1]), 0);
        var delay = target.getTime() - now.getTime();
        if (delay > 0 && delay < 86400000) {
            setTimeout(function() {
                service.showLocal(title, body, tag);
            }, delay);
        }
    }

    return service;
});
