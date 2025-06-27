// frontend/js/manage-teachers.js

// Global variable to cache teachers data
let teachersCache = [];

// Fetch Teachers
const fetchTeachers = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/teachers', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}` // Include token if available
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const teachers = await response.json();

        // Cache the teachers data
        teachersCache = teachers;

        const teachersList = document.getElementById('teachers-list');
        teachersList.innerHTML = '';

        teachers.forEach((teacher) => {
            const card = document.createElement('div');
            card.className = 'teacher-card';
            card.innerHTML = `
                <span class="teacher-name">${teacher.first_name} ${teacher.last_name}</span>
                <button class="edit-btn" data-id="${teacher.teacher_id}">Edit</button>
                <button class="delete-btn" data-id="${teacher.teacher_id}">Delete</button>
            `;
            // Popup for extra info
            const popup = document.createElement('div');
            popup.className = 'teacher-popup';
            popup.innerHTML = `<strong>Subject:</strong> ${teacher.subject_teaches || 'N/A'}<br>${teacher.email ? `<strong>Email:</strong> ${teacher.email}` : ''}`;
            popup.style.display = 'none';
            card.appendChild(popup);
            card.addEventListener('mouseenter', () => { popup.style.display = 'block'; });
            card.addEventListener('mouseleave', () => { popup.style.display = 'none'; });
            teachersList.appendChild(card);
        });

        // Add event listeners for edit buttons
        document.querySelectorAll('.edit-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const teacherId = btn.dataset.id;
                openEditTeacherForm(teacherId, btn.closest('.teacher-card'));
            });
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const teacherId = btn.dataset.id;
                openDeleteTeacherConfirmation(teacherId);
            });
        });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        const teachersList = document.getElementById('teachers-list');
        teachersList.innerHTML = '<p>Error loading teachers. Please try again.</p>';
    }
};

// Open Edit Teacher Form
const openEditTeacherForm = (teacherId, cardElement) => {
    // Find the teacher in the cache
    const teacher = teachersCache.find(t => t.teacher_id === parseInt(teacherId));
    if (!teacher) {
        alert('Teacher not found.');
        return;
    }

    // Remove any existing edit form or delete confirmation
    const existingForm = document.getElementById('edit-teacher-form');
    const existingConfirmation = document.getElementById('delete-teacher-confirmation');
    if (existingForm) {
        existingForm.parentElement.remove();
    }
    if (existingConfirmation) {
        existingConfirmation.parentElement.remove();
    }

    // Create a new form container
    const formContainer = document.createElement('div');
    formContainer.className = 'edit-teacher-card';
    formContainer.innerHTML = `
        <h3>Edit Teacher</h3>
        <form id="edit-teacher-form">
            <label for="teacher-first-name">First Name:</label>
            <input type="text" id="teacher-first-name" name="firstName" value="${teacher.first_name}" required>

            <label for="teacher-last-name">Last Name:</label>
            <input type="text" id="teacher-last-name" name="lastName" value="${teacher.last_name}" required>

            <label for="teacher-subject">Subject Teaches:</label>
            <input type="text" id="teacher-subject" name="subjectTeaches" value="${teacher.subject_teaches}" required>

            <div class="form-buttons">
                <button type="submit">Save Changes</button>
                <button type="button" id="cancel-edit-btn">Cancel</button>
            </div>
        </form>
    `;

    // Insert the form directly after the teacher card
    if (cardElement && cardElement.parentNode) {
        cardElement.parentNode.insertBefore(formContainer, cardElement.nextSibling);
    } else {
        // fallback: append at end
        const teachersList = document.getElementById('teachers-list');
        teachersList.appendChild(formContainer);
    }

    // Scroll to the form for better visibility
    formContainer.scrollIntoView({ behavior: 'smooth' });

    // Handle form submission
    document.getElementById('edit-teacher-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = {
            firstName: document.getElementById('teacher-first-name').value.trim(),
            lastName: document.getElementById('teacher-last-name').value.trim(),
            subjectTeaches: document.getElementById('teacher-subject').value.trim(),
        };

        try {
            const response = await fetch(`http://localhost:5000/api/admin/teachers/${teacherId}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}` // Include token if available
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
            }

            // Display confirmation message
            const messageDiv = document.createElement('div');
            messageDiv.className = 'update-message';
            messageDiv.textContent = 'Teacher updated successfully!';
            formContainer.appendChild(messageDiv);

            // Remove the message and form after 3 seconds
            setTimeout(() => {
                formContainer.remove();
                fetchTeachers(); // Refresh the list
            }, 3000);
        } catch (error) {
            console.error('Error updating teacher:', error);
            const messageDiv = document.createElement('div');
            messageDiv.className = 'error-message';
            messageDiv.textContent = `Error updating teacher: ${error.message}. Please try again.`;
            formContainer.appendChild(messageDiv);

            // Remove the error message after 3 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    });

    // Handle cancel button
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        formContainer.remove(); // Remove the form
    });
};

