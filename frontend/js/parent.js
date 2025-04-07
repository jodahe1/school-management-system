// DOM Elements
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const logoutButton = document.getElementById('logoutButton');

// State
let parent_id = null;

// -------------------------
// Helper: Load list items
// -------------------------
async function loadList(apiUrl, listElement, renderItem) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();

    if (listElement) {
      listElement.innerHTML = ''; // Clear previous content or loading msg
      data.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = renderItem(item);
        listElement.appendChild(li);
      });
    }
  } catch (error) {
    console.error(`Error loading from ${apiUrl}:`, error);
    if (listElement) {
      listElement.innerHTML = `<li style="color: red;">Error loading data.</li>`;
    }
  }
}

// -------------------------
// Login Logic
// -------------------------
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:5000/api/parent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Invalid username or password');
      }

      const data = await response.json();
      parent_id = data.parent_id;
      localStorage.setItem('parent_id', parent_id);
      window.location.href = 'parentDashboard.html';
    } catch (error) {
      if (errorMessage) {
        errorMessage.textContent = error.message;
        errorMessage.style.color = 'red';
      }
    }
  });
}

// -------------------------
// Logout Logic
// -------------------------
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('parent_id');
    window.location.href = 'parentLogin.html';
  });
}

// -------------------------
// Dashboard Logic
// -------------------------
document.addEventListener('DOMContentLoaded', async () => {
  parent_id = localStorage.getItem('parent_id');

  // Only proceed if parent_id exists (i.e., user is logged in)
  if (!parent_id) {
    if (window.location.pathname.includes('parentDashboard')) {
      window.location.href = 'parentLogin.html';
    }
    return;
  }

  // Profiles
  loadList(
    `http://localhost:5000/api/parent/children?parent_id=${parent_id}`,
    document.getElementById('profilesList'),
    (profile) => `${profile.first_name} ${profile.last_name} (${profile.class_name})`
  );

  // Grades
  loadList(
    `http://localhost:5000/api/parent/grades?parent_id=${parent_id}`,
    document.getElementById('gradesList'),
    (grade) => `${grade.student_name}: ${grade.subject_name} - ${grade.grade}`
  );

  // Attendance
  loadList(
    `http://localhost:5000/api/parent/attendance?parent_id=${parent_id}`,
    document.getElementById('attendanceList'),
    (record) => `${record.student_name}: ${record.date} - ${record.status}`
  );

  // Materials
  loadList(
    `http://localhost:5000/api/parent/materials?parent_id=${parent_id}`,
    document.getElementById('materialsList'),
    (material) => `<a href="${material.file_path}" target="_blank">${material.title}</a>`
  );

  // Assignments
  loadList(
    `http://localhost:5000/api/parent/assignments?parent_id=${parent_id}`,
    document.getElementById('assignmentsList'),
    (assignment) => `<a href="${assignment.file_path}" target="_blank">${assignment.title}</a> (Due: ${assignment.due_date})`
  );

  // Submissions
  loadList(
    `http://localhost:5000/api/parent/submissions?parent_id=${parent_id}`,
    document.getElementById('submissionsList'),
    (submission) => `<a href="${submission.submitted_file_path}" target="_blank">${submission.assignment_title}</a> (Grade: ${submission.grade})`
  );
});
