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

// Initialize the Dashboard
fetchAnalytics();
