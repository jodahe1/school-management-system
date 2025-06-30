// frontend/js/admin-edit-student-parent.js

// DOM Elements
const classesList = document.getElementById('classes-list');
const editStudentForm = document.getElementById('edit-student-form');
const updateMessage = document.getElementById('update-message');

let expandedClassId = null;
let expandedStudentsDiv = null;
let expandedInfoDiv = null;

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
            const card = document.createElement('div');
            card.className = 'class-card';
            card.textContent = cls.class_name;
            card.tabIndex = 0;
            card.style.position = 'relative';
            card.onclick = () => toggleClassStudents(cls.class_id, cls.class_name, card);
            card.onkeypress = (e) => { if (e.key === 'Enter' || e.key === ' ') card.onclick(); };
            classesList.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        classesList.innerHTML = '<p>Error loading classes. Please try again.</p>';
    }
};

// Toggle Students for a Class
const toggleClassStudents = async (classId, className, classCard) => {
    // Collapse if already expanded
    if (expandedClassId === classId) {
        if (expandedStudentsDiv) expandedStudentsDiv.remove();
        if (expandedInfoDiv) expandedInfoDiv.remove();
        expandedClassId = null;
        expandedStudentsDiv = null;
        expandedInfoDiv = null;
        return;
    }
    // Collapse previous
    if (expandedStudentsDiv) expandedStudentsDiv.remove();
    if (expandedInfoDiv) expandedInfoDiv.remove();
    expandedClassId = classId;
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
            studentCard.textContent = `${student.first_name} ${student.last_name}`;
            studentCard.tabIndex = 0;
            studentCard.onclick = () => showStudentInfoTable(student.student_id, studentCard);
            studentCard.onkeypress = (e) => { if (e.key === 'Enter' || e.key === ' ') studentCard.onclick(); };
            expandedStudentsDiv.appendChild(studentCard);
        });
    } catch (error) {
        expandedStudentsDiv.innerHTML = '<p>Error loading students. Please try again.</p>';
    }
};

