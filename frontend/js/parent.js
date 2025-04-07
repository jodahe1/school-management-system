// DOM Elements
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const logoutButton = document.getElementById('logoutButton');

let parent_id = null;

// Login Logic
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
        throw new Error('Invalid username or password');
      }

      const data = await response.json();
      parent_id = data.parent_id;
      localStorage.setItem('parent_id', parent_id);
      window.location.href = 'parentDashboard.html';
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  });
}

// Logout Logic
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('parent_id');
    window.location.href = 'parentLogin.html';
  });
}

// Dashboard Logic
document.addEventListener('DOMContentLoaded', async () => {
  parent_id = localStorage.getItem('parent_id');

  if (!parent_id) {
    window.location.href = 'parentLogin.html';
    return;
  }

  // Fetch and Display Children Profiles
  const profilesList = document.getElementById('profilesList');
  const profilesResponse = await fetch(`http://localhost:5000/api/parent/children?parent_id=${parent_id}`);
  const profilesData = await profilesResponse.json();
  profilesData.forEach(profile => {
    const li = document.createElement('li');
    li.textContent = `${profile.first_name} ${profile.last_name} (${profile.class_name})`;
    profilesList.appendChild(li);
  });

  // Fetch and Display Grades
  const gradesList = document.getElementById('gradesList');
  const gradesResponse = await fetch(`http://localhost:5000/api/parent/grades?parent_id=${parent_id}`);
  const gradesData = await gradesResponse.json();
  gradesData.forEach(grade => {
    const li = document.createElement('li');
    li.textContent = `${grade.student_name}: ${grade.subject_name} - ${grade.grade}`;
    gradesList.appendChild(li);
  });

  // Fetch and Display Attendance
  const attendanceList = document.getElementById('attendanceList');
  const attendanceResponse = await fetch(`http://localhost:5000/api/parent/attendance?parent_id=${parent_id}`);
  const attendanceData = await attendanceResponse.json();
  attendanceData.forEach(record => {
    const li = document.createElement('li');
    li.textContent = `${record.student_name}: ${record.date} - ${record.status}`;
    attendanceList.appendChild(li);
  });

  // Fetch and Display Materials
  const materialsList = document.getElementById('materialsList');
  const materialsResponse = await fetch(`http://localhost:5000/api/parent/materials?parent_id=${parent_id}`);
  const materialsData = await materialsResponse.json();
  materialsData.forEach(material => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${material.file_path}" target="_blank">${material.title}</a>`;
    materialsList.appendChild(li);
  });

  // Fetch and Display Assignments
  const assignmentsList = document.getElementById('assignmentsList');
  const assignmentsResponse = await fetch(`http://localhost:5000/api/parent/assignments?parent_id=${parent_id}`);
  const assignmentsData = await assignmentsResponse.json();
  assignmentsData.forEach(assignment => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${assignment.file_path}" target="_blank">${assignment.title}</a> (Due: ${assignment.due_date})`;
    assignmentsList.appendChild(li);
  });

  // Fetch and Display Submissions
  const submissionsList = document.getElementById('submissionsList');
  const submissionsResponse = await fetch(`http://localhost:5000/api/parent/submissions?parent_id=${parent_id}`);
  const submissionsData = await submissionsResponse.json();
  submissionsData.forEach(submission => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${submission.submitted_file_path}" target="_blank">${submission.assignment_title}</a> (Grade: ${submission.grade})`;
    submissionsList.appendChild(li);
  });
});