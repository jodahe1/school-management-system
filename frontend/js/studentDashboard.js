// Load student data from localStorage
const student = JSON.parse(localStorage.getItem('student'));
if (!student) {
  window.location.href = 'studentLogin.html';
  throw new Error('Student not found');
}

// API base URL
const API_BASE_URL = 'http://localhost:5000';

// Fetch and display student information in sidebar
async function fetchStudentInfo() {
  const studentInfo = await fetchWithErrorHandling(
    `api/student/${student.user_id}/info`,
    'Failed to load student information'
  );
  
  if (!studentInfo) return;

  // Update sidebar with student information
  document.getElementById('sidebarStudentName').textContent = `${studentInfo.first_name} ${studentInfo.last_name}`;
  document.getElementById('sidebarStudentId').textContent = `ID: ${studentInfo.username || student.user_id}`;
  document.getElementById('sidebarStudentClass').textContent = `Class: ${studentInfo.class_name || 'N/A'}`;

  // Add Chat button to sidebar or header
  const chatBtn = document.createElement('button');
  chatBtn.textContent = 'Chat';
  chatBtn.className = 'sidebar-btn';
  chatBtn.onclick = function() {
    localStorage.setItem('user', JSON.stringify({ userId: studentInfo.user_id, userType: 'student', userName: `${studentInfo.first_name} ${studentInfo.last_name}` }));
    window.location.href = 'chat.html';
  };
  // Add to sidebar or appropriate place in DOM
  const sidebar = document.querySelector('.sidebar') || document.body;
  sidebar.appendChild(chatBtn);
}

// Helper function for API calls
async function fetchWithErrorHandling(endpoint, errorMessage) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(errorMessage, error);
    showToast(errorMessage);
    return null;
  }
}

