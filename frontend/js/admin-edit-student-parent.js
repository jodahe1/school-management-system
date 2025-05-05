// frontend/js/admin-edit-student-parent.js

// DOM Elements
const classesSection = document.getElementById('classes-section');
const studentsSection = document.getElementById('students-section');
const studentDetailsSection = document.getElementById('student-details-section');
const classesList = document.getElementById('classes-list');
const studentsList = document.getElementById('students-list');
const editStudentForm = document.getElementById('edit-student-form');
const updateMessage = document.getElementById('update-message');

let selectedClassId = null;
let selectedStudentId = null;

// Fetch All Classes
const fetchClasses = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/classes');
        const classes = await response.json();

        if (classes.length === 0) {
            classesList.innerHTML = '<p>No classes found.</p>';
            return;
        }

        classesList.innerHTML = '';
        classes.forEach((cls) => {
            const button = document.createElement('button');
            button.textContent = cls.class_name;
            button.onclick = () => fetchStudents(cls.class_id, cls.class_name);
            classesList.appendChild(button);
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        classesList.innerHTML = '<p>Error loading classes. Please try again.</p>';
    }
};

// Fetch Students in a Specific Class
const fetchStudents = async (classId, className) => {
    try {
        selectedClassId = classId;
        studentsSection.style.display = 'block';
        document.getElementById('selected-class-name').textContent = className;

        const response = await fetch(`http://localhost:5000/api/admin/classes/${classId}/students`);
        const students = await response.json();

        if (students.length === 0) {
            studentsList.innerHTML = '<p>No students found in this class.</p>';
            return;
        }

        studentsList.innerHTML = '';
        students.forEach((student) => {
            const button = document.createElement('button');
            button.textContent = `${student.first_name} ${student.last_name}`;
            button.onclick = () => fetchStudentDetails(student.student_id);
            studentsList.appendChild(button);
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        studentsList.innerHTML = '<p>Error loading students. Please try again.</p>';
    }
};

// Fetch Student and Parent Details
const fetchStudentDetails = async (studentId) => {
    try {
        selectedStudentId = studentId;
        const response = await fetch(`http://localhost:5000/api/admin/students/${studentId}/details`);
        const studentDetails = await response.json();

        if (!studentDetails) {
            alert('Student not found.');
            return;
        }

        // Populate the form fields
        document.getElementById('student-first-name').value = studentDetails.student_first_name;
        document.getElementById('student-last-name').value = studentDetails.student_last_name;
        document.getElementById('student-dob').value = studentDetails.date_of_birth.split('T')[0];
        document.getElementById('parent-first-name').value = studentDetails.parent_first_name || '';
        document.getElementById('parent-last-name').value = studentDetails.parent_last_name || '';
        document.getElementById('parent-phone').value = studentDetails.phone_number || '';

        // Show the student details section
        studentDetailsSection.style.display = 'block';
    } catch (error) {
        console.error('Error fetching student details:', error);
        alert('Error loading student details. Please try again.');
    }
};

// Save Updated Student and Parent Information
editStudentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const studentData = {
        firstName: document.getElementById('student-first-name').value.trim(),
        lastName: document.getElementById('student-last-name').value.trim(),
        dob: document.getElementById('student-dob').value.trim(),
    };

    const parentData = {
        firstName: document.getElementById('parent-first-name').value.trim(),
        lastName: document.getElementById('parent-last-name').value.trim(),
        phoneNumber: document.getElementById('parent-phone').value.trim(),
    };

    try {
        // Update Student
        await fetch(`http://localhost:5000/api/admin/students/${selectedStudentId}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData),
        });

        // Update Parent
        const response = await fetch(`http://localhost:5000/api/admin/students/${selectedStudentId}/details`);
        const studentDetails = await response.json();
        const parentId = studentDetails.parent_id;

        if (parentId) {
            await fetch(`http://localhost:5000/api/admin/parents/${parentId}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parentData),
            });
        }

        updateMessage.textContent = 'Changes saved successfully!';
        updateMessage.style.color = 'green';
    } catch (error) {
        console.error('Error saving changes:', error);
        updateMessage.textContent = 'Error saving changes. Please try again.';
        updateMessage.style.color = 'red';
    }
});
// js/admin-edit-student-parent.js

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

    // Add your existing logic for loading classes, students, etc.
    // Example:
    const classesList = document.getElementById('classes-list');
    if (classesList) {
        classesList.innerHTML = '<p>Classes loaded (placeholder).</p>';
    }
});
// Initialize the Page
fetchClasses();