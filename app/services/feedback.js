angular.module('fitness').factory('FeedbackService', function($timeout) {
    var audioCtx = null;
    function getAudioCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    }

    var service = {
        vibrate: function(pattern) {
            if (navigator.vibrate) navigator.vibrate(pattern);
        },
        playSound: function(type) {
            try {
                var ctx = getAudioCtx();
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                switch(type) {
                    case 'water':
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(600, ctx.currentTime);
                        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
                        gain.gain.setValueAtTime(0.3, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2); break;
                    case 'meal':
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(880, ctx.currentTime);
                        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
                        gain.gain.setValueAtTime(0.3, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3); break;
                    case 'workout':
                        osc.type = 'sawtooth';
                        osc.frequency.setValueAtTime(200, ctx.currentTime);
                        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
                        gain.gain.setValueAtTime(0.2, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4); break;
                    case 'levelup':
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(523, ctx.currentTime);
                        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
                        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
                        osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.45);
                        gain.gain.setValueAtTime(0.3, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
                        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6); break;
                    case 'complete':
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(523, ctx.currentTime);
                        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
                        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
                        osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.3);
                        gain.gain.setValueAtTime(0.35, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5); break;
                    default:
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(800, ctx.currentTime);
                        gain.gain.setValueAtTime(0.2, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
                }
            } catch(e) {}
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