// Open Delete Teacher Confirmation Card
const openDeleteTeacherConfirmation = (teacherId) => {
    // Find the teacher in the cache
    const teacher = teachersCache.find(t => t.teacher_id === parseInt(teacherId));
    if (!teacher) {
        alert('Teacher not found.');
        return;
    }

    // Remove any existing edit form or delete confirmation
    const existingForm = document.getElementById('edit-teacher-form');
    const existingConfirmation = document.getElementById('delete-teacher-confirmation');
    if (existingForm) {
        existingForm.parentElement.remove();
    }
    if (existingConfirmation) {
        existingConfirmation.parentElement.remove();
    }

    // Create a new confirmation card
    const confirmationContainer = document.createElement('div');
    confirmationContainer.className = 'delete-teacher-card';
    confirmationContainer.id = 'delete-teacher-confirmation';
    confirmationContainer.innerHTML = `
        <h3>Confirm Delete Teacher</h3>
        <p><strong>ID:</strong> ${teacher.teacher_id}</p>
        <p><strong>Name:</strong> ${teacher.first_name} ${teacher.last_name}</p>
        <p><strong>Subject:</strong> ${teacher.subject_teaches}</p>
        <p class="delete-warning">You are about to delete this teacher. This action cannot be undone.</p>
        <div class="form-buttons">
            <button type="button" id="confirm-delete-btn">Delete</button>
            <button type="button" id="cancel-delete-btn">Cancel</button>
        </div>
    `;

    // Append the confirmation card at the end of the teachers list
    const teachersList = document.getElementById('teachers-list');
    teachersList.appendChild(confirmationContainer);

    // Scroll to the confirmation card for better visibility
    confirmationContainer.scrollIntoView({ behavior: 'smooth' });

    // Handle confirm delete button
    document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/teachers/${teacherId}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}` // Include token if available
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
            }

            // Display confirmation message
            const messageDiv = document.createElement('div');
            messageDiv.className = 'update-message';
            messageDiv.textContent = 'Teacher deleted successfully!';
            confirmationContainer.innerHTML = ''; // Clear the card content
            confirmationContainer.appendChild(messageDiv);

            // Remove the message and card after 3 seconds
            setTimeout(() => {
                confirmationContainer.remove();
                fetchTeachers(); // Refresh the list
            }, 3000);
        } catch (error) {
            console.error('Error deleting teacher:', error);
            const messageDiv = document.createElement('div');
            messageDiv.className = 'error-message';
            messageDiv.textContent = `Error deleting teacher: ${error.message}. Please try again.`;
            confirmationContainer.appendChild(messageDiv);

            // Remove the error message after 3 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    });

    // Handle cancel button
    document.getElementById('cancel-delete-btn').addEventListener('click', () => {
        confirmationContainer.remove(); // Remove the confirmation card
    });
};

// Navigation and Other Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Sidebar navigation
    const dashboardBtn = document.getElementById('dashboard-btn');
    const editStudentsParentsBtn = document.getElementById('edit-students-parents-btn');
    const manageTeachersBtn = document.getElementById('manage-teachers-btn');
    const deleteStudentsBtn = document.getElementById('delete-students-btn');
    const manageSchedulesBtn = document.getElementById('manage-schedules-btn');
    const logoutBtn = document.getElementById('logout-btn');

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

    // Placeholder for Add Student, Add Teacher, Add Parent links
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

    // Initialize the Page
    fetchTeachers();
});