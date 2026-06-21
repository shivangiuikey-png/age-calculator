document.addEventListener('DOMContentLoaded', () => {
    const dobInput = document.getElementById('dob-input');
    const calculateBtn = document.getElementById('calculate-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const errorMessage = document.getElementById('error-message');
    const extraStats = document.getElementById('extra-stats');
    
    // Result elements
    const resultYears = document.getElementById('result-years');
    const resultMonths = document.getElementById('result-months');
    const resultDays = document.getElementById('result-days');
    
    // Stat elements
    const nextBirthday = document.getElementById('next-birthday');
    const totalDaysLived = document.getElementById('total-days');
    // 1. Dynamic Date Limitation (No future dates)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const maxDateStr = `${yyyy}-${mm}-${dd}`;
    dobInput.setAttribute('max', maxDateStr);
    // 2. Theme Toggle Logic
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem('theme', 'light');
        }
    });
    // 3. Count Up Animation Helper
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Easing function: easeOutQuad
            const ease = progress * (2 - progress);
            const currentValue = Math.floor(ease * (end - start) + start);
            element.textContent = currentValue;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = end;
            }
        };
        window.requestAnimationFrame(step);
    }
    // 4. Age Calculation Logic
    function calculateAge() {
        const dobValue = dobInput.value;
        
        // Validation check
        if (!dobValue) {
            showError('Please choose a date.');
            return;
        }
        const dob = new Date(dobValue);
        dob.setHours(0, 0, 0, 0);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (dob > now) {
            showError('Date of Birth cannot be in the future!');
            return;
        }
        // Clear error
        hideError();
        // Calculate Years, Months, Days
        let years = now.getFullYear() - dob.getFullYear();
        let months = now.getMonth() - dob.getMonth();
        let days = now.getDate() - dob.getDate();
        if (days < 0) {
            // Borrow days from previous month
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
            months--;
        }
        if (months < 0) {
            months += 12;
            years--;
        }
        // Animate primary results
        animateValue(resultYears, 0, years, 800);
        animateValue(resultMonths, 0, months, 800);
        animateValue(resultDays, 0, days, 800);
        // Extra Stats 1: Next Birthday Days Remaining
        let nextBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
        if (nextBday < now) {
            nextBday.setFullYear(now.getFullYear() + 1);
        }
        
        const diffTime = nextBday - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0 || (dob.getMonth() === now.getMonth() && dob.getDate() === now.getDate())) {
            nextBirthday.textContent = "Today is your Birthday! 🎉";
        } else {
            nextBirthday.textContent = `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
        }
        // Extra Stats 2: Total Days Lived
        const livedTime = now - dob;
        const livedDays = Math.floor(livedTime / (1000 * 60 * 60 * 24));
        
        // Animate total days count up
        animateValue(totalDaysLived, 0, livedDays, 1000);
        // Reveal stats section
        extraStats.classList.remove('hidden');
        extraStats.style.display = 'block'; // Make sure layout resets correctly
    }
    // Helper functions for validation UI
    function showError(message) {
        errorMessage.querySelector('span').textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.style.display = 'flex';
        dobInput.classList.add('error');
        // Vibrate input on error (micro-interaction)
        dobInput.style.animation = 'shake 0.4s ease';
        setTimeout(() => {
            dobInput.style.animation = '';
        }, 400);
    }
    function hideError() {
        errorMessage.classList.add('hidden');
        errorMessage.style.display = 'none';
        dobInput.classList.remove('error');
    }
    // Event listeners
    calculateBtn.addEventListener('click', calculateAge);
    
    // Allow enter key press inside input
    dobInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculateAge();
        }
    });
});
// Dynamic shake keyframes injection for visual error feedback
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
}
`;
document.head.appendChild(styleSheet);
