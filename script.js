// Global Variables
let currentStep = 1;
let userData = {};
let chart = null;

// DOM Elements
const onboardingContainer = document.getElementById('onboarding-container');
const dashboardContainer = document.getElementById('dashboard-container');
const progressBar = document.getElementById('progress-bar');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const loadingSpinner = document.getElementById('loading-spinner');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has already completed onboarding
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
        userData = JSON.parse(savedUserData);
        showDashboard();
    } else {
        initializeOnboarding();
    }
});

// Onboarding Functions
function initializeOnboarding() {
    setupEventListeners();
    setupThemeSelection();
    setupLayoutSelection();
    animateNumbers();
}

function setupEventListeners() {
    nextBtn.addEventListener('click', handleNext);
    backBtn.addEventListener('click', handleBack);
    submitBtn.addEventListener('click', handleSubmit);
    
    // Form validation on input
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', validateCurrentStep);
        input.addEventListener('blur', validateCurrentStep);
    });
}

function setupThemeSelection() {
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input[type="radio"]').checked = true;
        });
    });
}

function setupLayoutSelection() {
    document.querySelectorAll('.layout-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.layout-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input[type="radio"]').checked = true;
        });
    });
}

function handleNext() {
    if (validateCurrentStep()) {
        saveCurrentStepData();
        if (currentStep < 3) {
            currentStep++;
            updateStep();
        }
    }
}

function handleBack() {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
    }
}

async function handleSubmit() {
    if (validateCurrentStep()) {
        saveCurrentStepData();
        showLoading(true);
        
        try {
            // Simulate API call
            await simulateAPICall();
            
            // Save to localStorage
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Show success message
            showSuccessMessage();
            
            // Redirect to dashboard after delay
            setTimeout(() => {
                showDashboard();
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting data:', error);
            showErrorMessage();
        } finally {
            showLoading(false);
        }
    }
}

function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
        
        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.classList.add('is-invalid');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function saveCurrentStepData() {
    switch(currentStep) {
        case 1:
            userData.firstName = document.getElementById('firstName').value;
            userData.lastName = document.getElementById('lastName').value;
            userData.email = document.getElementById('email').value;
            userData.phone = document.getElementById('phone').value;
            break;
        case 2:
            userData.companyName = document.getElementById('companyName').value;
            userData.industry = document.getElementById('industry').value;
            userData.companySize = document.getElementById('companySize').value;
            userData.role = document.getElementById('role').value;
            break;
        case 3:
            userData.theme = document.querySelector('input[name="theme"]:checked').value;
            userData.layout = document.querySelector('input[name="layout"]:checked').value;
            userData.notifications = document.getElementById('notifications').checked;
            break;
    }
}

function updateStep() {
    // Hide all steps
    document.querySelectorAll('.onboarding-step').forEach(step => {
        step.classList.add('d-none');
    });
    
    // Show current step with animation
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    currentStepElement.classList.remove('d-none');
    currentStepElement.classList.add('slide-in-animation');
    
    // Update progress bar
    const progress = (currentStep / 3) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Update buttons
    backBtn.disabled = currentStep === 1;
    
    if (currentStep === 3) {
        nextBtn.classList.add('d-none');
        submitBtn.classList.remove('d-none');
    } else {
        nextBtn.classList.remove('d-none');
        submitBtn.classList.add('d-none');
    }
}

// Dashboard Functions
function showDashboard() {
    onboardingContainer.classList.add('d-none');
    dashboardContainer.classList.remove('d-none');
    dashboardContainer.classList.add('fade-in-animation');
    
    // Apply theme
    if (userData.theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Populate dashboard data
    populateDashboardData();
    
    // Initialize chart
    initializeChart();
    
    // Animate stats
    animateStats();
}

function populateDashboardData() {
    document.getElementById('user-name').textContent = userData.firstName || 'User';
    document.getElementById('welcome-name').textContent = userData.firstName || 'User';
    document.getElementById('company-name').textContent = userData.companyName || '-';
    document.getElementById('company-industry').textContent = userData.industry || '-';
    document.getElementById('company-size').textContent = userData.companySize || '-';
    document.getElementById('user-role').textContent = userData.role || '-';
}

function animateStats() {
    // Generate random stats based on company size
    const baseStats = getBaseStats();
    
    animateNumber('team-count', 0, baseStats.teamMembers, 2000);
    animateNumber('project-count', 0, baseStats.projects, 2500);
    animateNumber('notification-count', 0, baseStats.notifications, 1500);
}

function getBaseStats() {
    const sizeMultiplier = {
        '1-10': 1,
        '11-50': 2,
        '51-200': 4,
        '201-1000': 8,
        '1000+': 15
    };
    
    const multiplier = sizeMultiplier[userData.companySize] || 1;
    
    return {
        teamMembers: Math.floor(Math.random() * 20 + 5) * multiplier,
        projects: Math.floor(Math.random() * 10 + 3) * multiplier,
        notifications: Math.floor(Math.random() * 15 + 5)
    };
}

function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * easeOutCubic(progress));
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function initializeChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    // Generate sample data
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = labels.map(() => Math.floor(Math.random() * 100 + 20));
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Progress %',
                data: data,
                borderColor: 'rgb(13, 110, 253)',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(13, 110, 253)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            elements: {
                point: {
                    hoverRadius: 8
                }
            }
        }
    });
}

// Utility Functions
async function simulateAPICall() {
    // Simulate API call with axios
    try {
        const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
            title: 'User Onboarding Data',
            body: JSON.stringify(userData),
            userId: 1
        });
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.log('Using mock API response');
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
}

function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
        submitBtn.disabled = true;
    } else {
        loadingSpinner.classList.add('d-none');
        submitBtn.disabled = false;
    }
}

function showSuccessMessage() {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        <strong>Success!</strong> Your account has been set up successfully.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function showErrorMessage() {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Error!</strong> Something went wrong. Please try again.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userData');
        location.reload();
    }
}

// Additional animations for enhanced UX
function animateNumbers() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-animation');
            }
        });
    });
    
    document.querySelectorAll('.stat-card').forEach(card => {
        observer.observe(card);
    });
}

// Responsive chart resize
window.addEventListener('resize', function() {
    if (chart) {
        chart.resize();
    }
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (onboardingContainer.classList.contains('d-none')) return;
    
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (currentStep < 3) {
            handleNext();
        } else {
            handleSubmit();
        }
    } else if (e.key === 'Escape') {
        if (currentStep > 1) {
            handleBack();
        }
    }
});