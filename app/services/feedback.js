angular.module('fitness').factory('FeedbackService', function() {
    // iOS Safari requires AudioContext to be created/resumed within user gesture
    // So we create it lazily on first use (which is always inside a button click)
    var audioCtx = null;

    function ctx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // iOS keeps context suspended until resumed in a user gesture
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function tone(freq, startOffset, duration, type, vol) {
        var c = ctx();
        var osc = c.createOscillator();
        var gain = c.createGain();
        osc.connect(gain);
        gain.connect(c.destination);
        osc.type = type || 'sine';
        var t = c.currentTime + (startOffset || 0);
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(vol || 0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (duration || 0.15));
        osc.start(t);
        osc.stop(t + (duration || 0.15));
    }

    function sweep(fromFreq, toFreq, duration, type, vol) {
        var c = ctx();
        var osc = c.createOscillator();
        var gain = c.createGain();
        osc.connect(gain);
        gain.connect(c.destination);
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(fromFreq, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(toFreq, c.currentTime + duration);
        gain.gain.setValueAtTime(vol || 0.35, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration + 0.05);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + duration + 0.05);
    }

    var sounds = {
        water: function() {
            sweep(600, 200, 0.15, 'sine', 0.4);
            setTimeout(function() { sweep(400, 150, 0.15, 'sine', 0.2); }, 50);
        },
        meal: function() {
            tone(880, 0, 0.18, 'sine', 0.4);
            tone(1100, 0.15, 0.25, 'sine', 0.4);
        },
        workout: function() {
            sweep(200, 800, 0.3, 'sawtooth', 0.25);
        },
        levelup: function() {
            [523, 659, 784, 1047].forEach(function(f, i) {
                tone(f, i * 0.12, 0.15, 'sine', 0.35);
            });
        },
        complete: function() {
            [523, 659, 784, 1047].forEach(function(f, i) {
                tone(f, i * 0.1, 0.2, 'sine', 0.4);
            });
        }
    };

    var service = {
        vibrate: function(pattern) {
            // navigator.vibrate not supported on iOS Safari
            if (navigator.vibrate) navigator.vibrate(pattern);
        },

        playSound: function(type) {
            try {
                if (sounds[type]) sounds[type]();
                else tone(800, 0, 0.1, 'sine', 0.3);
            } catch(e) { console.warn('Sound error:', e); }
        },

        showConfetti: function(intensity) {
            var count = intensity === 'heavy' ? 50 : (intensity === 'medium' ? 25 : 10);
            var container = document.createElement('div');
            container.className = 'confetti-container';
            document.body.appendChild(container);
            var colors = ['#FF6B00', '#FFD700', '#FF4444', '#00C853', '#2196F3', '#E040FB'];
            for (var i = 0; i < count; i++) {
                var p = document.createElement('div');
                p.className = 'confetti-particle';
                p.style.left = Math.random() * 100 + '%';
                p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                p.style.animationDelay = (Math.random() * 0.5) + 's';
                p.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
                container.appendChild(p);
            }
            setTimeout(function() { container.remove(); }, 3500);
        },

        showXpPopup: function(xp, element) {
            var popup = document.createElement('div');
            popup.className = 'xp-popup';
            popup.textContent = '+' + xp + ' XP';
            if (element) {
                var rect = element.getBoundingClientRect();
                popup.style.left = rect.left + rect.width / 2 + 'px';
                popup.style.top = rect.top + 'px';
            } else {
                popup.style.left = '50%';
                popup.style.top = '50%';
            }
            document.body.appendChild(popup);
            setTimeout(function() { popup.remove(); }, 1500);
        },

        waterFeedback: function() {
            service.vibrate([50]);
            service.playSound('water');
            service.showXpPopup(10);
        },
        mealFeedback: function() {
            service.vibrate([50, 30, 50]);
            service.playSound('meal');
            service.showConfetti('light');
            service.showXpPopup(15);
        },
        workoutFeedback: function() {
            service.vibrate([100, 50, 100]);
            service.playSound('workout');
            service.showConfetti('medium');
            service.showXpPopup(20);
        },
        levelUpFeedback: function() {
            service.vibrate([100, 50, 100, 50, 200]);
            service.playSound('levelup');
            service.showConfetti('heavy');
        },
        dailyCompleteFeedback: function() {
            service.vibrate([200, 100, 200]);
            service.playSound('complete');
            service.showConfetti('heavy');
        }
    };
    return service;
});
