// Load student data from localStorage
const student = JSON.parse(localStorage.getItem('student'));
if (!student) {
  window.location.href = 'studentLogin.html';
  throw new Error('Student not found');
}

// API base URL
const API_BASE_URL = 'http://localhost:5000';

// Display student name
document.getElementById('studentName').textContent = student.username || 'Student';

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
    `api/student/${student.user_id}/assignments`,
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
    upcomingContainer.innerHTML = '<li class="no-data">No assignments available</li>';
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
      fetchAssignments();
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
  fetchGrades();
  fetchAttendance();
  fetchMaterials();
  fetchAssignments();
  checkUnreadMessages();

  // Set interval to check for new messages every 30 seconds
  setInterval(checkUnreadMessages, 30000);

  // Logout functionality
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('student');
    window.location.href = 'studentLogin.html';
  });
});