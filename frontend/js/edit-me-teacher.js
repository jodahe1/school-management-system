// Edit Me Teacher JS
const API_BASE_URL = 'http://localhost:5000';
let teacher = null;

document.addEventListener('DOMContentLoaded', () => {
  // Load teacher from localStorage
  teacher = JSON.parse(localStorage.getItem('teacher'));
  if (!teacher) {
    window.location.href = 'teacherLogin.html';
    return;
  }
  // Fill sidebar info
  document.getElementById('teacherName').textContent = `${teacher.first_name || 'Teacher'} ${teacher.last_name || ''}`;
  document.getElementById('teacherId').textContent = `ID: ${teacher.user_id}`;
  document.getElementById('teacherSubject').textContent = `Subject: ${teacher.subject_teaches || 'N/A'}`;

  // Load current profile data
  loadProfile();

  // Form submit
  document.getElementById('editTeacherForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'teacherDashboard.html';
  });
});

async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/teacher/profile?teacher_id=${teacher.user_id}`);
    if (!res.ok) throw new Error('Failed to load profile');
    const data = await res.json();
    document.getElementById('firstName').value = data.first_name || '';
    document.getElementById('lastName').value = data.last_name || '';
    document.getElementById('email').value = data.email || '';
  } catch (err) {
    showError('Failed to load profile.');
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  clearMessages();
  const formData = {
    teacher_id: teacher.user_id,
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
    const res = await fetch(`${API_BASE_URL}/api/teacher/update-profile`, {
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
    teacher.first_name = formData.firstName;
    teacher.last_name = formData.lastName;
    teacher.email = formData.email;
    localStorage.setItem('teacher', JSON.stringify(teacher));
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
  setTimeout(() => succDiv.classList.remove('show'), 4000);
}
function clearMessages() {
  document.getElementById('errorMessage').classList.remove('show');
  document.getElementById('successMessage').classList.remove('show');
} 