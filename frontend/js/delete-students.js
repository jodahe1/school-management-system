// frontend/js/delete-students.js

let selectedClassId = null;
let selectedStudentId = null;
let expandedClassId = null;
let expandedStudentsDiv = null;
let expandedConfirmationDiv = null;
let lastExpandedClassCard = null;

// Fetch All Classes
const fetchClasses = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/classes');
        const classes = await response.json();

        if (classes.length === 0) {
            document.getElementById('classes-list').innerHTML = '<p>No classes found.</p>';
            return;
        }

        document.getElementById('classes-list').innerHTML = '';
        classes.forEach((cls) => {
            const card = document.createElement('div');
            card.className = 'class-card';
            card.innerHTML = `<span class="class-name">${cls.class_name}</span>`;
            card.tabIndex = 0;
            card.onclick = () => {
                lastExpandedClassCard = card;
                toggleClassStudents(cls.class_id, cls.class_name, card);
            };
            card.onkeypress = (e) => { if (e.key === 'Enter' || e.key === ' ') card.onclick(); };
            document.getElementById('classes-list').appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        document.getElementById('classes-list').innerHTML = '<p>Error loading classes. Please try again.</p>';
    }
};

// Toggle Students for a Class (Toaster style)
const toggleClassStudents = async (classId, className, classCard) => {
    // Collapse if already expanded
    if (expandedClassId === classId) {
        if (expandedStudentsDiv) expandedStudentsDiv.remove();
        expandedClassId = null;
        expandedStudentsDiv = null;
        return;
    }
    // Collapse previous
    if (expandedStudentsDiv) expandedStudentsDiv.remove();
    expandedClassId = classId;
    lastExpandedClassCard = classCard;
    expandedStudentsDiv = document.createElement('div');
    expandedStudentsDiv.className = 'students-toaster-list';
    expandedStudentsDiv.innerHTML = '<p>Loading students...</p>';
    // Insert after classCard
    classCard.insertAdjacentElement('afterend', expandedStudentsDiv);
    // Fetch and render students
    try {
        const response = await fetch(`http://localhost:5000/api/admin/classes/${classId}/students`);
        const students = await response.json();
        if (students.length === 0) {
            expandedStudentsDiv.innerHTML = '<p>No students found in this class.</p>';
            return;
        }
        expandedStudentsDiv.innerHTML = '';
        students.forEach((student) => {
            const studentCard = document.createElement('div');
            studentCard.className = 'student-card';
            studentCard.innerHTML = `<span class="student-name">${student.first_name} ${student.last_name}</span>`;
            studentCard.tabIndex = 0;
            studentCard.onclick = () => showDeleteConfirmationToaster(student, studentCard);
            studentCard.onkeypress = (e) => { if (e.key === 'Enter' || e.key === ' ') studentCard.onclick(); };
            expandedStudentsDiv.appendChild(studentCard);
        });
    } catch (error) {
        expandedStudentsDiv.innerHTML = '<p>Error loading students. Please try again.</p>';
    }
};

