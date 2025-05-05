// frontend/js/manage-teachers.js

// Fetch Teachers
const fetchTeachers = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/teachers');
        const teachers = await response.json();

        const teachersList = document.getElementById('teachers-list');
        teachersList.innerHTML = '';

        teachers.forEach((teacher) => {
            const div = document.createElement('div');
            div.innerHTML = `
                <p>${teacher.first_name} ${teacher.last_name} (${teacher.subject_teaches})</p>
                <button class="edit-btn" data-id="${teacher.teacher_id}">Edit</button>
                <button class="delete-btn" data-id="${teacher.teacher_id}">Delete</button>
            `;
            teachersList.appendChild(div);
        });

        // Add event listeners for edit buttons
        document.querySelectorAll('.edit-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const teacherId = btn.dataset.id;
                openEditTeacherModal(teacherId);
            });
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const teacherId = btn.dataset.id;
                await fetch(`http://localhost:5000/api/admin/teachers/${teacherId}/delete`, {
                    method: 'DELETE',
                });
                fetchTeachers(); // Refresh the list
            });
        });
    } catch (error) {
        console.error('Error fetching teachers:', error);
    }
};

// Open Edit Teacher Modal
const openEditTeacherModal = (teacherId) => {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#fff';
    modal.style.padding = '20px';
    modal.style.border = '1px solid #ccc';
    modal.style.zIndex = '1000';

    modal.innerHTML = `
        <h3>Edit Teacher</h3>
        <form id="edit-teacher-form">
            <label for="teacher-first-name">First Name:</label>
            <input type="text" id="teacher-first-name" name="firstName" required>

            <label for="teacher-last-name">Last Name:</label>
            <input type="text" id="teacher-last-name" name="lastName" required>

            <label for="teacher-subject">Subject Teaches:</label>
            <input type="text" id="teacher-subject" name="subjectTeaches" required>

            <button type="submit">Save Changes</button>
        </form>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('edit-teacher-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = {
            firstName: document.getElementById('teacher-first-name').value.trim(),
            lastName: document.getElementById('teacher-last-name').value.trim(),
            subjectTeaches: document.getElementById('teacher-subject').value.trim(),
        };

        try {
            await fetch(`http://localhost:5000/api/admin/teachers/${teacherId}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            alert('Teacher updated successfully!');
            modal.remove(); // Close the modal
            fetchTeachers(); // Refresh the list
        } catch (error) {
            alert('An error occurred while updating the teacher.');
        }
    });
};
// js/manage-teachers.js

document.addEventListener('DOMContentLoaded', () => {
    // Sidebar navigation
    const dashboardBtn = document.getElementById('dashboard-btn');
    const editStudentsParentsBtn = document.getElementById('edit-students-parents-btn');
    const manageTeachersBtn = document.getElementById('manage-teachers-btn');
    const deleteStudentsBtn = document.getElementById('delete-students-btn');
    const manageSchedulesBtn = document.getElementById('manage-schedules-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Quick Actions buttons (optional, if you want to sync with dashboard Quick Actions)
    const quickDashboardBtn = document.getElementById('quick-dashboard-btn');
    const quickEditStudentsBtn = document.getElementById('quick-edit-students-btn');
    const quickManageTeachersBtn = document.getElementById('quick-manage-teachers-btn');
    const quickDeleteStudentsBtn = document.getElementById('quick-delete-students-btn');
    const quickManageSchedulesBtn = document.getElementById('quick-manage-schedules-btn');

    // Navigation event listeners
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
            window.location.href = 'manage-teachers.html'; // Already on this page, but included for consistency
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
            // Placeholder for logout logic (e.g., clear session, redirect to login)
            window.location.href = 'login.html'; // Adjust to your login page
        });
    }

    // Optional: Handle Quick Actions buttons (if present in manage-teachers.html)
    if (quickDashboardBtn) {
        quickDashboardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'admin-dashboard.html';
        });
    }

    if (quickEditStudentsBtn) {
        quickEditStudentsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'admin-edit-student-parent.html';
        });
    }

    if (quickManageTeachersBtn) {
        quickManageTeachersBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'manage-teachers.html';
        });
    }

    if (quickDeleteStudentsBtn) {
        quickDeleteStudentsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'delete-students.html';
        });
    }

    if (quickManageSchedulesBtn) {
        quickManageSchedulesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'manage-schedules.html';
        });
    }

    // Placeholder for Add Student, Add Teacher, Add Parent links
    const addStudentLink = document.querySelector('a[href="#add-student"]');
    const addTeacherLink = document.querySelector('a[href="#add-teacher"]');
    const addParentLink = document.querySelector('a[href="#add-parent"]');

    if (addStudentLink) {
        addStudentLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Replace with your logic (e.g., show modal, navigate to add-student.html)
            console.log('Add Student clicked');
            // Example: window.location.href = 'add-student.html';
        });
    }

    if (addTeacherLink) {
        addTeacherLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Replace with your logic (e.g., show modal, navigate to add-teacher.html)
            console.log('Add Teacher clicked');
            // Example: window.location.href = 'add-teacher.html';
        });
    }

    if (addParentLink) {
        addParentLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Replace with your logic (e.g., show modal, navigate to add-parent.html)
            console.log('Add Parent clicked');
            // Example: window.location.href = 'add-parent.html';
        });
    }

    // Existing functionality (placeholder for your original manage-teachers.js code)
    // Example: Load teachers dynamically
    const teachersList = document.getElementById('teachers-list');
    if (teachersList) {
        // Replace with your actual teacher-loading logic
        teachersList.innerHTML = '<p>Teachers loaded (placeholder).</p>';
    }
});
// Initialize the Page
fetchTeachers();