// Show Student Info Table
const showStudentInfoTable = async (studentId, studentCard) => {
    if (expandedInfoDiv) expandedInfoDiv.remove();
    expandedInfoDiv = document.createElement('div');
    expandedInfoDiv.className = 'student-info-table-container';
    expandedInfoDiv.innerHTML = '<p>Loading student info...</p>';
    studentCard.insertAdjacentElement('afterend', expandedInfoDiv);
    try {
        const response = await fetch(`http://localhost:5000/api/admin/students/${studentId}/details`);
        const d = await response.json();
        if (!d) {
            expandedInfoDiv.innerHTML = '<p>Student not found.</p>';
            return;
        }
        // Render info table and Edit button in a flex container
        expandedInfoDiv.innerHTML = `
        <div class="info-edit-flex">
          <div class="info-table-side">
            <table class="student-info-table">
                <tr><th>Student First Name</th><td>${d.student_first_name || ''}</td></tr>
                <tr><th>Student Last Name</th><td>${d.student_last_name || ''}</td></tr>
                <tr><th>Date of Birth</th><td>${d.date_of_birth ? d.date_of_birth.split('T')[0] : ''}</td></tr>
                <tr><th>Parent First Name</th><td>${d.parent_first_name || ''}</td></tr>
                <tr><th>Parent Last Name</th><td>${d.parent_last_name || ''}</td></tr>
                <tr><th>Parent Phone</th><td>${d.phone_number || ''}</td></tr>
            </table>
            <button class="edit-info-btn" style="margin-top:1rem;">Edit</button>
            <div class="update-message" style="display:none;"></div>
          </div>
          <div class="edit-form-side" style="display:none;"></div>
        </div>
        `;
        const editBtn = expandedInfoDiv.querySelector('.edit-info-btn');
        const formContainer = expandedInfoDiv.querySelector('.edit-form-side');
        const updateMsg = expandedInfoDiv.querySelector('.update-message');
        editBtn.onclick = () => {
            // Only show the two-column form, hide everything else
            expandedInfoDiv.innerHTML = `
                <form class="edit-student-parent-form form-two-column" style="margin-top:1rem;">
                    <div class="form-column student-info">
                        <h4 style="margin-bottom:0.5rem;">Edit Student Info</h4>
                        <div class="form-row-single">
                            <label>First Name:
                                <input type="text" name="student_first_name" value="${d.student_first_name || ''}" required>
                            </label>
                        </div>
                        <div class="form-row-single">
                            <label>Last Name:
                                <input type="text" name="student_last_name" value="${d.student_last_name || ''}" required>
                            </label>
                        </div>
                        <div class="form-row-single">
                            <label>Date of Birth:
                                <input type="date" name="student_dob" value="${d.date_of_birth ? d.date_of_birth.split('T')[0] : ''}" required>
                            </label>
                        </div>
                    </div>
                    <div class="form-column parent-info">
                        <h4 style="margin-bottom:0.5rem;">Edit Parent Info</h4>
                        <div class="form-row-single">
                            <label>First Name:
                                <input type="text" name="parent_first_name" value="${d.parent_first_name || ''}" required>
                            </label>
                        </div>
                        <div class="form-row-single">
                            <label>Last Name:
                                <input type="text" name="parent_last_name" value="${d.parent_last_name || ''}" required>
                            </label>
                        </div>
                        <div class="form-row-single">
                            <label>Phone Number:
                                <input type="text" name="parent_phone" value="${d.phone_number || ''}" required>
                            </label>
                        </div>
                    </div>
                    <div class="form-actions-row">
                        <button type="submit" class="submit-btn">Save Changes</button>
                        <button type="button" class="cancel-btn">Cancel</button>
                    </div>
                </form>
                <div class="update-message" style="display:none;"></div>
            `;
            const formEl = expandedInfoDiv.querySelector('form');
            const updateMsg = expandedInfoDiv.querySelector('.update-message');
            // Cancel button restores the info table and Edit button
            formEl.querySelector('.cancel-btn').onclick = () => {
                showStudentInfoTable(studentId, studentCard);
            };
            // Form submit
            formEl.onsubmit = async (e) => {
                e.preventDefault();
                const fd = new FormData(formEl);
                const studentData = {
                    firstName: fd.get('student_first_name').trim(),
                    lastName: fd.get('student_last_name').trim(),
                    dob: fd.get('student_dob').trim(),
                };
                const parentData = {
                    firstName: fd.get('parent_first_name').trim(),
                    lastName: fd.get('parent_last_name').trim(),
                    phoneNumber: fd.get('parent_phone').trim(),
                };
                try {
                    const studentResponse = await fetch(`http://localhost:5000/api/admin/students/${studentId}/update`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(studentData),
                    });
                    if (!studentResponse.ok) throw new Error('Failed to update student information');
                    if (d.parent_id) {
                        const parentResponse = await fetch(`http://localhost:5000/api/admin/parents/${d.parent_id}/update`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(parentData),
                        });
                        if (!parentResponse.ok) throw new Error('Failed to update parent information');
                    }
                    updateMsg.textContent = 'Student and parent information updated successfully!';
                    updateMsg.style.color = 'green';
                    updateMsg.style.display = 'block';
                    setTimeout(() => {
                        showStudentInfoTable(studentId, studentCard);
                    }, 1200);
                } catch (error) {
                    updateMsg.textContent = 'Error saving changes. Please try again.';
                    updateMsg.style.color = 'red';
                    updateMsg.style.display = 'block';
                }
            };
        };
    } catch (error) {
        expandedInfoDiv.innerHTML = '<p>Error loading student details. Please try again.</p>';
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
        const studentResponse = await fetch(`http://localhost:5000/api/admin/students/${selectedStudentId}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData),
        });

        if (!studentResponse.ok) {
            throw new Error('Failed to update student information');
        }

        // Update Parent
        const response = await fetch(`http://localhost:5000/api/admin/students/${selectedStudentId}/details`);
        const studentDetails = await response.json();
        const parentId = studentDetails.parent_id;

        if (parentId) {
            const parentResponse = await fetch(`http://localhost:5000/api/admin/parents/${parentId}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parentData),
            });

            if (!parentResponse.ok) {
                throw new Error('Failed to update parent information');
            }
        }

        // Display confirmation message
        updateMessage.textContent = 'Student and parent information updated successfully!';
        updateMessage.style.color = 'green';
        updateMessage.style.display = 'block'; // Ensure the message is visible

        // Clear the message after 3 seconds
        setTimeout(() => {
            updateMessage.textContent = '';
            updateMessage.style.display = 'none';
        }, 3000);
    } catch (error) {
        console.error('Error saving changes:', error);
        updateMessage.textContent = 'Error saving changes. Please try again.';
        updateMessage.style.color = 'red';
        updateMessage.style.display = 'block';

        // Clear the error message after 3 seconds
        setTimeout(() => {
            updateMessage.textContent = '';
            updateMessage.style.display = 'none';
        }, 3000);
    }
});

// Navigation and Other Event Listeners
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

    // Initialize the Page
    fetchClasses();
});