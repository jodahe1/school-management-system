// frontend/js/teacherDashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    const teacher = JSON.parse(localStorage.getItem('teacher'));
    if (!teacher) {
        window.location.href = 'teacherLogin.html'; // Redirect to login if not logged in
        return;
    }

    // Display Profile
    document.getElementById('profile-details').innerHTML = `
        <p><strong>Name:</strong> ${teacher.first_name} ${teacher.last_name}</p>
        <p><strong>Email:</strong> ${teacher.email}</p>
        <p><strong>Subject:</strong> ${teacher.subject_teaches}</p>
    `;

    // Fetch Schedule
    try {
        const response = await fetch(`http://localhost:5000/api/teacher/schedule?teacher_id=${teacher.user_id}`);
        const schedule = await response.json();

        const tbody = document.querySelector('#schedule-table tbody');
        if (schedule.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No schedules found</td></tr>';
        } else {
            schedule.forEach((item) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.class_name}</td>
                    <td>${item.subject_name}</td>
                    <td>${item.day_of_week}</td>
                    <td>${item.period_number}</td>
                    <td>${item.start_time}</td>
                    <td>${item.end_time}</td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error fetching schedule:', error);
    }

    // Logout Button
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.removeItem('teacher'); // Clear teacher info
        window.location.href = 'teacherLogin.html'; // Redirect to login
    });
});