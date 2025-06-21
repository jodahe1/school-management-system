// Edit Profile JavaScript
const API_BASE_URL = 'http://localhost:5000';

// Get user data from localStorage
let userData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Get user data from localStorage - try different possible keys
  let storedUser = localStorage.getItem('userData');
  let userRole = null;
  
  if (!storedUser) {
    // Try role-specific keys
    storedUser = localStorage.getItem('student');
    if (storedUser) {
      userRole = 'student';
    } else {
      storedUser = localStorage.getItem('parent');
      if (storedUser) {
        userRole = 'parent';
      } else {
        storedUser = localStorage.getItem('teacher');
        if (storedUser) {
          userRole = 'teacher';
        }
      }
    }
  }
  
  if (!storedUser) {
    window.location.href = 'index.html';
    return;
  }

  userData = JSON.parse(storedUser);
  
  // If we found data with role-specific key, set the role
  if (userRole) {
    userData.role = userRole;
  }
  
  console.log('User data loaded:', userData);
  
  // Load current user data
  loadCurrentUserData();
  
  // Show/hide role-specific fields
  setupRoleSpecificFields();
  
  // Add event listeners
  setupEventListeners();
});

// Load current user data
async function loadCurrentUserData() {
  try {
    console.log('Loading user data for:', userData.role, 'with user_id:', userData.user_id);
    
    const response = await fetch(`${API_BASE_URL}/api/${userData.role}/profile?user_id=${userData.user_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      throw new Error('Failed to load user data');
    }

    const userInfo = await response.json();
    console.log('User info received:', userInfo);
    
    // Populate form with current data
    document.getElementById('firstName').value = userInfo.first_name || '';
    document.getElementById('lastName').value = userInfo.last_name || '';
    document.getElementById('email').value = userInfo.email || '';
    
    // Role-specific fields
    if (userData.role === 'student' && userInfo.date_of_birth) {
      document.getElementById('dateOfBirth').value = userInfo.date_of_birth.split('T')[0];
    }
    
    if (userData.role === 'parent' && userInfo.phone_number) {
      document.getElementById('phoneNumber').value = userInfo.phone_number;
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    showError('Failed to load user data. Please try again.');
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
  document.getElementById('editProfileForm').addEventListener('submit', handleFormSubmission);
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
  
  // Clear previous messages
  clearMessages();
  
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Show loading state
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving Changes...';
  
  try {
    // Prepare form data
    const formData = {
      user_id: userData.user_id,
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value
    };
    
    // Add password data if provided
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    
    if (currentPassword && newPassword) {
      formData.currentPassword = currentPassword;
      formData.newPassword = newPassword;
    }
    
    // Add role-specific data
    if (userData.role === 'student') {
      formData.dateOfBirth = document.getElementById('dateOfBirth').value;
    }
    
    if (userData.role === 'parent') {
      formData.phoneNumber = document.getElementById('phoneNumber').value;
    }
    
    // Submit to backend
    const response = await fetch(`${API_BASE_URL}/api/${userData.role}/update-profile`, {
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
    showSuccess('Profile updated successfully!');
    
    // Update localStorage with new data
    if (result.user) {
      localStorage.setItem('userData', JSON.stringify(result.user));
    }
    
    // Reset password fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordStrength').className = 'password-strength';
    
  } catch (error) {
    console.error('Update error:', error);
    showError(error.message || 'Failed to update profile. Please try again.');
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
  }
}

// Validate form
function validateForm() {
  let isValid = true;
  
  // Check required fields
  const requiredFields = ['firstName', 'lastName', 'email'];
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      showFieldError(fieldId, 'This field is required');
      isValid = false;
    } else {
      clearFieldError(fieldId);
    }
  });
  
  // Check password fields if provided
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (currentPassword || newPassword || confirmPassword) {
    // If any password field is filled, all must be filled
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Please fill in all password fields if you want to change your password');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      showError('New password and confirm password do not match');
      isValid = false;
    }
  }
  
  // Validate email format
  const email = document.getElementById('email').value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    showFieldError('email', 'Please enter a valid email address');
    isValid = false;
  }
  
  return isValid;
}

// Show field error
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  field.classList.add('error');
  
  // Create or update error message
  let errorDiv = field.parentElement.querySelector('.field-error');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '0.25rem';
    field.parentElement.appendChild(errorDiv);
  }
  errorDiv.textContent = message;
}

// Clear field error
function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  field.classList.remove('error');
  
  const errorDiv = field.parentElement.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorDiv.classList.remove('show');
  }, 5000);
}

// Show success message
function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  successDiv.textContent = message;
  successDiv.classList.add('show');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    successDiv.classList.remove('show');
  }, 5000);
}

// Clear all messages
function clearMessages() {
  document.getElementById('errorMessage').classList.remove('show');
  document.getElementById('successMessage').classList.remove('show');
}

// Go back function
function goBack() {
  // Determine which page to go back to based on user role
  switch (userData.role) {
    case 'student':
      window.location.href = 'studentDashboard.html';
      break;
    case 'parent':
      window.location.href = 'parentDashboard.html';
      break;
    case 'teacher':
      window.location.href = 'teacherDashboard.html';
      break;
    default:
      window.history.back();
  }
} 