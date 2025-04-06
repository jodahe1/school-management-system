// Load student data from localStorage
const student = JSON.parse(localStorage.getItem('student'));
if (!student) window.location.href = 'studentLogin.html';

// Display student name and motivational quote
document.getElementById('studentName').textContent = student.username;

// Fetch and display grades
async function fetchGrades() {
  const response = await fetch(`/api/student/${student.user_id}/grades`);
  const grades = await response.json();
  const tableBody = document.querySelector('#gradesTable tbody');
  tableBody.innerHTML = grades
    .map(
      (grade) => `
    <tr>
      <td>${grade.subject_name}</td>
      <td>${grade.semester_name}</td>
      <td>${grade.grade}</td>
      <td>${grade.comments}</td>
    </tr>
  `
    )
    .join('');
}
fetchGrades();

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('student');
  window.location.href = 'studentLogin.html';
});

// Fetch and display attendance
async function fetchAttendance() {
  const response = await fetch(`/api/student/${student.user_id}/attendance`);
  const attendance = await response.json();
  const tableBody = document.querySelector('#attendanceDetails tbody');
  tableBody.innerHTML = attendance
    .map(
      (record) => `
    <tr>
      <td>${record.date}</td>
      <td>${record.period_number}</td>
      <td>${record.subject_name}</td>
      <td>${record.status}</td>
    </tr>
  `
    )
    .join('');
}
fetchAttendance();

// Fetch and display materials
async function fetchMaterials() {
  const response = await fetch(`/api/student/${student.user_id}/materials`);
  const materials = await response.json();
  const materialGrid = document.getElementById('materialGrid');
  materialGrid.innerHTML = materials
    .map(
      (material) => `
    <div class="material-card">
      <h3>${material.title}</h3>
      <p><strong>Subject:</strong> ${material.subject_name}</p>
      <a href="${material.file_path}" target="_blank">View Material</a>
    </div>
  `
    )
    .join('');
}
fetchMaterials();

// Fetch and display assignments
async function fetchAssignments() {
  const response = await fetch(`/api/student/${student.user_id}/assignments`);
  const assignments = await response.json();

  const pendingAssignments = assignments.filter((a) => !a.submitted_file_path);
  const submittedAssignments = assignments.filter((a) => a.submitted_file_path);

  // Display pending assignments
  const pendingContainer = document.getElementById('pendingAssignments');
  pendingContainer.innerHTML = pendingAssignments
    .map(
      (assignment) => `
    <div class="assignment-card">
      <h3>${assignment.title}</h3>
      <p><strong>Description:</strong> ${assignment.description}</p>
      <p><strong>Due Date:</strong> ${assignment.due_date}</p>
      <button onclick="submitAssignment(${assignment.assignment_id})">Submit</button>
    </div>
  `
    )
    .join('');

  // Display submitted assignments
  const submittedContainer = document.getElementById('submittedAssignments');
  submittedContainer.innerHTML = submittedAssignments
    .map(
      (assignment) => `
    <div class="assignment-card">
      <h3>${assignment.title}</h3>
      <p><strong>Submitted On:</strong> ${assignment.submission_date}</p>
      <p><strong>Grade:</strong> ${assignment.grade || 'Not graded yet'}</p>
      <p><strong>Feedback:</strong> ${assignment.feedback || 'No feedback yet'}</p>
    </div>
  `
    )
    .join('');
}
fetchAssignments();

// Submit assignment
async function submitAssignment(assignmentId) {
  const submittedFilePath = prompt('Enter the Google Drive link for your submission:');
  if (!submittedFilePath) return alert('Submission link is required.');

  try {
    const response = await fetch(`/api/student/${student.user_id}/assignments/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId, submittedFilePath }),
    });

    if (response.ok) {
      alert('Assignment submitted successfully!');
      location.reload(); // Refresh the page to reflect changes
    } else {
      alert('Failed to submit assignment.');
    }
  } catch (error) {
    console.error('Error submitting assignment:', error);
  }
}

// Additional functionality omitted for brevity