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

// Initialize the Page
fetchTeachers();