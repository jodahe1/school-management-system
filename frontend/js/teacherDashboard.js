// frontend/js/teacherDashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    // OLD CODE - Teacher Authentication
    const teacher = JSON.parse(localStorage.getItem('teacher'));
    if (!teacher) {
        window.location.href = 'teacherLogin.html';
        return;
    }

    // Store teacher ID for later use
    const teacherId = teacher.user_id;
    document.getElementById('teacher-id').value = teacherId;

    // OLD CODE - Display Profile
    document.getElementById('profile-details').innerHTML = `
        <p><strong>Name:</strong> ${teacher.first_name} ${teacher.last_name}</p>
        <p><strong>Email:</strong> ${teacher.email}</p>
        <p><strong>Subject:</strong> ${teacher.subject_teaches}</p>
    `;

    // NEW CODE - Navigation functions
    function showSection(sectionId) {
        document.querySelectorAll('main > section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');
    }

    // NEW CODE - Back buttons
    document.getElementById('backToSchedule').addEventListener('click', () => showSection('schedule-section'));
    document.getElementById('backToClasses').addEventListener('click', () => showSection('classes-section'));
    document.getElementById('backToStudents').addEventListener('click', () => showSection('students-section'));
    document.getElementById('backToStudentFromAttendance').addEventListener('click', () => showSection('student-section'));

    // OLD CODE - Fetch and display Schedule (UPDATED)
    async function loadSchedule() {
        try {
            const response = await fetch(`http://localhost:5000/api/teacher/schedule?teacher_id=${teacherId}`);
            const schedule = await response.json();

            const tbody = document.querySelector('#schedule-table tbody');
            tbody.innerHTML = '';
            
            if (schedule.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">No schedules found</td></tr>';
            } else {
                schedule.forEach((item) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="clickable" data-class-id="${item.class_id}">${item.class_name}</td>
                        <td>${item.subject_name}</td>
                        <td>${item.day_of_week}</td>
                        <td>${item.period_number}</td>
                        <td>${item.start_time}</td>
                        <td>${item.end_time}</td>
                    `;
                    tbody.appendChild(row);
                });

                // NEW CODE - Add click event to class names
                document.querySelectorAll('#schedule-table td[data-class-id]').forEach(cell => {
                    cell.addEventListener('click', async () => {
                        const classId = cell.getAttribute('data-class-id');
                        await loadClassStudents(classId);
                        showSection('classes-section');
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
            alert('Failed to load schedule');
        }
    }

    // NEW CODE - Load classes for teacher
    async function loadTeacherClasses() {
        try {
            const response = await fetch(`http://localhost:5000/api/teacher/classes?teacher_id=${teacherId}`);
            const classes = await response.json();

            const tbody = document.querySelector('#classes-table tbody');
            tbody.innerHTML = '';
            
            if (classes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2">No classes found</td></tr>';
            } else {
                classes.forEach((cls) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${cls.class_id}</td>
                        <td class="clickable" data-class-id="${cls.class_id}">${cls.class_name}</td>
                    `;
                    tbody.appendChild(row);
                });

                // Add click event to class names
                document.querySelectorAll('#classes-table td[data-class-id]').forEach(cell => {
                    cell.addEventListener('click', async () => {
                        const classId = cell.getAttribute('data-class-id');
                        await loadClassStudents(classId);
                        showSection('students-section');
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            alert('Failed to load classes');
        }
    }

    // NEW CODE - Load students in a class
    async function loadClassStudents(classId) {
        try {
            const response = await fetch(`http://localhost:5000/api/teacher/students?class_id=${classId}`);
            const students = await response.json();

            const tbody = document.querySelector('#students-table tbody');
            tbody.innerHTML = '';
            
            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">No students found in this class</td></tr>';
            } else {
                students.forEach((student) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${student.student_id}</td>
                        <td class="clickable" data-student-id="${student.student_id}">${student.first_name} ${student.last_name}</td>
                        <td>${student.email}</td>
                    `;
                    tbody.appendChild(row);
                });

                // Add click event to student names
                document.querySelectorAll('#students-table td[data-student-id]').forEach(cell => {
                    cell.addEventListener('click', async () => {
                        const studentId = cell.getAttribute('data-student-id');
                        await loadStudentDetails(studentId);
                        showSection('student-section');
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            alert('Failed to load students');
        }
    }

    // NEW CODE - Load student details
    async function loadStudentDetails(studentId) {
        try {
            const response = await fetch(`http://localhost:5000/api/teacher/student?student_id=${studentId}`);
            const student = await response.json();

            document.getElementById('student-id').value = studentId;
            document.getElementById('student-name').textContent = `${student.first_name} ${student.last_name}`;
            
            document.getElementById('student-details').innerHTML = `
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Class:</strong> ${student.class_name}</p>
            `;

            // Set class ID in attendance form
            document.getElementById('class-id').value = student.class_id;
        } catch (error) {
            console.error('Error fetching student details:', error);
            alert('Failed to load student details');
        }
    }

    // NEW CODE - Action buttons
    document.getElementById('recordAttendanceBtn').addEventListener('click', () => {
        showSection('attendance-section');
    });

    // OLD CODE - Attendance form submission (UPDATED)
    document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            teacher_id: teacherId,
            student_id: document.getElementById('student-id').value,
            class_id: document.getElementById('class-id').value,
            subject_id: document.getElementById('subject-id').value,
            semester_id: document.getElementById('semester-id').value,
            date: document.getElementById('date').value,
            period_number: document.getElementById('period-number').value,
            status: document.getElementById('status').value
        };

        try {
            const response = await fetch('http://localhost:5000/api/teacher/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Attendance recorded successfully!');
                showSection('student-section');
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error recording attendance:', error);
            alert('Failed to record attendance');
        }
    });

    // OLD CODE - Logout Button
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.removeItem('teacher');
        window.location.href = 'teacherLogin.html';
    });

    // Initialize the page
    await loadSchedule();
    await loadTeacherClasses();
});