// Unified Login JavaScript - Combining all login functionality

// API Base URL
const API_BASE_URL = 'http://localhost:5000';

// State management
let isLoading = false;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const passwordToggle = document.getElementById('passwordToggle');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');
const errorMessage = document.getElementById('errorMessage');

// Unified login configuration
const loginConfig = {
    endpoint: '/api/auth/login'
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Form submission
    loginForm.addEventListener('submit', handleLogin);

    // Password toggle
    passwordToggle.addEventListener('click', togglePasswordVisibility);

    // Input focus effects
    usernameInput.addEventListener('focus', () => {
        usernameInput.parentElement.classList.add('focused');
    });

    usernameInput.addEventListener('blur', () => {
        if (!usernameInput.value) {
            usernameInput.parentElement.classList.remove('focused');
        }
    });

    passwordInput.addEventListener('focus', () => {
        passwordInput.parentElement.classList.add('focused');
    });

    passwordInput.addEventListener('blur', () => {
        if (!passwordInput.value) {
            passwordInput.parentElement.classList.remove('focused');
        }
    });
}



// Toggle password visibility
function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    
    const icon = passwordToggle.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

// Show loading state
function setLoadingState(loading) {
    isLoading = loading;
    loginBtn.disabled = loading;
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
    } else {
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

// Show error message
function showError(message, type = 'error') {
    errorMessage.textContent = message;
    errorMessage.className = `error-message ${type} show`;
}

// Hide error message
function hideError() {
    errorMessage.className = 'error-message';
}

// Validate form inputs
function validateForm() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showError('Please fill in all fields.');
        return false;
    }

    // All user types use username now, no special validation needed

    // Username length validation
    if (username.length < 3) {
        showError('Username must be at least 3 characters long.');
        return false;
    }

    return true;
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();

    // Clear previous error messages
    hideError();

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Set loading state
    setLoadingState(true);

    try {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Prepare request body
        const requestBody = { username, password };

        // Send login request
        const response = await fetch(`${API_BASE_URL}${loginConfig.endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // Handle response
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            throw new Error(errorData.message || errorData.error || 'Login failed');
        }

        const data = await response.json();

        // Handle successful login
        await handleSuccessfulLogin(data);

    } catch (error) {
        console.error('Error during login:', error);
        showError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
        setLoadingState(false);
    }
}

// Handle successful login
async function handleSuccessfulLogin(data) {
    const userData = data.user || data;
    
    // Check if this is a first-time login
    if (userData.password_reset_required) {
        // Store temporary data for first-time login
        localStorage.setItem('tempUserData', JSON.stringify({
            user_id: userData.user_id,
            username: userData.username,
            password: passwordInput.value.trim(), // Store password temporarily for verification
            role: userData.role
        }));
        
        // Redirect to first-time login page
        window.location.href = 'firstTimeLogin.html';
        return;
    }

    // Normal login - store user data based on role
    const storageKey = userData.role; // Use role as storage key
    localStorage.setItem(storageKey, JSON.stringify(userData));
    
    // Show success message briefly
    showError('Login successful! Redirecting...', 'success');
    
    // Redirect to appropriate dashboard based on role
    let dashboardUrl;
    switch (userData.role) {
        case 'student':
            dashboardUrl = 'studentDashboard.html';
            break;
        case 'teacher':
            dashboardUrl = 'teacherDashboard.html';
            break;
        case 'parent':
            dashboardUrl = 'parentDashboard.html';
            break;
        case 'admin':
            dashboardUrl = 'admin-dashboard.html';
            break;
        default:
            dashboardUrl = 'unified-login.html';
    }
    
    setTimeout(() => {
        window.location.href = dashboardUrl;
    }, 1000);
}

// Helper function to check if user is already logged in
function checkExistingLogin() {
    const userTypes = ['student', 'teacher', 'parent', 'admin'];
    
    for (const userType of userTypes) {
        const userData = localStorage.getItem(userType);
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                if (parsed && (parsed.user_id || parsed.admin_id)) {
                    // User is already logged in, redirect to dashboard
                    const config = userTypeConfig[userType];
                    window.location.href = config.dashboard;
                    return;
                }
            } catch (e) {
                // Invalid data, continue
            }
        }
    }
}

// Check for existing login on page load
document.addEventListener('DOMContentLoaded', () => {
    checkExistingLogin();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Add form animations
function addFormAnimations() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });
}

// Initialize form animations
document.addEventListener('DOMContentLoaded', addFormAnimations);

// Add accessibility features
function addAccessibilityFeatures() {
    // Add ARIA labels for form elements
    usernameInput.setAttribute('aria-label', 'Username input field');
    passwordInput.setAttribute('aria-label', 'Password input field');
    loginBtn.setAttribute('aria-label', 'Sign in button');
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', addAccessibilityFeatures);

// Add form validation feedback
function addValidationFeedback() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.trim()) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
    });
}

// Initialize validation feedback
document.addEventListener('DOMContentLoaded', addValidationFeedback);

// Export functions for potential external use
window.unifiedLogin = {
    handleLogin,
    showError,
    hideError,
    validateForm
}; 