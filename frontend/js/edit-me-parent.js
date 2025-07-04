// Edit Me Parent JS
const API_BASE_URL = 'http://localhost:5000';
let parent = null;

document.addEventListener('DOMContentLoaded', () => {
  // Load parent from localStorage
  parent = JSON.parse(localStorage.getItem('parent'));
  if (!parent) {
    window.location.href = 'parentLogin.html';
    return;
  }
  // Fill sidebar info
  document.getElementById('parentName').textContent = parent.username || 'Parent';
  document.getElementById('parentId').textContent = `ID: ${parent.user_id}`;
  document.getElementById('viewingChild').textContent = 'Viewing: All Children';

  // Load current profile data
  loadProfile();

  // Form submit
  document.getElementById('editParentForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'parentDashboard.html';
  });
});

async function loadProfile() {
  try {
    // Fetch full parent profile from backend
    const res = await fetch(`${API_BASE_URL}/api/parent/profile?user_id=${parent.user_id}`);
    if (!res.ok) throw new Error('Failed to load profile');
    const data = await res.json();
    document.getElementById('firstName').value = data.first_name || '';
    document.getElementById('lastName').value = data.last_name || '';
    document.getElementById('email').value = data.email || '';
  } catch (err) {
    // fallback to localStorage if fetch fails
    document.getElementById('firstName').value = parent.first_name || '';
    document.getElementById('lastName').value = parent.last_name || '';
    document.getElementById('email').value = parent.email || '';
    showError('Failed to load profile from server. Using local data.');
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  clearMessages();
  const formData = {
    parent_id: parent.user_id,
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value
  };
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  if (currentPassword || newPassword || confirmPassword) {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Fill all password fields to change password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New password and confirm password do not match.');
      return;
    }
    formData.currentPassword = currentPassword;
    formData.newPassword = newPassword;
  }
  // Submit update
  try {
    const res = await fetch(`${API_BASE_URL}/api/parent/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to update profile');
    }
    showSuccess('Profile updated successfully!');
    // Optionally update localStorage
    parent.first_name = formData.firstName;
    parent.last_name = formData.lastName;
    parent.email = formData.email;
    localStorage.setItem('parent', JSON.stringify(parent));
    // Reset password fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  } catch (err) {
    showError(err.message || 'Failed to update profile.');
  }
}

function showError(msg) {
  const errDiv = document.getElementById('errorMessage');
  errDiv.textContent = msg;
  errDiv.classList.add('show');
}
function showSuccess(msg) {
  const succDiv = document.getElementById('successMessage');
  succDiv.textContent = msg;
  succDiv.classList.add('show');
  setTimeout(() => {
    succDiv.classList.remove('show');
    window.location.href = 'parentDashboard.html';
  }, 1500);
}
function clearMessages() {
  document.getElementById('errorMessage').classList.remove('show');
  document.getElementById('successMessage').classList.remove('show');
} 