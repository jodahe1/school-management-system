// DOM Elements
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const logoutButton = document.getElementById('logoutButton');

// State
let parent = null;
let childrenData = [];
let selectedChildId = null;

// API Base URL
const API_BASE_URL = 'http://localhost:5000';

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
// Helper: API call with error handling
// -------------------------
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

// -------------------------
// Update parent info in sidebar
// -------------------------
function updateParentInfo() {
  if (!parent) return;
  
  // Update sidebar info
  document.getElementById('parentName').textContent = parent.username || 'Parent';
  document.getElementById('parentId').textContent = `ID: ${parent.user_id}`;
  
  // Update dashboard info card
  document.getElementById('dashboardParentName').textContent = parent.username || 'Parent';
  document.getElementById('dashboardParentId').textContent = parent.user_id;
  
  if (selectedChildId) {
    const child = childrenData.find(c => c.student_id === selectedChildId);
    if (child) {
      const childName = `${child.first_name} ${child.last_name}`;
      document.getElementById('viewingChild').textContent = `Viewing: ${childName}`;
      document.getElementById('dashboardViewingChild').textContent = childName;
    }
  } else {
    document.getElementById('viewingChild').textContent = 'Viewing: All Children';
    document.getElementById('dashboardViewingChild').textContent = 'All Children';
  }
}

// -------------------------
// Navigation handling
// -------------------------
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.full-width-section, .dashboard-section').forEach(section => {
    section.classList.add('section-hidden');
  });
  
  // Show selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove('section-hidden');
  }
  
  // Update active navigation
  document.querySelectorAll('nav ul li').forEach(li => {
    li.classList.remove('active');
  });
  
  const activeLink = document.querySelector(`nav ul li a[href="#${sectionId}"]`);
  if (activeLink) {
    activeLink.parentElement.classList.add('active');
  }

  // Load data for the selected section
  switch (sectionId) {
    case 'attendance':
      loadAttendance();
      break;
    case 'unsubmitted-assignments':
      loadUnsubmittedAssignments();
      break;
    case 'submitted-assignments':
      loadSubmittedAssignments();
      break;
    case 'grades':
      loadGrades();
      break;
    case 'materials':
      loadMaterials();
      break;
  }
}

