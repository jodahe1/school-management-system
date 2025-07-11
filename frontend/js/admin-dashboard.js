// frontend/js/admin-dashboard.js

// Redirect to Edit Students & Parents Page
document.getElementById('edit-students-parents-btn').addEventListener('click', () => {
    window.location.href = 'admin-edit-student-parent.html';
});

// Redirect to Manage Teachers Page
document.getElementById('manage-teachers-btn').addEventListener('click', () => {
    window.location.href = 'manage-teachers.html';
});

// Redirect to Delete Students Page
document.getElementById('delete-students-btn').addEventListener('click', () => {
    window.location.href = 'delete-students.html';
});

// Fetch Analytics Data
const fetchAnalytics = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/analytics');
        const data = await response.json();

        document.getElementById('total-students').textContent = data.total_students || 0;
        document.getElementById('total-teachers').textContent = data.total_teachers || 0;
        document.getElementById('total-parents').textContent = data.total_parents || 0;
        document.getElementById('total-admins').textContent = data.total_admins || 0;
    } catch (error) {
        console.error('Error fetching analytics:', error);
    }
};

// Add Student Form Submission
document.getElementById('add-student-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        username: document.getElementById('student-username').value.trim(),
        password: document.getElementById('student-password').value.trim(),
        email: document.getElementById('student-email').value.trim(),
        firstName: document.getElementById('student-first-name').value.trim(),
        lastName: document.getElementById('student-last-name').value.trim(),
        dob: document.getElementById('student-dob').value.trim(),
        classId: parseInt(document.getElementById('student-class-id').value.trim(), 10),
        parentId: parseInt(document.getElementById('student-parent-id').value.trim(), 10),
    };

    try {
        const response = await fetch('http://localhost:5000/api/admin/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById('student-message').textContent = 'Student added successfully!';
            document.getElementById('student-message').style.color = 'green';
            document.getElementById('add-student-form').reset();
            fetchAnalytics(); // Refresh dashboard counts after adding
        } else {
            document.getElementById('student-message').textContent = result.message || 'An error occurred';
            document.getElementById('student-message').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('student-message').textContent = 'Network error. Please try again.';
        document.getElementById('student-message').style.color = 'red';
    }
});

// Add Teacher Form Submission
document.getElementById('add-teacher-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        username: document.getElementById('teacher-username').value.trim(),
        password: document.getElementById('teacher-password').value.trim(),
        email: document.getElementById('teacher-email').value.trim(),
        firstName: document.getElementById('teacher-first-name').value.trim(),
        lastName: document.getElementById('teacher-last-name').value.trim(),
        subjectTeaches: document.getElementById('teacher-subject').value.trim(),
    };

    try {
        const response = await fetch('http://localhost:5000/api/admin/teachers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById('teacher-message').textContent = 'Teacher added successfully!';
            document.getElementById('teacher-message').style.color = 'green';
            document.getElementById('add-teacher-form').reset();
            fetchAnalytics(); // Refresh dashboard counts after adding
        } else {
            document.getElementById('teacher-message').textContent = result.message || 'An error occurred';
            document.getElementById('teacher-message').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('teacher-message').textContent = 'Network error. Please try again.';
        document.getElementById('teacher-message').style.color = 'red';
    }
});
// Redirect to Manage Schedules Page
document.getElementById('manage-schedules-btn').addEventListener('click', () => {
    window.location.href = 'manage-schedules.html';
});
// Add Parent Form Submission
document.getElementById('add-parent-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        username: document.getElementById('parent-username').value.trim(),
        password: document.getElementById('parent-password').value.trim(),
        email: document.getElementById('parent-email').value.trim(),
        firstName: document.getElementById('parent-first-name').value.trim(),
        lastName: document.getElementById('parent-last-name').value.trim(),
        phoneNumber: document.getElementById('parent-phone').value.trim(),
    };

    try {
        const response = await fetch('http://localhost:5000/api/admin/parents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById('parent-message').textContent = 'Parent added successfully!';
            document.getElementById('parent-message').style.color = 'green';
            document.getElementById('add-parent-form').reset();
            fetchAnalytics(); // Refresh dashboard counts after adding
        } else {
            document.getElementById('parent-message').textContent = result.message || 'An error occurred';
            document.getElementById('parent-message').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('parent-message').textContent = 'Network error. Please try again.';
        document.getElementById('parent-message').style.color = 'red';
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // Handle sidebar navigation
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(navLink => navLink.parentElement.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // Initialize with dashboard visible, but only for hash links
    const activeLink = document.querySelector('.sidebar-nav li.active a');
    if (activeLink && activeLink.getAttribute('href').startsWith('#')) {
        activeLink.click();
    }
    
    // Form submission handlers would go here
    // ...
});
// Initialize the Dashboard
fetchAnalytics();

// Sidebar navigation for Manage Semesters
const manageSemestersBtn = document.getElementById('manage-semesters-btn');
if (manageSemestersBtn) {
    manageSemestersBtn.addEventListener('click', () => {
        // Navigation handled by sidebar logic
    });
}

// SEMESTER MANAGEMENT LOGIC
async function fetchSemesters() {
    const res = await fetch('http://localhost:5000/api/admin/semesters');
    const semesters = await res.json();
    const list = document.getElementById('semesters-list');
    if (!list) return;
    list.innerHTML = '';
    semesters.forEach(sem => {
        const div = document.createElement('div');
        div.className = 'semester-row ' + (sem.is_active ? 'active-semester' : 'inactive-semester');
        div.innerHTML = `
            <strong>${sem.semester_name}</strong> (${sem.start_date.split('T')[0]} to ${sem.end_date.split('T')[0]}) 
            <span style="color:${sem.is_active ? 'green' : 'gray'}">${sem.is_active ? 'Active' : 'Inactive'}</span>
            <button class="edit-semester-btn" data-id="${sem.semester_id}">Edit</button>
            <button class="delete-semester-btn" data-id="${sem.semester_id}">Delete</button>
        `;
        div.semesterData = sem; // Attach data for easy access
        list.appendChild(div);
    });
    document.querySelectorAll('.edit-semester-btn').forEach(btn => {
        btn.onclick = () => editSemesterPrompt(btn.dataset.id);
    });
    document.querySelectorAll('.delete-semester-btn').forEach(btn => {
        btn.onclick = () => deleteSemester(btn.dataset.id);
    });
}

if (document.getElementById('add-semester-form')) {
    document.getElementById('add-semester-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            semesterName: document.getElementById('semester-name').value,
            startDate: document.getElementById('semester-start').value,
            endDate: document.getElementById('semester-end').value,
            isActive: document.getElementById('semester-active').value === 'true'
        };
        await fetch('http://localhost:5000/api/admin/semesters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        fetchSemesters();
        e.target.reset();
    });
}