// Show toast notification
function showToast(message, isError = true) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Fetch and display grades
async function fetchGrades() {
  const grades = await fetchWithErrorHandling(
    `api/student/${student.user_id}/grades`,
    'Failed to load grades'
  );
  
  if (!grades) return;

  // Update grades table
  const tableBody = document.querySelector('#gradesTable tbody');
  tableBody.innerHTML = grades.length > 0 
    ? grades.map(grade => `
        <tr>
          <td>${grade.subject_name || 'N/A'}</td>
          <td>${grade.semester_name || 'N/A'}</td>
          <td>${grade.grade || 'N/A'}</td>
          <td>${grade.comments || 'No comments'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4">No grades available</td></tr>';

  // Calculate and update grade average
  updateGradeAverage(grades);
}

// Calculate and update grade average in the progress circle
function updateGradeAverage(grades) {
  const progressCircle = document.querySelector('.progress-circle-fill');
  const progressPercent = document.querySelector('.progress-percent');
  
  if (!grades || grades.length === 0) {
    // No grades available
    progressCircle.style.strokeDasharray = '0, 100';
    progressPercent.textContent = 'N/A';
    return;
  }

  // Filter out grades that are not numeric
  const numericGrades = grades.filter(grade => {
    const gradeValue = parseFloat(grade.grade);
    return !isNaN(gradeValue) && gradeValue >= 0 && gradeValue <= 100;
  });

  if (numericGrades.length === 0) {
    // No valid grades found
    progressCircle.style.strokeDasharray = '0, 100';
    progressPercent.textContent = 'N/A';
    return;
  }

  // Calculate average
  const totalGrade = numericGrades.reduce((sum, grade) => sum + parseFloat(grade.grade), 0);
  const averageGrade = Math.round(totalGrade / numericGrades.length);
  
  // Update progress circle
  const circumference = 2 * Math.PI * 15.9155; // r = 15.9155
  const progress = (averageGrade / 100) * circumference;
  const remaining = circumference - progress;
  
  progressCircle.style.strokeDasharray = `${progress}, ${remaining}`;
  progressPercent.textContent = `${averageGrade}%`;
  
  // Update color based on grade
  if (averageGrade >= 90) {
    progressCircle.style.stroke = '#4bb543'; // Green for A
  } else if (averageGrade >= 80) {
    progressCircle.style.stroke = '#4895ef'; // Blue for B
  } else if (averageGrade >= 70) {
    progressCircle.style.stroke = '#fca311'; // Orange for C
  } else if (averageGrade >= 60) {
    progressCircle.style.stroke = '#ff6b35'; // Red-orange for D
  } else {
    progressCircle.style.stroke = '#ef233c'; // Red for F
  }
}

// Fetch and display attendance
async function fetchAttendance() {
  const attendance = await fetchWithErrorHandling(
    `api/student/${student.user_id}/attendance`,
    'Failed to load attendance'
  );
  
  if (!attendance) return;

  const tableBody = document.querySelector('#attendanceDetails tbody');
  tableBody.innerHTML = attendance.length > 0
    ? attendance.map(record => `
        <tr>
          <td>${new Date(record.date).toLocaleDateString() || 'N/A'}</td>
          <td>${record.period_number || 'N/A'}</td>
          <td>${record.subject_name || 'N/A'}</td>
          <td class="${record.status.toLowerCase()}">${record.status || 'N/A'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4">No attendance records available</td></tr>';
}

// Fetch and display materials
async function fetchMaterials() {
  const materials = await fetchWithErrorHandling(
    `api/student/${student.user_id}/materials`,
    'Failed to load materials'
  );
  
  if (!materials) return;

  const materialGrid = document.getElementById('materialGrid');
  materialGrid.innerHTML = materials.length > 0
    ? materials.map(material => `
        <div class="material-card">
          <h3>${material.title || 'Untitled Material'}</h3>
          <p><strong>Subject:</strong> ${material.subject_name || 'General'}</p>
          <p><strong>Uploaded:</strong> ${new Date(material.uploaded_at).toLocaleDateString()}</p>
          <a href="${material.file_path}" target="_blank" class="download-btn">Download</a>
        </div>
      `).join('')
    : '<p class="no-data">No materials available</p>';
}

// Fetch and display assignments
async function fetchAssignments() {
  const assignments = await fetchWithErrorHandling(
    `api/student/${student.user_id}/assignments/not-submitted`,
    'Failed to load assignments'
  );

  if (!assignments) return;

  // Display assignments in the upcomingAssignments container
  const upcomingContainer = document.getElementById('upcomingAssignments');
  if (assignments.length > 0) {
    upcomingContainer.innerHTML = assignments.map(assignment => `
      <li class="assignment-item">
        <div class="assignment-info">
          <h4>${assignment.title || 'Untitled Assignment'}</h4>
          <p><strong>Subject:</strong> ${assignment.subject_name || 'N/A'}</p>
          <p><strong>Due:</strong> ${new Date(assignment.due_date).toLocaleDateString()}</p>
          <p><strong>Description:</strong> ${assignment.description || 'No description'}</p>
        </div>
        <div class="assignment-actions">
          <button onclick="submitAssignment(${assignment.assignment_id})" class="submit-btn">
            <i class="fas fa-upload"></i> Submit
          </button>
          ${assignment.file_path ? `<a href="${assignment.file_path}" target="_blank" class="download-btn">
            <i class="fas fa-download"></i> Download
          </a>` : ''}
        </div>
      </li>
    `).join('');
  } else {
    upcomingContainer.innerHTML = '<li class="no-data">No upcoming assignments</li>';
  }
}

// Fetch and display not submitted assignments
async function fetchNotSubmittedAssignments() {
  const assignments = await fetchWithErrorHandling(
    `api/student/${student.user_id}/assignments/not-submitted`,
    'Failed to load not submitted assignments'
  );

  if (!assignments) return;

  const gridContainer = document.getElementById('notSubmittedAssignmentsGrid');
  if (assignments.length > 0) {
    gridContainer.innerHTML = assignments.map(assignment => `
      <div class="assignment-card not-submitted">
        <div class="assignment-header">
          <h3 class="assignment-title">${assignment.title || 'Untitled Assignment'}</h3>
          <span class="assignment-subject">${assignment.subject_name || 'General'}</span>
        </div>
        <div class="assignment-details">
          <p><strong>Due Date:</strong> ${new Date(assignment.due_date).toLocaleDateString()}</p>
          <p><strong>Description:</strong> ${assignment.description || 'No description provided'}</p>
        </div>
        <div class="assignment-actions">
          <button onclick="submitAssignment(${assignment.assignment_id})" class="btn btn-submit">
            <i class="fas fa-upload"></i> Submit Assignment
          </button>
          ${assignment.file_path ? `<a href="${assignment.file_path}" target="_blank" class="btn btn-download">
            <i class="fas fa-download"></i> Download
          </a>` : ''}
        </div>
      </div>
    `).join('');
  } else {
    gridContainer.innerHTML = '<div class="no-data">No pending assignments to submit</div>';
  }
}

// Fetch and display submitted assignments
async function fetchSubmittedAssignments() {
  const assignments = await fetchWithErrorHandling(
    `api/student/${student.user_id}/assignments/submitted`,
    'Failed to load submitted assignments'
  );

  if (!assignments) return;

  const gridContainer = document.getElementById('submittedAssignmentsGrid');
  if (assignments.length > 0) {
    gridContainer.innerHTML = assignments.map(assignment => `
      <div class="assignment-card ${assignment.grade ? 'graded' : 'submitted'}">
        <div class="assignment-header">
          <h3 class="assignment-title">${assignment.title || 'Untitled Assignment'}</h3>
          <span class="assignment-subject">${assignment.subject_name || 'General'}</span>
        </div>
        <div class="assignment-details">
          <p><strong>Due Date:</strong> ${new Date(assignment.due_date).toLocaleDateString()}</p>
          <p><strong>Submitted:</strong> ${new Date(assignment.submission_date).toLocaleDateString()}</p>
          <p><strong>Description:</strong> ${assignment.description || 'No description provided'}</p>
        </div>
        <div class="assignment-actions">
          <span class="assignment-status ${assignment.grade ? 'status-graded' : 'status-submitted'}">
            <i class="fas ${assignment.grade ? 'fa-star' : 'fa-check'}"></i>
            ${assignment.grade ? 'Graded' : 'Submitted'}
          </span>
          <a href="${assignment.submitted_file_path}" target="_blank" class="btn btn-view">
            <i class="fas fa-eye"></i> View Submission
          </a>
          ${assignment.file_path ? `<a href="${assignment.file_path}" target="_blank" class="btn btn-download">
            <i class="fas fa-download"></i> Download Original
          </a>` : ''}
        </div>
        ${assignment.grade ? `
          <div class="grade-info">
            <h4><i class="fas fa-star"></i> Grade Information</h4>
            <p><strong>Grade:</strong> ${assignment.grade}</p>
            ${assignment.feedback ? `<div class="feedback-text">
              <strong>Feedback:</strong> ${assignment.feedback}
            </div>` : ''}
          </div>
        ` : ''}
      </div>
    `).join('');
  } else {
    gridContainer.innerHTML = '<div class="no-data">No submitted assignments found</div>';
  }
}

// Submit assignment
async function submitAssignment(assignmentId) {
  const submittedFilePath = prompt('Enter the path to your submission file:');
  if (!submittedFilePath) {
    showToast('Submission path is required.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/student/${student.user_id}/assignments/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId, submittedFilePath }),
    });

    if (response.ok) {
      showToast('Assignment submitted successfully!', false);
      // Refresh both assignment sections
      fetchAssignments();
      fetchNotSubmittedAssignments();
      fetchSubmittedAssignments();
    } else {
      const errorData = await response.json();
      showToast(errorData.message || 'Failed to submit assignment.');
    }
  } catch (error) {
    console.error('Error submitting assignment:', error);
    showToast('An error occurred while submitting. Please try again.');
  }
}

// Check for unread messages
async function checkUnreadMessages() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/message-board/messages?user_id=${student.user_id}&role=student`);
    if (!response.ok) throw new Error('Failed to check messages');
    
    const messages = await response.json();
    // Get last read timestamp from localStorage
    const lastRead = localStorage.getItem('lastMessageRead') || '1970-01-01T00:00:00Z';
    const unreadCount = messages.filter(msg => new Date(msg.posted_at) > new Date(lastRead)).length;
    updateMessageBadge(unreadCount);
  } catch (error) {
    console.error('Error checking messages:', error);
  }
}

// Update message notification badge
function updateMessageBadge(count) {
  const badge = document.getElementById('messageBadge');
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}
// Add this to your initialization code
async function updateAnnouncementBadge() {
  try {
    const student = JSON.parse(localStorage.getItem('student'));
    if (!student) return;
    
    const response = await fetch(
      `http://localhost:5000/api/student/${student.student_id}/announcements/unread-count`
    );
    
    if (response.ok) {
      const data = await response.json();
      const badge = document.getElementById('announcementBadge');
      badge.textContent = data.count || '0';
      badge.style.display = data.count > 0 ? 'flex' : 'none';
    }
  } catch (error) {
    console.error('Error updating announcement badge:', error);
  }
}

// Call this when the page loads and periodically
document.addEventListener('DOMContentLoaded', () => {
  updateAnnouncementBadge();
  // Update every 5 minutes
  setInterval(updateAnnouncementBadge, 300000);
});
// Initialize all data fetches when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  fetchStudentInfo();
  fetchGrades();
  fetchAttendance();
  fetchMaterials();
  fetchAssignments();
  fetchNotSubmittedAssignments();
  fetchSubmittedAssignments();
  checkUnreadMessages();

  // Set interval to check for new messages every 30 seconds
  setInterval(checkUnreadMessages, 30000);

  // Add refresh button event listeners
  document.getElementById('refreshGrades')?.addEventListener('click', fetchGrades);
  document.getElementById('refreshNotSubmitted')?.addEventListener('click', fetchNotSubmittedAssignments);
  document.getElementById('refreshSubmitted')?.addEventListener('click', fetchSubmittedAssignments);

  // Logout functionality
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('student');
    window.location.href = 'studentLogin.html';
  });
});