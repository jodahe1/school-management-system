// Modern Teacher Dashboard JavaScript
const API_BASE_URL = 'http://localhost:5000';

// Load teacher data from localStorage
    const teacher = JSON.parse(localStorage.getItem('teacher'));
    if (!teacher) {
        window.location.href = 'teacherLogin.html';
    throw new Error('Teacher not found');
}

// State management
let currentSection = 'profile';
let currentClassId = null;
let studentsData = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    loadProfileData();
});

// Initialize dashboard
function initializeDashboard() {
    updateTeacherInfo();
    showSection('profile');
}

// Update teacher information in sidebar
function updateTeacherInfo() {
    document.getElementById('teacherName').textContent = `${teacher.first_name || 'Teacher'} ${teacher.last_name || ''}`;
    document.getElementById('teacherId').textContent = `ID: ${teacher.user_id}`;
    document.getElementById('teacherSubject').textContent = `Subject: ${teacher.subject_teaches || 'N/A'}`;
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            
            if (href.startsWith('#')) {
                const sectionId = href.substring(1);
                showSection(sectionId);
                updateActiveNav(link);
            } else if (href.endsWith('.html')) {
                window.location.href = href;
            }
        });
    });

    // Header buttons
    document.getElementById('logoutButton').addEventListener('click', logout);
    
    // Section refresh buttons
    document.getElementById('refreshSchedule')?.addEventListener('click', () => loadSchedule());
    document.getElementById('refreshClasses')?.addEventListener('click', () => loadClasses());
    document.getElementById('refreshStudents')?.addEventListener('click', () => loadStudents());
    document.getElementById('refreshMaterials')?.addEventListener('click', () => loadMaterials());
    document.getElementById('refreshAssignments')?.addEventListener('click', () => loadAssignments());

    // Action buttons
    document.getElementById('backToClasses')?.addEventListener('click', () => showSection('classes'));
    document.getElementById('startAttendanceBtn')?.addEventListener('click', startAttendance);
    document.getElementById('uploadMaterialBtn')?.addEventListener('click', async () => {
        await loadClassesForSelect('material-class');
        await loadSubjectsForSelect('material-subject');
        if (currentClassId) {
            const classSelect = document.getElementById('material-class');
            classSelect.value = currentClassId;
        }
        openModal('materialModal');
    });
    document.getElementById('createAssignmentMainBtn')?.addEventListener('click', async () => {
        await loadClassesForSelect('assignment-class');
        await loadSubjectsForSelect('assignment-subject');
        if (currentClassId) {
            const classSelect = document.getElementById('assignment-class');
            classSelect.value = currentClassId;
        }
        openModal('assignmentModal');
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Form submissions
    document.getElementById('materialForm')?.addEventListener('submit', handleMaterialSubmit);
    document.getElementById('assignmentForm')?.addEventListener('submit', handleAssignmentSubmit);
    document.getElementById('gradeForm')?.addEventListener('submit', handleGradeSubmit);
    document.getElementById('sendMaterialForm')?.addEventListener('submit', handleSendMaterialSubmit);
    document.getElementById('studentAssignmentForm')?.addEventListener('submit', handleStudentAssignmentSubmit);
    
    // Student modal action buttons
    document.getElementById('assignGradeBtn')?.addEventListener('click', () => showGradeModal());
    document.getElementById('sendMaterialBtn')?.addEventListener('click', () => showMaterialModal());
    document.getElementById('createAssignmentBtn')?.addEventListener('click', () => showAssignmentModal());
    document.getElementById('viewSubmissionsBtn')?.addEventListener('click', () => showSubmissionsModal());

    // Chat buttons
    document.getElementById('chatWithStudentBtn')?.addEventListener('click', () => chatWithStudent());
    document.getElementById('chatWithParentBtn')?.addEventListener('click', () => chatWithParent());

    // Fix Chat button to set user info and go to chat.html
    const chatBtn = document.getElementById('chatBtn');
    if (chatBtn) {
        chatBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.setItem('user', JSON.stringify({
                userId: teacher.user_id,
                userType: 'teacher',
                userName: `${teacher.first_name} ${teacher.last_name}`
            }));
            window.location.href = 'chat.html';
        });
    }
}

// Show section and hide others
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('section-hidden');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('section-hidden');
        currentSection = sectionId;
        
        // Load section data
        switch (sectionId) {
            case 'profile':
                loadProfileData();
                break;
            case 'schedule':
                loadSchedule();
                break;
            case 'classes':
                loadClasses();
                break;
            case 'students':
                if (currentClassId) {
                    loadStudents();
                }
                break;
            case 'materials':
                loadMaterials();
                break;
            case 'assignments':
                loadAssignments();
                break;
            case 'submissions':
                // Submissions section shows coming soon message
                break;
        }
    }
}

