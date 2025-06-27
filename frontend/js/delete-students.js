// frontend/js/delete-students.js

let selectedClassId = null;
let selectedStudentId = null;

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
            card.onclick = () => fetchStudents(cls.class_id, cls.class_name);
            card.onkeypress = (e) => { if (e.key === 'Enter' || e.key === ' ') card.onclick(); };
            document.getElementById('classes-list').appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        document.getElementById('classes-list').innerHTML = '<p>Error loading classes. Please try again.</p>';
    }
};

// Fetch Students in a Specific Class
const fetchStudents = async (classId, className) => {
    try {
        selectedClassId = classId;
        document.getElementById('selected-class-name').textContent = className;
        document.getElementById('students-section').style.display = 'block';

        const response = await fetch(`http://localhost:5000/api/admin/classes/${classId}/students`);
        const students = await response.json();

        if (students.length === 0) {
            document.getElementById('students-list').innerHTML = '<p>No students found in this class.</p>';
            return;
        }

        document.getElementById('students-list').innerHTML = '';
        students.forEach((student) => {
            const card = document.createElement('div');
            card.className = 'student-card';
            card.innerHTML = `<span class=\"student-name\">${student.first_name} ${student.last_name}</span>`;
            card.tabIndex = 0;
            card.onclick = () => confirmDelete(student.student_id, `${student.first_name} ${student.last_name}`);
            card.onkeypress = (e) => { if (e.key === 'Enter' || e.key === ' ') card.onclick(); };
            document.getElementById('students-list').appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        document.getElementById('students-list').innerHTML = '<p>Error loading students. Please try again.</p>';
    }
};

// Confirm Deletion
const confirmDelete = (studentId, studentName) => {
    selectedStudentId = studentId;
    document.getElementById('student-to-delete').textContent = studentName;
    document.getElementById('delete-confirmation-section').style.display = 'block';
};

// Handle Delete Confirmation
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    try {
        await fetch(`http://localhost:5000/api/admin/students/${selectedStudentId}/delete`, {
            method: 'DELETE',
        });

        document.getElementById('delete-message').textContent = 'Student deleted successfully!';
        document.getElementById('delete-message').style.color = 'green';

        // Reset the UI
        document.getElementById('delete-confirmation-section').style.display = 'none';
        fetchStudents(selectedClassId, document.getElementById('selected-class-name').textContent);
    } catch (error) {
        console.error('Error deleting student:', error);
        document.getElementById('delete-message').textContent = 'An error occurred while deleting the student.';
        document.getElementById('delete-message').style.color = 'red';
    }
});

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