// DOM Elements
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const logoutButton = document.getElementById('logoutButton');

// State
let parent = null;

// -------------------------
// Helper: Show toast notification
// -------------------------
function showToast(message, isError = true) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

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
      // Store parent data (modify backend to return full user info if needed)
      const parentData = {
        user_id: data.parent_id,
        first_name: username, // Placeholder; update backend to return names
        last_name: '',
        email: `${username}@school.com` // Placeholder
      };
      localStorage.setItem('parent', JSON.stringify(parentData));
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
    localStorage.removeItem('parent');
    window.location.href = 'parentLogin.html';
  });
}

// -------------------------
// Check for unread messages
// -------------------------
async function checkUnreadMessages() {
  try {
    const response = await fetch(`http://localhost:5000/api/message-board/messages?user_id=${parent.user_id}&role=parent`);
    if (!response.ok) throw new Error('Failed to check messages');
    
    const messages = await response.json();
    const lastRead = localStorage.getItem('lastMessageRead') || '1970-01-01T00:00:00Z';
    const unreadCount = messages.filter(msg => new Date(msg.posted_at) > new Date(lastRead)).length;
    updateMessageBadge(unreadCount);
  } catch (error) {
    console.error('Error checking messages:', error);
  }
}

// -------------------------
// Update message notification badge
// -------------------------
function updateMessageBadge(count) {
  const badge = document.getElementById('messageBadge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// -------------------------
// Dashboard Logic
// -------------------------
document.addEventListener('DOMContentLoaded', async () => {
  parent = JSON.parse(localStorage.getItem('parent'));

  // Only proceed if parent exists (i.e., user is logged in)
  if (!parent || !parent.user_id) {
    if (window.location.pathname.includes('parentDashboard')) {
      window.location.href = 'parentLogin.html';
    }
    return;
  }

  // Profiles
  loadList(
    `http://localhost:5000/api/parent/children?parent_id=${parent.user_id}`,
    document.getElementById('profilesList'),
    (profile) => `${profile.first_name} ${profile.last_name} (${profile.class_name})`
  );

  // Grades
  loadList(
    `http://localhost:5000/api/parent/grades?parent_id=${parent.user_id}`,
    document.getElementById('gradesList'),
    (grade) => `${grade.student_name}: ${grade.subject_name} - ${grade.grade}`
  );

  // Attendance
  loadList(
    `http://localhost:5000/api/parent/attendance?parent_id=${parent.user_id}`,
    document.getElementById('attendanceList'),
    (record) => `${record.student_name}: ${record.date} - ${record.status}`
  );

  // Materials
  loadList(
    `http://localhost:5000/api/parent/materials?parent_id=${parent.user_id}`,
    document.getElementById('materialsList'),
    (material) => `<a href="${material.file_path}" target="_blank">${material.title}</a>`
  );

  // Assignments
  loadList(
    `http://localhost:5000/api/parent/assignments?parent_id=${parent.user_id}`,
    document.getElementById('assignmentsList'),
    (assignment) => `<a href="${assignment.file_path}" target="_blank">${assignment.title}</a> (Due: ${assignment.due_date})`
  );

  // Submissions
  loadList(
    `http://localhost:5000/api/parent/submissions?parent_id=${parent.user_id}`,
    document.getElementById('submissionsList'),
    (submission) => `<a href="${submission.submitted_file_path}" target="_blank">${submission.assignment_title}</a> (Grade: ${submission.grade})`
  );

  // Check unread messages
  await checkUnreadMessages();
  setInterval(checkUnreadMessages, 30000);
});