// Update active navigation
function updateActiveNav(activeLink) {
    document.querySelectorAll('.sidebar nav li').forEach(li => {
        li.classList.remove('active');
    });
    activeLink.parentElement.classList.add('active');
}

// Load profile data
async function loadProfileData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/profile?teacher_id=${teacher.user_id}`);
        if (!response.ok) throw new Error('Failed to load profile');
        
        const profileData = await response.json();
        
        // Update profile information
        document.getElementById('profileName').textContent = `${profileData.first_name} ${profileData.last_name}`;
        document.getElementById('profileEmail').textContent = profileData.email || 'N/A';
        document.getElementById('profileSubject').textContent = profileData.subject_teaches || 'N/A';
        
        // Load stats
        loadTeacherStats();
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile data', true);
    }
}

// Load teacher statistics
async function loadTeacherStats() {
    try {
        // Load classes count
        const classesResponse = await fetch(`${API_BASE_URL}/api/teacher/classes?teacher_id=${teacher.user_id}`);
        if (classesResponse.ok) {
            const classes = await classesResponse.json();
            document.getElementById('totalClasses').textContent = classes.length || 0;
        }
        
        // Load students count (approximate)
        const studentsResponse = await fetch(`${API_BASE_URL}/api/teacher/students?teacher_id=${teacher.user_id}`);
        if (studentsResponse.ok) {
            const students = await studentsResponse.json();
            document.getElementById('totalStudents').textContent = students.length || 0;
        }
        
        // Load assignments count
        const assignmentsResponse = await fetch(`${API_BASE_URL}/api/teacher/assignments?teacher_id=${teacher.user_id}`);
        if (assignmentsResponse.ok) {
            const assignments = await assignmentsResponse.json();
            document.getElementById('totalAssignments').textContent = assignments.length || 0;
        }
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load schedule
    async function loadSchedule() {
    const scheduleGrid = document.getElementById('schedule-grid');
    
        try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/schedule?teacher_id=${teacher.user_id}`);
        if (!response.ok) throw new Error('Failed to load schedule');
        
            const schedule = await response.json();
            
            if (schedule.length === 0) {
            scheduleGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No schedule found</p>
                </div>
            `;
            return;
        }
        
        scheduleGrid.innerHTML = schedule.map(item => `
            <div class="schedule-card">
                <div class="card-header">
                    <i class="fas fa-clock"></i>
                    <h3>${item.class_name}</h3>
                </div>
                <div class="card-content">
                    <div class="schedule-info">
                        <p><strong>Subject:</strong> ${item.subject_name}</p>
                        <p><strong>Day:</strong> ${item.day_of_week}</p>
                        <p><strong>Period:</strong> ${item.period_number}</p>
                        <p><strong>Time:</strong> ${item.start_time} - ${item.end_time}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
        } catch (error) {
            console.error('Error loading schedule:', error);
        scheduleGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load schedule. Please try again.</p>
            </div>
        `;
    }
}

// Load classes
async function loadClasses() {
    const classesGrid = document.getElementById('classes-grid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/classes?teacher_id=${teacher.user_id}`);
        if (!response.ok) throw new Error('Failed to load classes');
        
            const classes = await response.json();
            
            if (classes.length === 0) {
            classesGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-users" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No classes found</p>
                </div>
            `;
            return;
        }
        
        classesGrid.innerHTML = classes.map(cls => `
            <div class="class-card" onclick="selectClass(${cls.class_id}, '${cls.class_name}')">
                <div class="card-header">
                    <i class="fas fa-users"></i>
                    <h3>${cls.class_name}</h3>
                </div>
                <div class="card-content">
                    <p><strong>Class ID:</strong> ${cls.class_id}</p>
                    <div class="class-actions">
                        <button class="btn-primary" onclick="event.stopPropagation(); selectClass(${cls.class_id}, '${cls.class_name}')">
                            <i class="fas fa-graduation-cap"></i> View Students
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        } catch (error) {
            console.error('Error loading classes:', error);
        classesGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load classes. Please try again.</p>
            </div>
        `;
    }
}

// Select class and show students
function selectClass(classId, className) {
    currentClassId = classId;
    document.getElementById('currentClassName').textContent = className;
    document.getElementById('classInfoCard').style.display = 'block';
    
    // Show students section and load students
    showSection('students');
    loadStudents();
}

// Load students for selected class
async function loadStudents() {
    if (!currentClassId) return;
    
    const studentsGrid = document.getElementById('students-grid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/students?class_id=${currentClassId}`);
        if (!response.ok) throw new Error('Failed to load students');
        
            const students = await response.json();
        studentsData = students;
            
            if (students.length === 0) {
            studentsGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-user-graduate" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No students found in this class</p>
                </div>
            `;
            return;
        }
        
        studentsGrid.innerHTML = students.map(student => `
            <div class="student-card" onclick="showStudentDetails(${student.student_id})">
                <div class="card-header">
                    <i class="fas fa-user-graduate"></i>
                    <h3>${student.first_name} ${student.last_name}</h3>
                </div>
                <div class="card-content">
                    <p><strong>Student ID:</strong> ${student.student_id}</p>
                    <p><strong>Email:</strong> ${student.email}</p>
                </div>
            </div>
        `).join('');
        
        } catch (error) {
            console.error('Error loading students:', error);
        studentsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load students. Please try again.</p>
            </div>
        `;
    }
}

