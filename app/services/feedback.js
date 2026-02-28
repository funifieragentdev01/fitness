angular.module('fitness').factory('FeedbackService', function() {

    function playBeep() {
        try {
            var audio = new Audio('audio/beep.mp3');
            audio.play();
        } catch(e) {}
    }

    var service = {
        vibrate: function(pattern) {
            if (navigator.vibrate) navigator.vibrate(pattern);
        },

        playSound: function() {
            playBeep();
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
            playBeep();
            service.showXpPopup(10);
        },
        mealFeedback: function() {
            service.vibrate([50, 30, 50]);
            playBeep();
            service.showConfetti('light');
            service.showXpPopup(15);
        },
        workoutFeedback: function() {
            service.vibrate([100, 50, 100]);
            playBeep();
            service.showConfetti('medium');
            service.showXpPopup(20);
        },
        levelUpFeedback: function() {
            service.vibrate([100, 50, 100, 50, 200]);
            playBeep();
            service.showConfetti('heavy');
        },
        dailyCompleteFeedback: function() {
            service.vibrate([200, 100, 200]);
            playBeep();
            service.showConfetti('heavy');
        }
    };
    return service;
});