function editSemesterPrompt(id) {
    // Remove any existing edit forms
    const existingForm = document.getElementById('inline-edit-semester-form');
    if (existingForm) existingForm.remove();

    // Find the semester data
    const sem = Array.from(document.querySelectorAll('.edit-semester-btn')).find(btn => btn.dataset.id == id).closest('.semester-row').semesterData;
    // If not found, fallback to fetching from the DOM
    let semesterName = '', startDate = '', endDate = '', isActive = false;
    if (sem) {
        semesterName = sem.semester_name;
        startDate = sem.start_date.split('T')[0];
        endDate = sem.end_date.split('T')[0];
        isActive = sem.is_active;
    } else {
        // fallback: parse from DOM
        const row = Array.from(document.querySelectorAll('.edit-semester-btn')).find(btn => btn.dataset.id == id).closest('.semester-row');
        const strong = row.querySelector('strong');
        const span = row.querySelector('span');
        semesterName = strong ? strong.textContent : '';
        const dateMatch = row.innerHTML.match(/\((\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})\)/);
        if (dateMatch) {
            startDate = dateMatch[1];
            endDate = dateMatch[2];
        }
        isActive = span && span.textContent.trim().toLowerCase() === 'active';
    }

    // Create the form card
    const formDiv = document.createElement('div');
    formDiv.className = 'semester-row edit-form-row';
    formDiv.id = 'inline-edit-semester-form';
    formDiv.innerHTML = `
        <input type="text" id="edit-semester-name" value="${semesterName}" style="min-width:100px;" />
        <input type="date" id="edit-semester-start" value="${startDate}" />
        <input type="date" id="edit-semester-end" value="${endDate}" />
        <select id="edit-semester-active">
            <option value="true" ${isActive ? 'selected' : ''}>Active</option>
            <option value="false" ${!isActive ? 'selected' : ''}>Inactive</option>
        </select>
        <button id="save-semester-btn">Save</button>
        <button id="cancel-semester-btn">Back</button>
    `;

    // Insert after the clicked semester-row
    const row = Array.from(document.querySelectorAll('.edit-semester-btn')).find(btn => btn.dataset.id == id).closest('.semester-row');
    row.parentNode.insertBefore(formDiv, row.nextSibling);

    // Save handler
    document.getElementById('save-semester-btn').onclick = async function() {
        const data = {
            semesterName: document.getElementById('edit-semester-name').value,
            startDate: document.getElementById('edit-semester-start').value,
            endDate: document.getElementById('edit-semester-end').value,
            isActive: document.getElementById('edit-semester-active').value === 'true'
        };
        await fetch(`http://localhost:5000/api/admin/semesters/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        fetchSemesters();
        formDiv.remove();
    };
    // Back handler
    document.getElementById('cancel-semester-btn').onclick = function() {
        formDiv.remove();
    };
}

function deleteSemester(id) {
    if (confirm('Are you sure you want to delete this semester?')) {
        fetch(`http://localhost:5000/api/admin/semesters/${id}`, {
            method: 'DELETE'
        }).then(fetchSemesters);
    }
}

if (document.getElementById('semesters-list')) fetchSemesters();

// Quick Actions unique button handlers
const editStudentsParentsQuickBtn = document.getElementById('edit-students-parents-btn-quick');
if (editStudentsParentsQuickBtn) {
    editStudentsParentsQuickBtn.addEventListener('click', () => {
        window.location.href = 'admin-edit-student-parent.html';
    });
}
const manageTeachersQuickBtn = document.getElementById('manage-teachers-btn-quick');
if (manageTeachersQuickBtn) {
    manageTeachersQuickBtn.addEventListener('click', () => {
        window.location.href = 'manage-teachers.html';
    });
}
const deleteStudentsQuickBtn = document.getElementById('delete-students-btn-quick');
if (deleteStudentsQuickBtn) {
    deleteStudentsQuickBtn.addEventListener('click', () => {
        window.location.href = 'delete-students.html';
    });
}
const manageSchedulesQuickBtn = document.getElementById('manage-schedules-btn-quick');
if (manageSchedulesQuickBtn) {
    manageSchedulesQuickBtn.addEventListener('click', () => {
        window.location.href = 'manage-schedules.html';
    });
}
