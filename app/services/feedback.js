angular.module('fitness').factory('FeedbackService', function($timeout) {
    var audioCtx = null;
    var audioUnlocked = false;

    function getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume suspended context (mobile browsers require user gesture)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Unlock audio on first user touch/click (required for iOS/mobile)
    function unlockAudio() {
        if (audioUnlocked) return;
        try {
            var ctx = getAudioCtx();
            // Play silent buffer to unlock
            var buffer = ctx.createBuffer(1, 1, 22050);
            var source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
            audioUnlocked = true;
        } catch(e) {}
    }
    document.addEventListener('touchstart', unlockAudio, { once: false, passive: true });
    document.addEventListener('touchend', unlockAudio, { once: false, passive: true });
    document.addEventListener('click', unlockAudio, { once: false, passive: true });

    var service = {
        vibrate: function(pattern) {
            if (navigator.vibrate) navigator.vibrate(pattern);
        },
        playSound: function(type) {
            try {
                var ctx = getAudioCtx();
                if (ctx.state === 'suspended') ctx.resume();

                switch(type) {
                    case 'water':
                        // Bubbly splash — two overlapping tones
                        (function() {
                            var osc = ctx.createOscillator();
                            var gain = ctx.createGain();
                            osc.connect(gain); gain.connect(ctx.destination);
                            osc.type = 'sine';
                            osc.frequency.setValueAtTime(600, ctx.currentTime);
                            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
                            gain.gain.setValueAtTime(0.4, ctx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25);
                        })();
                        (function() {
                            var osc2 = ctx.createOscillator();
                            var gain2 = ctx.createGain();
                            osc2.connect(gain2); gain2.connect(ctx.destination);
                            osc2.type = 'sine';
                            osc2.frequency.setValueAtTime(400, ctx.currentTime + 0.05);
                            osc2.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
                            gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.05);
                            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                            osc2.start(ctx.currentTime + 0.05); osc2.stop(ctx.currentTime + 0.3);
                        })();
                        break;
                    case 'meal':
                        // Two-tone ding
                        (function() {
                            var osc = ctx.createOscillator();
                            var gain = ctx.createGain();
                            osc.connect(gain); gain.connect(ctx.destination);
                            osc.type = 'sine';
                            osc.frequency.setValueAtTime(880, ctx.currentTime);
                            gain.gain.setValueAtTime(0.4, ctx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
                        })();
                        (function() {
                            var osc2 = ctx.createOscillator();
                            var gain2 = ctx.createGain();
                            osc2.connect(gain2); gain2.connect(ctx.destination);
                            osc2.type = 'sine';
                            osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
                            gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.15);
                            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                            osc2.start(ctx.currentTime + 0.15); osc2.stop(ctx.currentTime + 0.4);
                        })();
                        break;
                    case 'workout':
                        // Epic ascending power-up
                        (function() {
                            var osc = ctx.createOscillator();
                            var gain = ctx.createGain();
                            osc.connect(gain); gain.connect(ctx.destination);
                            osc.type = 'sawtooth';
                            osc.frequency.setValueAtTime(200, ctx.currentTime);
                            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
                            gain.gain.setValueAtTime(0.25, ctx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
                        })();
                        break;
                    case 'levelup':
                        // Ascending 4-note triumph
                        [523, 659, 784, 1047].forEach(function(freq, i) {
                            var osc = ctx.createOscillator();
                            var gain = ctx.createGain();
                            osc.connect(gain); gain.connect(ctx.destination);
                            osc.type = 'sine';
                            var t = ctx.currentTime + i * 0.12;
                            osc.frequency.setValueAtTime(freq, t);
                            gain.gain.setValueAtTime(0.35, t);
                            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                            osc.start(t); osc.stop(t + 0.15);
                        });
                        break;
                    case 'complete':
                        // Victory fanfare — 4 ascending notes
                        [523, 659, 784, 1047].forEach(function(freq, i) {
                            var osc = ctx.createOscillator();
                            var gain = ctx.createGain();
                            osc.connect(gain); gain.connect(ctx.destination);
                            osc.type = 'sine';
                            var t = ctx.currentTime + i * 0.1;
                            osc.frequency.setValueAtTime(freq, t);
                            gain.gain.setValueAtTime(0.4, t);
                            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                            osc.start(t); osc.stop(t + 0.2);
                        });
                        break;
                    default:
                        (function() {
                            var osc = ctx.createOscillator();
                            var gain = ctx.createGain();
                            osc.connect(gain); gain.connect(ctx.destination);
                            osc.type = 'sine';
                            osc.frequency.setValueAtTime(800, ctx.currentTime);
                            gain.gain.setValueAtTime(0.3, ctx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
                        })();
                }
            } catch(e) { console.warn('FeedbackService sound error:', e); }
        },
        showConfetti: function(intensity) {
            var count = intensity === 'heavy' ? 50 : (intensity === 'medium' ? 25 : 10);
            var container = document.createElement('div');
            container.className = 'confetti-container';
            document.body.appendChild(container);
            var colors = ['#FF6B00', '#FFD700', '#FF4444', '#00C853', '#2196F3', '#E040FB'];
            for (var i = 0; i < count; i++) {
                var particle = document.createElement('div');
                particle.className = 'confetti-particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                particle.style.animationDelay = (Math.random() * 0.5) + 's';
                particle.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
                container.appendChild(particle);
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