// Show student details modal
async function showStudentDetails(studentId) {
    const student = studentsData.find(s => s.student_id === studentId);
    if (!student) return;
    
    // Update modal content
    document.getElementById('modalStudentName').textContent = `${student.first_name} ${student.last_name}`;
    document.getElementById('modalStudentId').textContent = student.student_id;
    document.getElementById('modalStudentEmail').textContent = student.email;
    document.getElementById('modalStudentClass').textContent = document.getElementById('currentClassName').textContent;
    
    // Open modal
    openModal('studentModal');
}

// Load materials
async function loadMaterials() {
    const materialsGrid = document.getElementById('materials-grid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/materials?teacher_id=${teacher.user_id}`);
        if (!response.ok) throw new Error('Failed to load materials');
        
        const materials = await response.json();
        
        if (materials.length === 0) {
            materialsGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-book" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No materials found</p>
                </div>
            `;
            return;
        }
        
        materialsGrid.innerHTML = materials.map(material => `
            <div class="material-card">
                <div class="card-header">
                    <i class="fas fa-book"></i>
                    <h3>${material.title}</h3>
                </div>
                <div class="card-content">
                    <p><strong>Class:</strong> ${material.class_name}</p>
                    <p><strong>Subject:</strong> ${material.subject_name}</p>
                    <p><strong>Uploaded:</strong> ${new Date(material.uploaded_at).toLocaleDateString()}</p>
                    <a href="${material.file_path}" target="_blank" class="btn-primary">
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading materials:', error);
        materialsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load materials. Please try again.</p>
            </div>
        `;
    }
}

// Load assignments
async function loadAssignments() {
    const assignmentsGrid = document.getElementById('assignments-grid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/assignments?teacher_id=${teacher.user_id}`);
        if (!response.ok) throw new Error('Failed to load assignments');
        
        const assignments = await response.json();
        
        if (assignments.length === 0) {
            assignmentsGrid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-tasks" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No assignments found</p>
                </div>
            `;
            return;
        }
        
        assignmentsGrid.innerHTML = assignments.map(assignment => `
            <div class="assignment-card">
                <div class="card-header">
                    <i class="fas fa-tasks"></i>
                    <h3>${assignment.title}</h3>
                </div>
                <div class="card-content">
                    <p><strong>Class:</strong> ${assignment.class_name}</p>
                    <p><strong>Subject:</strong> ${assignment.subject_name}</p>
                    <p><strong>Due:</strong> ${new Date(assignment.due_date).toLocaleDateString()}</p>
                    <p><strong>Description:</strong> ${assignment.description}</p>
                    <div class="assignment-actions">
                        <button class="btn-primary" onclick="viewSubmissions(${assignment.assignment_id})">
                            <i class="fas fa-eye"></i> View Submissions
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading assignments:', error);
        assignmentsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load assignments. Please try again.</p>
            </div>
        `;
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Form handlers
async function handleMaterialSubmit(e) {
    e.preventDefault();
    
    const formData = {
        teacher_id: teacher.user_id,
        title: document.getElementById('material-title').value,
        class_id: document.getElementById('material-class').value,
        subject_id: document.getElementById('material-subject').value,
        file_path: document.getElementById('material-file').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/materials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Material uploaded successfully!', false);
            closeModal('materialModal');
            loadMaterials();
            } else {
            throw new Error('Failed to upload material');
            }
        } catch (error) {
        console.error('Error uploading material:', error);
        showToast('Failed to upload material', true);
    }
}

async function handleAssignmentSubmit(e) {
    e.preventDefault();
    
    const formData = {
        teacher_id: teacher.user_id,
        title: document.getElementById('assignment-title').value,
        description: document.getElementById('assignment-description').value,
        class_id: document.getElementById('assignment-class').value,
        subject_id: document.getElementById('assignment-subject').value,
        due_date: document.getElementById('assignment-due-date').value,
        file_path: document.getElementById('assignment-file').value || null
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Assignment created successfully!', false);
            closeModal('assignmentModal');
            loadAssignments();
        } else {
            throw new Error('Failed to create assignment');
        }
    } catch (error) {
        console.error('Error creating assignment:', error);
        showToast('Failed to create assignment', true);
    }
}

// Start attendance
function startAttendance() {
    if (currentClassId) {
        // Pass the current class ID to the classroom page
        window.location.href = `classroom.html?class_id=${currentClassId}`;
    } else {
        showToast('Please select a class first', true);
    }
}

// Show grade assignment modal
async function showGradeModal() {
    const currentStudent = getCurrentStudent();
    if (!currentStudent) return;
    
    // Set student ID
    document.getElementById('grade-student-id').value = currentStudent.student_id;
    
    // Load subjects and semesters
    await loadSubjectsForSelect('grade-subject');
    await loadSemestersForSelect('grade-semester');
    
    // Open modal
    openModal('gradeModal');
}

// Show material modal for specific student
async function showMaterialModal() {
    const currentStudent = getCurrentStudent();
    if (!currentStudent) return;
    
    // Set student ID
    document.getElementById('send-material-student-id').value = currentStudent.student_id;
    
    // Load classes and subjects
    await loadClassesForSelect('send-material-class');
    await loadSubjectsForSelect('send-material-subject');
    
    // Pre-select current class if available
    if (currentClassId) {
        const classSelect = document.getElementById('send-material-class');
        classSelect.value = currentClassId;
    }
    
    // Open modal
    openModal('sendMaterialModal');
}

// Show assignment modal for specific student
async function showAssignmentModal() {
    const currentStudent = getCurrentStudent();
    if (!currentStudent) return;
    
    // Set student ID
    document.getElementById('student-assignment-student-id').value = currentStudent.student_id;
    
    // Load classes and subjects
    await loadClassesForSelect('student-assignment-class');
    await loadSubjectsForSelect('student-assignment-subject');
    
    // Pre-select current class if available
    if (currentClassId) {
        const classSelect = document.getElementById('student-assignment-class');
        classSelect.value = currentClassId;
    }
    
    // Open modal
    openModal('studentAssignmentModal');
}

// Show submissions modal
async function showSubmissionsModal() {
    const currentStudent = getCurrentStudent();
    if (!currentStudent) return;
    
    // Load submissions for the current student
    await loadStudentSubmissions(currentStudent.student_id);
    
    // Open modal
    openModal('submissionsModal');
}

// View submissions
function viewSubmissions(assignmentId) {
    // Implement submissions view
    showToast('Submissions feature coming soon!', false);
}

// Utility functions
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : 'success'}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        ${isError ? 'background: #e74c3c;' : 'background: #27ae60;'}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function logout() {
    localStorage.removeItem('teacher');
    window.location.href = 'teacherLogin.html';
}

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Get current student from modal
function getCurrentStudent() {
    const studentId = document.getElementById('modalStudentId').textContent;
    return studentsData.find(s => s.student_id === parseInt(studentId));
}

// Load subjects for select dropdown
async function loadSubjectsForSelect(selectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/subjects`);
        if (response.ok) {
            const subjects = await response.json();
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Subject</option>' +
                subjects.map(subject => `<option value="${subject.subject_id}">${subject.subject_name}</option>`).join('');
        }
        } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

// Load semesters for select dropdown
async function loadSemestersForSelect(selectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/semesters`);
        if (response.ok) {
            const semesters = await response.json();
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Semester</option>' +
                semesters.map(semester => `<option value="${semester.semester_id}">${semester.semester_name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading semesters:', error);
    }
}

// Load classes for select dropdown
async function loadClassesForSelect(selectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/classes?teacher_id=${teacher.user_id}`);
        if (response.ok) {
            const classes = await response.json();
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Class</option>' +
                classes.map(cls => `<option value="${cls.class_id}">${cls.class_name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

// Load student submissions
async function loadStudentSubmissions(studentId) {
    const submissionsContent = document.getElementById('submissions-content');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/submissions?teacher_id=${teacher.user_id}&student_id=${studentId}`);
        if (!response.ok) throw new Error('Failed to load submissions');
        
        const submissions = await response.json();
        
        if (submissions.length === 0) {
            submissionsContent.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-file-alt" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No submissions found for this student</p>
                </div>
            `;
            return;
        }
        
        submissionsContent.innerHTML = `
            <div class="submissions-list">
                ${submissions.map(submission => `
                    <div class="submission-item">
                        <div class="submission-header">
                            <h4>${submission.assignment_title}</h4>
                            <span class="submission-date">${new Date(submission.submission_date).toLocaleDateString()}</span>
                        </div>
                        <div class="submission-details">
                            <p><strong>Subject:</strong> ${submission.subject_name}</p>
                            <p><strong>File:</strong> <a href="${submission.submitted_file_path}" target="_blank">View Submission</a></p>
                            ${submission.grade ? `<p><strong>Grade:</strong> ${submission.grade}</p>` : ''}
                            ${submission.feedback ? `<p><strong>Feedback:</strong> ${submission.feedback}</p>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading submissions:', error);
        submissionsContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load submissions. Please try again.</p>
            </div>
        `;
    }
}

// Handle grade submission
    async function handleGradeSubmit(e) {
        e.preventDefault();
        
        const formData = {
        teacher_id: teacher.user_id,
            student_id: document.getElementById('grade-student-id').value,
        subject_id: document.getElementById('grade-subject').value,
        semester_id: document.getElementById('grade-semester').value,
            grade: document.getElementById('grade-value').value,
            comments: document.getElementById('grade-comments').value
        };
        
        try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/grades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
            showToast('Grade assigned successfully!', false);
            closeModal('gradeModal');
            // Refresh student grades in modal
            const studentId = formData.student_id;
            await showStudentDetails(studentId);
            } else {
                const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to assign grade');
        }
    } catch (error) {
        console.error('Error assigning grade:', error);
        showToast(error.message || 'Failed to assign grade', true);
    }
}

