// First Time Login JavaScript
const API_BASE_URL = 'http://localhost:5000';

// Get user data from localStorage (set by login process)
let userData = null;
let userInfo = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  // Get user data from localStorage
  const storedUser = localStorage.getItem('tempUserData');
  if (!storedUser) {
    window.location.href = 'index.html';
    return;
  }

  userData = JSON.parse(storedUser);
  
  // Display credentials
  displayCredentials();
  
  // Load user information based on role
  await loadUserInfo();
});

// Display user credentials
function displayCredentials() {
  document.getElementById('displayUsername').textContent = userData.username;
  document.getElementById('displayPassword').textContent = '••••••••';
  document.getElementById('displayRole').textContent = capitalizeFirst(userData.role);
}

// Load user information based on role
async function loadUserInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${userData.role}/first-time-info?user_id=${userData.user_id}`);
    
    if (!response.ok) {
      throw new Error('Failed to load user information');
    }
    
    userInfo = await response.json();
    displayUserInfo();
    
  } catch (error) {
    console.error('Error loading user info:', error);
    document.getElementById('userInfoGrid').innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
        <p>Failed to load user information. Please try again.</p>
      </div>
    `;
  }
}

// Display user information
function displayUserInfo() {
  const userInfoGrid = document.getElementById('userInfoGrid');
  
  let infoHTML = '';
  
  // Common user info
  infoHTML += `
    <div class="info-item">
      <span class="label">User ID:</span>
      <span class="value">${userInfo.user_id}</span>
    </div>
    <div class="info-item">
      <span class="label">Email:</span>
      <span class="value">${userInfo.email || 'Not provided'}</span>
    </div>
    <div class="info-item">
      <span class="label">Account Created:</span>
      <span class="value">${new Date(userInfo.created_at).toLocaleDateString()}</span>
    </div>
  `;
  
  // Role-specific information
  switch (userData.role) {
    case 'student':
      infoHTML += `
        <div class="info-item">
          <span class="label">Student ID:</span>
          <span class="value">${userInfo.student_id}</span>
        </div>
        <div class="info-item">
          <span class="label">First Name:</span>
          <span class="value">${userInfo.first_name}</span>
        </div>
        <div class="info-item">
          <span class="label">Last Name:</span>
          <span class="value">${userInfo.last_name}</span>
        </div>
        <div class="info-item">
          <span class="label">Date of Birth:</span>
          <span class="value">${new Date(userInfo.date_of_birth).toLocaleDateString()}</span>
        </div>
        <div class="info-item">
          <span class="label">Class:</span>
          <span class="value">${userInfo.class_name}</span>
        </div>
      `;
      break;
      
    case 'teacher':
      infoHTML += `
        <div class="info-item">
          <span class="label">Teacher ID:</span>
          <span class="value">${userInfo.teacher_id}</span>
        </div>
        <div class="info-item">
          <span class="label">First Name:</span>
          <span class="value">${userInfo.first_name}</span>
        </div>
        <div class="info-item">
          <span class="label">Last Name:</span>
          <span class="value">${userInfo.last_name}</span>
        </div>
        <div class="info-item">
          <span class="label">Subject:</span>
          <span class="value">${userInfo.subject_teaches}</span>
        </div>
      `;
      break;
      
    case 'parent':
      infoHTML += `
        <div class="info-item">
          <span class="label">Parent ID:</span>
          <span class="value">${userInfo.parent_id}</span>
        </div>
        <div class="info-item">
          <span class="label">First Name:</span>
          <span class="value">${userInfo.first_name}</span>
        </div>
        <div class="info-item">
          <span class="label">Last Name:</span>
          <span class="value">${userInfo.last_name}</span>
        </div>
        <div class="info-item">
          <span class="label">Phone Number:</span>
          <span class="value">${userInfo.phone_number || 'Not provided'}</span>
        </div>
      `;
      break;
  }
  
  userInfoGrid.innerHTML = infoHTML;
}

// Toggle password visibility
function togglePassword() {
  const passwordElement = document.getElementById('displayPassword');
  const eyeIcon = document.getElementById('eyeIcon');
  
  if (passwordElement.textContent === '••••••••') {
    passwordElement.textContent = userData.password;
    eyeIcon.className = 'fas fa-eye-slash';
  } else {
    passwordElement.textContent = '••••••••';
    eyeIcon.className = 'fas fa-eye';
  }
}

// Proceed to profile setup
function proceedToSetup() {
  // Store complete user data for the setup page
  localStorage.setItem('setupUserData', JSON.stringify({
    ...userData,
    ...userInfo
  }));
  
  // Redirect to profile setup page
  window.location.href = 'profileSetup.html';
}

// Helper function to capitalize first letter
function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
} 