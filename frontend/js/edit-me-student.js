// Edit Me Student JS
const API_BASE_URL = 'http://localhost:5000';
let student = null;

document.addEventListener('DOMContentLoaded', () => {
  // Load student from localStorage
  student = JSON.parse(localStorage.getItem('student'));
  if (!student) {
    window.location.href = 'studentLogin.html';
    return;
  }
  // Fill sidebar info
  document.getElementById('studentName').textContent = `${student.first_name || 'Student'} ${student.last_name || ''}`;
  document.getElementById('studentId').textContent = `ID: ${student.username || student.student_id}`;
  document.getElementById('studentClass').textContent = `Class: ${student.class_name || 'N/A'}`;

  // Load current profile data
  loadProfile();

  // Form submit
  document.getElementById('editStudentForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'studentDashboard.html';
  });
});

async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/student/profile?user_id=${student.student_id}`);
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
    user_id: student.student_id,
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
    const res = await fetch(`${API_BASE_URL}/api/student/update-profile`, {
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
    student.first_name = formData.firstName;
    student.last_name = formData.lastName;
    student.email = formData.email;
    localStorage.setItem('student', JSON.stringify(student));
    // Reset password fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    // Redirect to dashboard after short delay
    setTimeout(() => {
      window.location.href = 'studentDashboard.html';
    }, 1000);
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