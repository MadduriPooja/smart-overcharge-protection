document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userNameInput = document.getElementById('user-name');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const displayName = document.getElementById('display-name');
    const countdownDisplay = document.getElementById('countdown');
    const batteryLevel = document.getElementById('battery-level');
    const alertPopup = document.getElementById('alert-popup');
    const closeAlert = document.getElementById('close-alert');
    const bellSound = document.getElementById('bell-sound');
    const batteryStatusText = document.getElementById('battery-status');

    const reminderTimeInput = document.getElementById('reminder-time');
    let timerInterval;
    let secondsLeft = 10;
    let totalSeconds = 10;

    // Login logic
    startBtn.addEventListener('click', () => {
        const name = userNameInput.value.trim();
        const timeVal = parseInt(reminderTimeInput.value);

        if (name === '') {
            alert('Please enter your name');
            return;
        }
        if (isNaN(timeVal) || timeVal <= 0) {
            alert('Please enter a valid time');
            return;
        }

        displayName.textContent = name;
        secondsLeft = timeVal * 60;
        totalSeconds = timeVal * 60;

        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');

        startChargingSession();
    });

    // Charging session logic
    function startChargingSession() {
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            secondsLeft--;
            updateTimerDisplay();

            const percentage = (secondsLeft / totalSeconds) * 100;
            const reversedFill = 100 - percentage;
            batteryLevel.style.height = `${reversedFill}%`;

            if (percentage >= 70) {
                batteryLevel.style.backgroundColor = '#10b981'; // Green
                batteryStatusText.textContent = "Status: Charging Safely";
            } else if (percentage >= 30) {
                batteryLevel.style.backgroundColor = '#f59e0b'; // Yellow
                batteryStatusText.textContent = "Status: Warning - Battery High";
            } else {
                batteryLevel.style.backgroundColor = '#ef4444'; // Red
                batteryStatusText.textContent = "Status: Critical - Overcharge Imminent";
            }

            if (secondsLeft <= 0) {
                clearInterval(timerInterval);
                triggerAlert();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        countdownDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function triggerAlert() {
        alertPopup.classList.remove('hidden');
        bellSound.play().catch(e => console.log("Audio play blocked by browser. Interaction needed."));
    }

    // Controls
    stopBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        alert('Charging Stopped Manually.');
        resetDemo();
    });

    closeAlert.addEventListener('click', () => {
        alertPopup.classList.add('hidden');
        bellSound.pause();
        bellSound.currentTime = 0;
        resetDemo();
    });

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Reset demo state or handle view logic if needed
    function resetDemo() {
        clearInterval(timerInterval);
        dashboardSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        userNameInput.value = '';
    }
});