// Handle send material submission
async function handleSendMaterialSubmit(e) {
        e.preventDefault();
        
        const formData = {
        teacher_id: teacher.user_id,
        class_id: document.getElementById('send-material-class').value,
        subject_id: document.getElementById('send-material-subject').value,
        title: document.getElementById('send-material-title').value,
        file_path: document.getElementById('send-material-file').value
        };

        try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/materials`, {
                method: 'POST',
            headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
            showToast('Material sent successfully!', false);
            closeModal('sendMaterialModal');
            loadMaterials(); // Refresh materials list
            } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send material');
        }
    } catch (error) {
        console.error('Error sending material:', error);
        showToast(error.message || 'Failed to send material', true);
    }
}

// Handle student assignment submission
async function handleStudentAssignmentSubmit(e) {
        e.preventDefault();
        
        const formData = {
        teacher_id: teacher.user_id,
        class_id: document.getElementById('student-assignment-class').value,
        subject_id: document.getElementById('student-assignment-subject').value,
        title: document.getElementById('student-assignment-title').value,
        description: document.getElementById('student-assignment-description').value,
        due_date: document.getElementById('student-assignment-due-date').value,
        file_path: document.getElementById('student-assignment-file').value || null
        };

        try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/assignments`, {
                method: 'POST',
            headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
            showToast('Assignment created successfully!', false);
            closeModal('studentAssignmentModal');
            loadAssignments(); // Refresh assignments list
            } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create assignment');
            }
        } catch (error) {
            console.error('Error creating assignment:', error);
        showToast(error.message || 'Failed to create assignment', true);
    }
}

function chatWithStudent() {
    const student = getCurrentStudent();
    if (!student) return;
    localStorage.setItem('user', JSON.stringify({
        userId: teacher.user_id,
        userType: 'teacher',
        userName: `${teacher.first_name} ${teacher.last_name}`
    }));
    localStorage.setItem('chatTarget', JSON.stringify({
        userId: student.student_id,
        userType: 'student',
        userName: `${student.first_name} ${student.last_name}`
    }));
    window.location.href = 'chat.html';
}

function chatWithParent() {
    const student = getCurrentStudent();
    if (!student) return;
    if (!student.parent_id || !student.parent_first_name) {
        showToast('Parent info not available', true);
        return;
    }
    localStorage.setItem('user', JSON.stringify({
        userId: teacher.user_id,
        userType: 'teacher',
        userName: `${teacher.first_name} ${teacher.last_name}`
    }));
    localStorage.setItem('chatTarget', JSON.stringify({
        userId: student.parent_id,
        userType: 'parent',
        userName: `${student.parent_first_name} ${student.parent_last_name}`
    }));
    window.location.href = 'chat.html';
}