// -------------------------
// Load and display children profiles
// -------------------------
async function loadChildrenProfiles() {
  const childrenGrid = document.getElementById('childrenGrid');
  
  try {
    const children = await fetchWithErrorHandling(
      `api/parent/children?parent_id=${parent.user_id}`,
      'Failed to load children profiles'
    );

    if (!children || children.length === 0) {
      childrenGrid.innerHTML = `
        <div class="no-data">
          <i class="fas fa-users" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
          <p>No children profiles found</p>
        </div>
      `;
      return;
    }

    childrenData = children; // Store for modal use
    
    childrenGrid.innerHTML = children.map(child => `
      <div class="child-card" onclick="showChildDetails(${child.student_id})">
        <h3>${child.first_name} ${child.last_name}</h3>
        <div class="child-info">
          <p><i class="fas fa-graduation-cap"></i> ${child.class_name}</p>
          <p><i class="fas fa-id-card"></i> ID: ${child.student_id}</p>
        </div>
        <div class="child-stats">
          <div class="stat-item">
            <div class="stat-value">${child.class_name.split(' ')[0]}</div>
            <div class="stat-label">Grade</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${child.student_id}</div>
            <div class="stat-label">Student ID</div>
          </div>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading children profiles:', error);
    childrenGrid.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
        <p>Failed to load children profiles. Please try again.</p>
      </div>
    `;
  }
}

// -------------------------
// Load attendance data
// -------------------------
async function loadAttendance() {
  const attendanceContainer = document.getElementById('attendanceContainer');
  
  try {
    const attendance = await fetchWithErrorHandling(
      `api/parent/attendance?parent_id=${parent.user_id}`,
      'Failed to load attendance data'
    );

    if (!attendance || attendance.length === 0) {
      attendanceContainer.innerHTML = '<p>No attendance records available</p>';
      return;
    }

    // Group attendance by student
    const attendanceByStudent = {};
    attendance.forEach(record => {
      if (!attendanceByStudent[record.student_name]) {
        attendanceByStudent[record.student_name] = [];
      }
      attendanceByStudent[record.student_name].push(record);
    });

    attendanceContainer.innerHTML = Object.entries(attendanceByStudent).map(([studentName, records]) => `
      <div class="attendance-card">
        <h3>${studentName}</h3>
        <table class="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Subject</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(record => `
              <tr class="${record.status.toLowerCase()}">
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${record.subject_name}</td>
                <td>${record.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('');

  } catch (error) {
    attendanceContainer.innerHTML = '<p>Error loading attendance data</p>';
  }
}

// -------------------------
// Load unsubmitted assignments (reuse student dashboard logic)
// -------------------------
async function loadUnsubmittedAssignments() {
  const gridContainer = document.getElementById('unsubmittedAssignmentsGrid');
  
  try {
    // Get all assignments for children's classes
    const assignments = await fetchWithErrorHandling(
      `api/parent/assignments?parent_id=${parent.user_id}`,
      'Failed to load assignments'
    );

    if (!assignments || assignments.length === 0) {
      gridContainer.innerHTML = '<p>No assignments found</p>';
      return;
    }

    // Get submissions to filter out submitted assignments
    const submissions = await fetchWithErrorHandling(
      `api/parent/submissions?parent_id=${parent.user_id}`,
      'Failed to load submissions'
    );

    const submittedAssignmentIds = submissions ? submissions.map(s => s.assignment_id) : [];

    // Filter unsubmitted assignments
    const unsubmittedAssignments = assignments.filter(assignment => 
      !submittedAssignmentIds.includes(assignment.assignment_id)
    );

    if (unsubmittedAssignments.length === 0) {
      gridContainer.innerHTML = '<p>No unsubmitted assignments found</p>';
      return;
    }

    gridContainer.innerHTML = unsubmittedAssignments.map(assignment => `
      <div class="assignment-card unsubmitted">
        <div class="assignment-header">
          <h3 class="assignment-title">${assignment.title || 'Untitled Assignment'}</h3>
          <span class="assignment-subject">${assignment.subject_name || 'General'}</span>
        </div>
        <div class="assignment-details">
          <p><strong>Due Date:</strong> ${new Date(assignment.due_date).toLocaleDateString()}</p>
          <p><strong>Class:</strong> ${assignment.class_name}</p>
          <p><strong>Description:</strong> ${assignment.description || 'No description provided'}</p>
        </div>
        <div class="assignment-actions">
          ${assignment.file_path ? `<a href="${assignment.file_path}" target="_blank" class="btn btn-download">
            <i class="fas fa-download"></i> Download
          </a>` : ''}
        </div>
      </div>
    `).join('');

  } catch (error) {
    gridContainer.innerHTML = '<p>Error loading assignments</p>';
  }
}

// -------------------------
// Load submitted assignments (reuse student dashboard logic)
// -------------------------
async function loadSubmittedAssignments() {
  const gridContainer = document.getElementById('submittedAssignmentsGrid');
  
  try {
    const submissions = await fetchWithErrorHandling(
      `api/parent/submissions?parent_id=${parent.user_id}`,
      'Failed to load submissions'
    );

    if (!submissions || submissions.length === 0) {
      gridContainer.innerHTML = '<p>No submitted assignments found</p>';
      return;
    }

    gridContainer.innerHTML = submissions.map(submission => `
      <div class="assignment-card ${submission.grade ? 'graded' : 'submitted'}">
        <div class="assignment-header">
          <h3 class="assignment-title">${submission.assignment_title || 'Untitled Assignment'}</h3>
          <span class="assignment-subject">${submission.subject_name || 'General'}</span>
        </div>
        <div class="assignment-details">
          <p><strong>Student:</strong> ${submission.student_name}</p>
          <p><strong>Submitted:</strong> ${new Date(submission.submission_date).toLocaleDateString()}</p>
          ${submission.grade ? `<p><strong>Grade:</strong> ${submission.grade}</p>` : ''}
        </div>
        <div class="assignment-actions">
          <a href="${submission.submitted_file_path}" target="_blank" class="btn btn-view">
            <i class="fas fa-eye"></i> View Submission
          </a>
          ${submission.feedback ? `<span class="feedback">${submission.feedback}</span>` : ''}
        </div>
      </div>
    `).join('');

  } catch (error) {
    gridContainer.innerHTML = '<p>Error loading submissions</p>';
  }
}

// -------------------------
// Load grades (reuse student dashboard logic)
// -------------------------
async function loadGrades() {
  const gradesContainer = document.getElementById('gradesContainer');
  
  try {
    const grades = await fetchWithErrorHandling(
      `api/parent/grades?parent_id=${parent.user_id}`,
      'Failed to load grades'
    );

    if (!grades || grades.length === 0) {
      gradesContainer.innerHTML = '<p>No grades available</p>';
      return;
    }

    // Group grades by student
    const gradesByStudent = {};
    grades.forEach(grade => {
      if (!gradesByStudent[grade.student_name]) {
        gradesByStudent[grade.student_name] = [];
      }
      gradesByStudent[grade.student_name].push(grade);
    });

    gradesContainer.innerHTML = Object.entries(gradesByStudent).map(([studentName, studentGrades]) => `
      <div class="grade-card">
        <h3>${studentName}</h3>
        ${studentGrades.map(grade => `
          <div class="grade-item">
            <div class="grade-info">
              <strong>${grade.subject_name}</strong> - ${grade.semester_name}
              ${grade.comments ? `<br><small>${grade.comments}</small>` : ''}
            </div>
            <div class="grade-value">${grade.grade || 'N/A'}</div>
          </div>
        `).join('')}
      </div>
    `).join('');

  } catch (error) {
    gradesContainer.innerHTML = '<p>Error loading grades</p>';
  }
}

// -------------------------
// Load materials
// -------------------------
async function loadMaterials() {
  const materialsGrid = document.getElementById('materialsGrid');
  
  try {
    const materials = await fetchWithErrorHandling(
      `api/parent/materials?parent_id=${parent.user_id}`,
      'Failed to load materials'
    );

    if (!materials || materials.length === 0) {
      materialsGrid.innerHTML = '<p>No materials available</p>';
      return;
    }

    materialsGrid.innerHTML = materials.map(material => `
      <div class="material-card">
        <h3>${material.title || 'Untitled Material'}</h3>
        <p><strong>Class:</strong> ${material.class_name}</p>
        <p><strong>Subject:</strong> ${material.subject_name}</p>
        <p><strong>Semester:</strong> ${material.semester_name}</p>
        ${material.file_path ? `<a href="${material.file_path}" target="_blank" class="download-btn">
          <i class="fas fa-download"></i> Download
        </a>` : ''}
      </div>
    `).join('');

  } catch (error) {
    materialsGrid.innerHTML = '<p>Error loading materials</p>';
  }
}

// -------------------------
// Show child details modal
// -------------------------
async function showChildDetails(studentId) {
  const child = childrenData.find(c => c.student_id === studentId);
  if (!child) return;

  selectedChildId = studentId;
  updateParentInfo();

  const modal = document.getElementById('childModal');
  
  // Update modal header
  document.getElementById('modalChildName').textContent = `${child.first_name} ${child.last_name}`;
  document.getElementById('modalChildId').textContent = `ID: ${child.student_id}`;
  document.getElementById('modalChildClass').textContent = child.class_name;
  document.getElementById('modalChildDOB').textContent = new Date(child.date_of_birth).toLocaleDateString();

  // Load child-specific data
  await loadChildGrades(studentId);
  await loadChildAttendance(studentId);

  // Show modal
  modal.style.display = 'block';
}

// -------------------------
// Load child grades for modal
// -------------------------
async function loadChildGrades(studentId) {
  const gradesContainer = document.getElementById('modalChildGrades');
  
  try {
    const grades = await fetchWithErrorHandling(
      `api/parent/grades?parent_id=${parent.user_id}`,
      'Failed to load grades'
    );

    if (!grades || grades.length === 0) {
      gradesContainer.innerHTML = '<p>No grades available</p>';
      return;
    }

    // Filter grades for this specific child
    const childGrades = grades.filter(grade => 
      grade.student_name === `${childrenData.find(c => c.student_id === studentId)?.first_name} ${childrenData.find(c => c.student_id === studentId)?.last_name}`
    );

    if (childGrades.length === 0) {
      gradesContainer.innerHTML = '<p>No grades available for this child</p>';
      return;
    }

    gradesContainer.innerHTML = childGrades.map(grade => `
      <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: white; border-radius: 4px;">
        <strong>${grade.subject_name}</strong> - ${grade.grade || 'N/A'}
        ${grade.comments ? `<br><small style="color: #666;">${grade.comments}</small>` : ''}
      </div>
    `).join('');

  } catch (error) {
    gradesContainer.innerHTML = '<p>Error loading grades</p>';
  }
}

// -------------------------
// Load child attendance for modal
// -------------------------
async function loadChildAttendance(studentId) {
  const attendanceContainer = document.getElementById('modalChildAttendance');
  
  try {
    const attendance = await fetchWithErrorHandling(
      `api/parent/attendance?parent_id=${parent.user_id}`,
      'Failed to load attendance'
    );

    if (!attendance || attendance.length === 0) {
      attendanceContainer.innerHTML = '<p>No attendance records available</p>';
      return;
    }

    // Filter attendance for this specific child
    const childAttendance = attendance.filter(record => 
      record.student_name === `${childrenData.find(c => c.student_id === studentId)?.first_name} ${childrenData.find(c => c.student_id === studentId)?.last_name}`
    );

    if (childAttendance.length === 0) {
      attendanceContainer.innerHTML = '<p>No attendance records for this child</p>';
      return;
    }

    // Show recent attendance (last 5 records)
    const recentAttendance = childAttendance.slice(0, 5);
    
    attendanceContainer.innerHTML = recentAttendance.map(record => `
      <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: white; border-radius: 4px;">
        <strong>${record.date}</strong> - ${record.status}
        <br><small style="color: #666;">${record.subject_name}</small>
      </div>
    `).join('');

  } catch (error) {
    attendanceContainer.innerHTML = '<p>Error loading attendance</p>';
  }
}

// -------------------------
// Close modal
// -------------------------
function closeModal() {
  const modal = document.getElementById('childModal');
  modal.style.display = 'none';
  selectedChildId = null;
  updateParentInfo();
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
      const response = await fetch(`${API_BASE_URL}/api/parent/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Invalid username or password');
      }

      const data = await response.json();
      
      // Check if this is a first-time login
      if (data.parent.password_reset_required) {
        // Store temporary data for first-time login
        localStorage.setItem('tempUserData', JSON.stringify({
          user_id: data.parent.user_id,
          username: data.parent.username,
          password: password, // Store password temporarily for verification
          role: 'parent'
        }));
        window.location.href = 'firstTimeLogin.html';
      } else {
        // Normal login - store parent data and redirect to dashboard
        localStorage.setItem('parent', JSON.stringify(data.parent));
        window.location.href = 'parentDashboard.html';
      }
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
    const response = await fetch(`${API_BASE_URL}/api/message-board/messages?user_id=${parent.user_id}&role=parent`);
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

  // Update parent info
  updateParentInfo();

  // Load children profiles
  await loadChildrenProfiles();

  // Check unread messages
  await checkUnreadMessages();
  setInterval(checkUnreadMessages, 30000);

  // Navigation event listeners
  document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('href').substring(1);
      showSection(sectionId);
    });
  });

  // Refresh button event listeners
  document.getElementById('refreshAttendance')?.addEventListener('click', loadAttendance);
  document.getElementById('refreshUnsubmitted')?.addEventListener('click', loadUnsubmittedAssignments);
  document.getElementById('refreshSubmitted')?.addEventListener('click', loadSubmittedAssignments);
  document.getElementById('refreshGrades')?.addEventListener('click', loadGrades);
  document.getElementById('refreshMaterials')?.addEventListener('click', loadMaterials);

  // Modal event listeners
  const modal = document.getElementById('childModal');
  const closeBtn = document.querySelector('.close-modal');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
});

// Make functions globally available
window.showChildDetails = showChildDetails;
window.closeModal = closeModal;