// Show delete confirmation as a toaster below the student card
const showDeleteConfirmationToaster = async (student, studentCard) => {
    // Remove previous confirmation if any
    if (expandedConfirmationDiv) expandedConfirmationDiv.remove();
    expandedConfirmationDiv = document.createElement('div');
    expandedConfirmationDiv.className = 'delete-confirmation-toaster';
    expandedConfirmationDiv.innerHTML = '<h2>Confirm Deletion</h2><p>Loading student info...</p>';
    studentCard.insertAdjacentElement('afterend', expandedConfirmationDiv);
    try {
        const response = await fetch(`http://localhost:5000/api/admin/students/${student.student_id}/details`);
        const d = await response.json();
        if (!d) {
            expandedConfirmationDiv.innerHTML = '<h2>Confirm Deletion</h2><p>Student not found.</p>';
            return;
        }
        expandedConfirmationDiv.innerHTML = `
            <h2>Confirm Deletion</h2>
            <div style="font-size:1.2rem;font-weight:700;margin-bottom:1rem;color:#ef4444;">${d.student_first_name || ''} ${d.student_last_name || ''}</div>
            <table class="student-info-table" style="margin-bottom:1.5rem;">
                <tr><th>Student First Name</th><td>${d.student_first_name || ''}</td></tr>
                <tr><th>Student Last Name</th><td>${d.student_last_name || ''}</td></tr>
                <tr><th>Date of Birth</th><td>${d.date_of_birth ? d.date_of_birth.split('T')[0] : ''}</td></tr>
                <tr><th>Parent First Name</th><td>${d.parent_first_name || ''}</td></tr>
                <tr><th>Parent Last Name</th><td>${d.parent_last_name || ''}</td></tr>
                <tr><th>Parent Phone</th><td>${d.phone_number || ''}</td></tr>
            </table>
            <div class="form-actions-row">
                <button class="submit-btn confirm-delete-btn">Yes, Delete</button>
                <button class="cancel-btn cancel-delete-btn">Cancel</button>
            </div>
            <div class="delete-message"></div>
        `;
        // Add event listeners for the new buttons
        expandedConfirmationDiv.querySelector('.confirm-delete-btn').onclick = async () => {
            try {
                await fetch(`http://localhost:5000/api/admin/students/${student.student_id}/delete`, {
                    method: 'DELETE',
                });
                expandedConfirmationDiv.querySelector('.delete-message').textContent = 'Student deleted successfully!';
                expandedConfirmationDiv.querySelector('.delete-message').style.color = 'green';
                setTimeout(() => {
                    expandedConfirmationDiv.remove();
                    expandedConfirmationDiv = null;
                    // Refresh students list
                    toggleClassStudents(expandedClassId, '', studentCard.closest('.class-card'));
                }, 1200);
            } catch (error) {
                expandedConfirmationDiv.querySelector('.delete-message').textContent = 'An error occurred while deleting the student.';
                expandedConfirmationDiv.querySelector('.delete-message').style.color = 'red';
            }
        };
        expandedConfirmationDiv.querySelector('.cancel-delete-btn').onclick = () => {
            expandedConfirmationDiv.remove();
            expandedConfirmationDiv = null;
        };
    } catch (error) {
        expandedConfirmationDiv.innerHTML = '<h2>Confirm Deletion</h2><p>Error loading student info.</p>';
    }
};

// Handle Cancel Deletion
document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    document.getElementById('delete-confirmation-section').style.display = 'none';
});

// js/delete-students.js

document.addEventListener('DOMContentLoaded', () => {
    const dashboardBtn = document.getElementById('dashboard-btn');
    const editStudentsParentsBtn = document.getElementById('edit-students-parents-btn');
    const manageTeachersBtn = document.getElementById('manage-teachers-btn');
    const deleteStudentsBtn = document.getElementById('delete-students-btn');
    const manageSchedulesBtn = document.getElementById('manage-schedules-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'admin-dashboard.html';
        });
    }

    if (editStudentsParentsBtn) {
        editStudentsParentsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'admin-edit-student-parent.html';
        });
    }

    if (manageTeachersBtn) {
        manageTeachersBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'manage-teachers.html';
        });
    }

    if (deleteStudentsBtn) {
        deleteStudentsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'delete-students.html';
        });
    }

    if (manageSchedulesBtn) {
        manageSchedulesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'manage-schedules.html';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }

    const addStudentLink = document.querySelector('a[href="#add-student"]');
    const addTeacherLink = document.querySelector('a[href="#add-teacher"]');
    const addParentLink = document.querySelector('a[href="#add-parent"]');

    if (addStudentLink) {
        addStudentLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Add Student clicked');
        });
    }

    if (addTeacherLink) {
        addTeacherLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Add Teacher clicked');
        });
    }

    if (addParentLink) {
        addParentLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Add Parent clicked');
        });
    }

    // Add your existing logic for loading classes, students, deletion, etc.
    // Example:
    const classesList = document.getElementById('classes-list');
    if (classesList) {
        classesList.innerHTML = '<p>Classes loaded (placeholder).</p>';
    }
});

// Initialize the Page
fetchClasses();