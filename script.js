document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const nav = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a, .hero-btns a, .hero-footer-btns a');
    const authOverlay = document.getElementById('auth-overlay');
    const openSignupBtn = document.getElementById('open-signup');
    const closeAuthBtn = document.getElementById('close-auth');
    const toggleAuthBtn = document.getElementById('toggle-auth');
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const toggleText = document.getElementById('toggle-text');
    const nameGroup = document.getElementById('name-group');
    const authSubmitBtn = document.getElementById('auth-submit');
    
    const demoEntry = document.getElementById('demo-entry');
    const demoDashboard = document.getElementById('demo-dashboard');
    const startDemoBtn = document.getElementById('start-demo');
    const stopDemoBtn = document.getElementById('stop-demo');
    const batteryFill = document.getElementById('battery-fill');
    const chargePercentage = document.getElementById('charge-percentage');
    const countdownDisplay = document.getElementById('countdown');
    const chargeStatus = document.getElementById('charge-status');
    const userDisplayName = document.getElementById('user-display-name');
    
    const contactForm = document.getElementById('contact-form');
    const toast = document.getElementById('toast');
    
    const alertPopup = document.getElementById('alert-popup');
    const closeAlertBtn = document.getElementById('close-alert');
    const bellSound = document.getElementById('bell-sound');

    let isLogin = false;
    let demoInterval;
    let currentCharge = 15;
    let secondsLeft = 0;

    // --- Authentication Check ---
    const isAuthenticated = () => {
        return localStorage.getItem('smart_user') !== null;
    };

    // --- Navigation (SPA Logic with Auth Gate) ---
    const switchPage = (targetId) => {
        // If user is not authenticated and trying to go anywhere other than #home, show auth
        if (!isAuthenticated() && targetId !== '#home') {
            authOverlay.classList.add('active');
            showToast('Please Sign Up first to unlock this feature! 🔐');
            return;
        }

        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        sections.forEach(s => s.classList.remove('active'));
        
        // Reset scroll immediately
        targetSection.scrollTop = 0;
        
        // Activate new section
        setTimeout(() => {
            targetSection.classList.add('active');
        }, 10);
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                switchPage(href);
            }
        });
    });

    // --- Authentication UI Update ---
    const updateAuthUI = () => {
        const user = JSON.parse(localStorage.getItem('smart_user'));
        if (user) {
            openSignupBtn.textContent = `Logout (${user.name})`;
            openSignupBtn.classList.add('logged-in');
        } else {
            openSignupBtn.textContent = 'Sign Up';
            openSignupBtn.classList.remove('logged-in');
            switchPage('#home');
        }
    };

    openSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isAuthenticated()) {
            localStorage.removeItem('smart_user');
            updateAuthUI();
            showToast('Logged out. Please Sign Up to access features. 🔐');
            switchPage('#home');
        } else {
            authOverlay.classList.add('active');
        }
    });

    closeAuthBtn.addEventListener('click', () => authOverlay.classList.remove('active'));

    toggleAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        authTitle.textContent = isLogin ? 'Welcome Back' : 'Create Account';
        toggleText.textContent = isLogin ? "Don't have an account?" : "Already have an account?";
        toggleAuthBtn.textContent = isLogin ? 'Sign Up' : 'Sign In';
        authSubmitBtn.textContent = isLogin ? 'Sign In' : 'Sign Up';
        nameGroup.style.display = isLogin ? 'none' : 'block';
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('auth-name').value || 'User';
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-pass').value;

        if (!email || !pass || (!isLogin && !name)) {
            showToast('Please fill all fields! ⚠️');
            return;
        }
        
        localStorage.setItem('smart_user', JSON.stringify({ name, email }));
        updateAuthUI();
        authOverlay.classList.remove('active');
        showToast(isLogin ? `Welcome back, ${name}! ✨` : 'Account created! Now you can explore all features. 🚀');
        
        // Automatically take them to features after signing up
        setTimeout(() => switchPage('#services'), 500);
    });

    // --- Demo Logic ---
    const updateTimerDisplay = () => {
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        countdownDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    startDemoBtn.addEventListener('click', () => {
        if (!isAuthenticated()) {
            authOverlay.classList.add('active');
            showToast('Signup first to start the demo! 🔐');
            return;
        }

        const name = document.getElementById('demo-name').value || 'Guest';
        const minsInput = parseInt(document.getElementById('reminder-time').value) || 1;
        
        secondsLeft = minsInput * 60;
        userDisplayName.textContent = name;
        demoEntry.classList.add('hidden');
        demoDashboard.classList.remove('hidden');
        
        currentCharge = 15;
        batteryFill.style.height = `${currentCharge}%`;
        chargePercentage.textContent = `${currentCharge}%`;
        updateTimerDisplay();
        
        demoInterval = setInterval(() => {
            secondsLeft -= 1;
            updateTimerDisplay();

            if (currentCharge < 100) {
                currentCharge = 15 + Math.floor(((minsInput * 60 - secondsLeft) / (minsInput * 60)) * 85);
            }
            
            batteryFill.style.height = `${currentCharge}%`;
            chargePercentage.textContent = `${currentCharge}%`;

            if (secondsLeft <= 0) {
                clearInterval(demoInterval);
                chargeStatus.textContent = "Status: Target Reached - Disconnected";
                chargeStatus.style.color = "var(--danger-rose)";
                batteryFill.style.backgroundColor = "var(--danger-rose)";
                
                alertPopup.classList.add('active');
                bellSound.play().catch(err => console.log("Audio play blocked."));
            }
        }, 1000);
    });

    stopDemoBtn.addEventListener('click', () => {
        clearInterval(demoInterval);
        demoDashboard.classList.add('hidden');
        demoEntry.classList.remove('hidden');
        chargeStatus.textContent = "Status: Optimized Charging";
        chargeStatus.style.color = "var(--accent-emerald)";
        batteryFill.style.backgroundColor = "var(--accent-emerald)";
        bellSound.pause();
        bellSound.currentTime = 0;
    });

    closeAlertBtn.addEventListener('click', () => {
        alertPopup.classList.remove('active');
        bellSound.pause();
        bellSound.currentTime = 0;
    });

    // --- Contact Form ---
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!isAuthenticated()) {
            authOverlay.classList.add('active');
            showToast('Signup first to send messages! 🔐');
            return;
        }
        showToast('Message sent! Our team will contact you soon. 📬');
        contactForm.reset();
    });

    // --- Toast Helper ---
    const showToast = (msg) => {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    };

    // --- Initial State ---
    updateAuthUI();
});
