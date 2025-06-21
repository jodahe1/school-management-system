// Profile Setup JavaScript
const API_BASE_URL = 'http://localhost:5000';

// Get user data from localStorage
let userData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Get user data from localStorage
  const storedUser = localStorage.getItem('setupUserData');
  if (!storedUser) {
    window.location.href = 'index.html';
    return;
  }

  userData = JSON.parse(storedUser);
  
  // Populate form with existing data
  populateForm();
  
  // Show/hide role-specific fields
  setupRoleSpecificFields();
  
  // Add event listeners
  setupEventListeners();
});

// Populate form with existing user data
function populateForm() {
  document.getElementById('firstName').value = userData.first_name || '';
  document.getElementById('lastName').value = userData.last_name || '';
  document.getElementById('email').value = userData.email || '';
  
  // Role-specific fields
  if (userData.role === 'student' && userData.date_of_birth) {
    document.getElementById('dateOfBirth').value = userData.date_of_birth.split('T')[0];
  }
  
  if (userData.role === 'parent' && userData.phone_number) {
    document.getElementById('phoneNumber').value = userData.phone_number;
  }
}

// Setup role-specific fields
function setupRoleSpecificFields() {
  switch (userData.role) {
    case 'student':
      document.getElementById('dateOfBirthGroup').style.display = 'block';
      break;
    case 'parent':
      document.getElementById('phoneNumberGroup').style.display = 'block';
      break;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Password strength checker
  document.getElementById('newPassword').addEventListener('input', checkPasswordStrength);
  
  // Password confirmation checker
  document.getElementById('confirmPassword').addEventListener('input', checkPasswordMatch);
  
  // Form submission
  document.getElementById('profileSetupForm').addEventListener('submit', handleFormSubmission);
  
  // Modal event listeners
  const modal = document.getElementById('termsModal');
  const closeBtn = document.querySelector('.close-modal');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
}

// Check password strength
function checkPasswordStrength() {
  const password = document.getElementById('newPassword').value;
  const strengthDiv = document.getElementById('passwordStrength');
  
  if (!password) {
    strengthDiv.className = 'password-strength';
    return;
  }
  
  let strength = 0;
  let feedback = '';
  
  // Length check
  if (password.length >= 8) strength++;
  else feedback += 'At least 8 characters. ';
  
  // Contains number
  if (/\d/.test(password)) strength++;
  else feedback += 'Include a number. ';
  
  // Contains letter
  if (/[a-zA-Z]/.test(password)) strength++;
  else feedback += 'Include a letter. ';
  
  // Contains special character
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  else feedback += 'Include a special character. ';
  
  // Set strength class and message
  if (strength <= 2) {
    strengthDiv.className = 'password-strength weak';
    strengthDiv.textContent = 'Weak password. ' + feedback;
  } else if (strength <= 3) {
    strengthDiv.className = 'password-strength medium';
    strengthDiv.textContent = 'Medium strength. ' + feedback;
  } else {
    strengthDiv.className = 'password-strength strong';
    strengthDiv.textContent = 'Strong password!';
  }
}

// Check password match
function checkPasswordMatch() {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const confirmInput = document.getElementById('confirmPassword');
  
  if (confirmPassword && newPassword !== confirmPassword) {
    confirmInput.classList.add('error');
    confirmInput.classList.remove('success');
  } else if (confirmPassword && newPassword === confirmPassword) {
    confirmInput.classList.remove('error');
    confirmInput.classList.add('success');
  } else {
    confirmInput.classList.remove('error', 'success');
  }
}

// Handle form submission
async function handleFormSubmission(e) {
  e.preventDefault();
  
  // Clear previous errors
  clearErrors();
  
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Show loading state
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating Profile...';
  
  try {
    // Prepare form data
    const formData = {
      user_id: userData.user_id,
      role: userData.role,
      currentPassword: document.getElementById('currentPassword').value,
      newPassword: document.getElementById('newPassword').value,
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value
    };
    
    // Add role-specific data
    if (userData.role === 'student') {
      formData.dateOfBirth = document.getElementById('dateOfBirth').value;
    }
    
    if (userData.role === 'parent') {
      formData.phoneNumber = document.getElementById('phoneNumber').value;
    }
    
    // Submit to backend
    const response = await fetch(`${API_BASE_URL}/api/${userData.role}/complete-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
    
    const result = await response.json();
    
    // Show success message
    showSuccess('Profile updated successfully! Redirecting to dashboard...');
    
    // Clear temporary data
    localStorage.removeItem('tempUserData');
    localStorage.removeItem('setupUserData');
    
    // Store updated user data
    localStorage.setItem(userData.role, JSON.stringify(result.user));
    
    // Redirect to appropriate dashboard
    setTimeout(() => {
      window.location.href = `${userData.role}Dashboard.html`;
    }, 2000);
    
  } catch (error) {
    console.error('Error updating profile:', error);
    showError(error.message || 'An error occurred while updating your profile');
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-check"></i> Complete Setup';
  }
}

// Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.parentElement.querySelector('.password-toggle');
  const icon = button.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

// Validate form
function validateForm() {
  let isValid = true;
  
  // Check current password
  const currentPassword = document.getElementById('currentPassword').value;
  if (currentPassword !== userData.password) {
    showFieldError('currentPassword', 'Current password is incorrect');
    isValid = false;
  }
  
  // Check new password
  const newPassword = document.getElementById('newPassword').value;
  if (newPassword.length < 8) {
    showFieldError('newPassword', 'New password must be at least 8 characters long');
    isValid = false;
  }
  
  // Check password confirmation
  const confirmPassword = document.getElementById('confirmPassword').value;
  if (newPassword !== confirmPassword) {
    showFieldError('confirmPassword', 'Passwords do not match');
    isValid = false;
  }
  
  // Check required fields
  const requiredFields = ['firstName', 'lastName', 'email'];
  requiredFields.forEach(field => {
    const value = document.getElementById(field).value.trim();
    if (!value) {
      showFieldError(field, 'This field is required');
      isValid = false;
    }
  });
  
  // Check email format
  const email = document.getElementById('email').value;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('email', 'Please enter a valid email address');
    isValid = false;
  }
  
  // Check terms agreement
  if (!document.getElementById('agreeTerms').checked) {
    showError('You must agree to the terms and conditions');
    isValid = false;
  }
  
  return isValid;
}

// Show field error
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  field.classList.add('error');
  
  // Create error message element
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.style.color = '#e74c3c';
  errorDiv.style.fontSize = '0.8rem';
  errorDiv.style.marginTop = '0.25rem';
  
  field.parentNode.appendChild(errorDiv);
}

// Show general error
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
}

// Show success message
function showSuccess(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.style.background = '#d4edda';
  errorDiv.style.color = '#155724';
  errorDiv.style.border = '1px solid #c3e6cb';
  errorDiv.classList.add('show');
}

// Clear all errors
function clearErrors() {
  // Remove field errors
  document.querySelectorAll('.field-error').forEach(error => error.remove());
  
  // Clear field error classes
  document.querySelectorAll('input.error').forEach(input => {
    input.classList.remove('error');
  });
  
  // Clear general error
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.classList.remove('show');
  errorDiv.style.background = '#f8d7da';
  errorDiv.style.color = '#721c24';
  errorDiv.style.border = '1px solid #f5c6cb';
}

// Show terms modal
function showTerms() {
  document.getElementById('termsModal').style.display = 'block';
} 