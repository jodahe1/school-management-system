document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const teacher = JSON.parse(localStorage.getItem('teacher'));
    if (!teacher) {
        window.location.href = 'teacherLogin.html';
        return;
    }

    const teacherId = teacher.user_id;
    
    // Set teacher ID in all forms
    document.querySelectorAll('[id$="-teacher-id"]').forEach(el => {
        el.value = teacherId;
    });
    document.getElementById('teacher-id').value = teacherId;

    // Display profile
    document.getElementById('profile-details').innerHTML = `
        <p><strong>Name:</strong> ${teacher.first_name} ${teacher.last_name}</p>
        <p><strong>Email:</strong> ${teacher.email}</p>
        <p><strong>Subject:</strong> ${teacher.subject_teaches}</p>
    `;

    // Navigation functions
    function showSection(sectionId) {
        document.querySelectorAll('main > section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');
    }

    function showStudentSubsection(subsectionId) {
        document.querySelectorAll('#student-section > div').forEach(div => {
            if (div.classList.contains('form-container')) {
                div.classList.add('hidden');
            }
        });
        if (subsectionId) {
            document.getElementById(subsectionId).classList.remove('hidden');
        }
    }

    // Back buttons
    document.getElementById('backToSchedule').addEventListener('click', () => showSection('schedule-section'));
    document.getElementById('backToClasses').addEventListener('click', () => showSection('classes-section'));
    document.getElementById('backToStudents').addEventListener('click', () => showSection('students-section'));
    document.getElementById('backToStudentFromAttendance').addEventListener('click', () => showSection('student-section'));
    document.getElementById('backToStudentFromSubmissions').addEventListener('click', () => {
        document.getElementById('submissions-view').classList.add('hidden');
    });

    // Action buttons
    document.getElementById('recordAttendanceBtn').addEventListener('click', () => {
        showSection('attendance-section');
    });

    document.getElementById('assignGradeBtn').addEventListener('click', async () => {
        await loadGradeFormData();
        showStudentSubsection('grade-form');
    });

    document.getElementById('sendMaterialBtn').addEventListener('click', async () => {
        await loadMaterialFormData();
        showStudentSubsection('material-form');
    });

    document.getElementById('createAssignmentBtn').addEventListener('click', async () => {
        await loadAssignmentFormData();
        showStudentSubsection('assignment-form');
    });

    document.getElementById('viewSubmissionsBtn').addEventListener('click', async () => {
        await loadStudentSubmissions();
        document.getElementById('submissions-view').classList.remove('hidden');
    });

    // Check for unread messages
    async function checkUnreadMessages() {
        try {
            const response = await fetch(`http://localhost:5000/api/message-board/messages?user_id=${teacherId}&role=teacher`);
            if (!response.ok) throw new Error('Failed to check messages');
            
            const messages = await response.json();
            const lastRead = localStorage.getItem('lastMessageRead') || '1970-01-01T00:00:00Z';
            const unreadCount = messages.filter(msg => new Date(msg.posted_at) > new Date(lastRead)).length;
            updateMessageBadge(unreadCount);
        } catch (error) {
            console.error('Error checking messages:', error);
        }
    }

    // Update message notification badge
    function updateMessageBadge(count) {
        const badge = document.getElementById('messageBadge');
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    // Load initial data
    await loadSchedule();
    await loadTeacherClasses();
    await checkUnreadMessages();

    // Refresh messages every 30 seconds
    setInterval(checkUnreadMessages, 30000);

    // Form submissions
    document.getElementById('attendanceForm').addEventListener('submit', handleAttendanceSubmit);
    document.getElementById('gradeForm').addEventListener('submit', handleGradeSubmit);
    document.getElementById('materialForm').addEventListener('submit', handleMaterialSubmit);
    document.getElementById('assignmentForm').addEventListener('submit', handleAssignmentSubmit);

    // Helper functions
    async function loadSchedule() {
        try {
            const response = await fetch(`http://localhost:5000/api/teacher/schedule?teacher_id=${teacherId}`);
            const schedule = await response.json();

            const tbody = document.querySelector('#schedule-table tbody');
            tbody.innerHTML = '';
            
            if (schedule.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">No schedules found</td></tr>';
            } else {
                schedule.forEach(item => {
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

                // Add click events to class names
                document.querySelectorAll('#schedule-table td[data-class-id]').forEach(cell => {
                    cell.addEventListener('click', async () => {
                        const classId = cell.getAttribute('data-class-id');
                        await loadClassStudents(classId);
                        showSection('classes-section');
                    });
                });
            }
        } catch (error) {
            console.error('Error loading schedule:', error);
            alert('Failed to load schedule');
        }
    }

    async function loadTeacherClasses() {
        try {
            const response = await fetch(`http://localhost:5000/api/teacher/classes?teacher_id=${teacherId}`);
            const classes = await response.json();

            const tbody = document.querySelector('#classes-table tbody');
            tbody.innerHTML = '';
            
            if (classes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2">No classes found</td></tr>';
            } else {
                classes.forEach(cls => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${cls.class_id}</td>
                        <td class="clickable" data-class-id="${cls.class_id}">${cls.class_name}</td>
                    `;
                    tbody.appendChild(row);
                });

                // Add click events to class names
                document.querySelectorAll('#classes-table td[data-class-id]').forEach(cell => {
                    cell.addEventListener('click', async () => {
                        const classId = cell.getAttribute('data-class-id');
                        await loadClassStudents(classId);
                        showSection('students-section');
                    });
                });
            }
        } catch (error) {
            console.error('Error loading classes:', error);
            alert('Failed to load classes');
        }
    }

    async function loadClassStudents(classId) {
        try {
            const response = await fetch(`http://localhost:5000/api/teacher/students?class_id=${classId}`);
            const students = await response.json();

            const tbody = document.querySelector('#students-table tbody');
            tbody.innerHTML = '';
            
            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">No students found</td></tr>';
            } else {
                students.forEach(student => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${student.student_id}</td>
                        <td class="clickable" data-student-id="${student.student_id}">${student.first_name} ${student.last_name}</td>
                        <td>${student.email}</td>
                    `;
                    tbody.appendChild(row);
                });

                // Add click events to student names
                document.querySelectorAll('#students-table td[data-student-id]').forEach(cell => {
                    cell.addEventListener('click', async () => {
                        const studentId = cell.getAttribute('data-student-id');
                        await loadStudentDetails(studentId);
                        showSection('student-section');
                    });
                });
            }
        } catch (error) {
            console.error('Error loading students:', error);
            alert('Failed to load students');
        }
    }

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

            // Set default class ID in forms
            document.getElementById('class-id').value = student.class_id;
            document.getElementById('material-class-id').value = student.class_id;
            document.getElementById('assignment-class-id').value = student.class_id;
        } catch (error) {
            console.error('Error loading student details:', error);
            alert('Failed to load student details');
        }
    }

    async function loadStudentSubmissions() {
        try {
            const studentId = document.getElementById('student-id').value;
            const response = await fetch(`http://localhost:5000/api/teacher/submissions?teacher_id=${teacherId}&student_id=${studentId}`);
            const submissions = await response.json();

            const tbody = document.querySelector('#submissions-table tbody');
            tbody.innerHTML = '';
            
            if (submissions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">No submissions found</td></tr>';
            } else {
                submissions.forEach(sub => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${sub.assignment_title}</td>
                        <td>${sub.subject_name}</td>
                        <td><a href="${sub.submitted_file_path}" target="_blank">View File</a></td>
                        <td>${new Date(sub.submission_date).toLocaleString()}</td>
                        <td>${sub.grade || 'Not graded'}</td>
                        <td>${sub.feedback || 'No feedback'}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
            alert('Failed to load submissions');
        }
    }

    async function loadGradeFormData() {
        try {
            // Load subjects for dropdown
            const response = await fetch(`http://localhost:5000/api/teacher/schedule?teacher_id=${teacherId}`);
            const schedule = await response.json();
            
            const subjectSelect = document.getElementById('grade-subject-id');
            subjectSelect.innerHTML = '';
            
            const uniqueSubjects = [...new Set(schedule.map(item => item.subject_id))];
            uniqueSubjects.forEach(subjectId => {
                const subject = schedule.find(item => item.subject_id === subjectId);
                const option = document.createElement('option');
                option.value = subject.subject_id;
                option.textContent = subject.subject_name;
                subjectSelect.appendChild(option);
            });

            // Load semesters
            const semestersResponse = await fetch('http://localhost:5000/api/semesters');
            const semesters = await semestersResponse.json();
            
            const semesterSelect = document.getElementById('grade-semester-id');
            semesterSelect.innerHTML = '';
            
            semesters.forEach(semester => {
                const option = document.createElement('option');
                option.value = semester.semester_id;
                option.textContent = semester.semester_name;
                if (semester.is_active) option.selected = true;
                semesterSelect.appendChild(option);
            });

            // Set student ID
            document.getElementById('grade-student-id').value = document.getElementById('student-id').value;
        } catch (error) {
            console.error('Error loading grade form data:', error);
            alert('Failed to load grade form data');
        }
    }

    async function loadMaterialFormData() {
        try {
            // Load classes and subjects
            const scheduleResponse = await fetch(`http://localhost:5000/api/teacher/schedule?teacher_id=${teacherId}`);
            const schedule = await scheduleResponse.json();
            
            const classSelect = document.getElementById('material-class-id');
            const subjectSelect = document.getElementById('material-subject-id');
            
            classSelect.innerHTML = '';
            subjectSelect.innerHTML = '';
            
            const uniqueClasses = [...new Set(schedule.map(item => item.class_id))];
            const uniqueSubjects = [...new Set(schedule.map(item => item.subject_id))];
            
            uniqueClasses.forEach(classId => {
                const cls = schedule.find(item => item.class_id === classId);
                const option = document.createElement('option');
                option.value = cls.class_id;
                option.textContent = cls.class_name;
                classSelect.appendChild(option);
            });
            
            uniqueSubjects.forEach(subjectId => {
                const subject = schedule.find(item => item.subject_id === subjectId);
                const option = document.createElement('option');
                option.value = subject.subject_id;
                option.textContent = subject.subject_name;
                subjectSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading material form data:', error);
            alert('Failed to load material form data');
        }
    }

    async function loadAssignmentFormData() {
        try {
            // Similar to material form
            const scheduleResponse = await fetch(`http://localhost:5000/api/teacher/schedule?teacher_id=${teacherId}`);
            const schedule = await scheduleResponse.json();
            
            const classSelect = document.getElementById('assignment-class-id');
            const subjectSelect = document.getElementById('assignment-subject-id');
            
            classSelect.innerHTML = '';
            subjectSelect.innerHTML = '';
            
            const uniqueClasses = [...new Set(schedule.map(item => item.class_id))];
            const uniqueSubjects = [...new Set(schedule.map(item => item.subject_id))];
            
            uniqueClasses.forEach(classId => {
                const cls = schedule.find(item => item.class_id === classId);
                const option = document.createElement('option');
                option.value = cls.class_id;
                option.textContent = cls.class_name;
                classSelect.appendChild(option);
            });
            
            uniqueSubjects.forEach(subjectId => {
                const subject = schedule.find(item => item.subject_id === subjectId);
                const option = document.createElement('option');
                option.value = subject.subject_id;
                option.textContent = subject.subject_name;
                subjectSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading assignment form data:', error);
            alert('Failed to load assignment form data');
        }
    }

    // Form handlers
    async function handleAttendanceSubmit(e) {
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
    }

    async function handleGradeSubmit(e) {
        e.preventDefault();
        
        const formData = {
            teacher_id: teacherId,
            student_id: document.getElementById('grade-student-id').value,
            subject_id: document.getElementById('grade-subject-id').value,
            semester_id: document.getElementById('grade-semester-id').value,
            grade: document.getElementById('grade-value').value,
            comments: document.getElementById('grade-comments').value
        };

        try {
            const response = await fetch('http://localhost:5000/api/teacher/grades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Grade assigned successfully!');
                showStudentSubsection(null);
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error assigning grade:', error);
            alert('Failed to assign grade');
        }
    }

    async function handleMaterialSubmit(e) {
        e.preventDefault();
        
        const formData = {
            teacher_id: teacherId,
            class_id: document.getElementById('material-class-id').value,
            subject_id: document.getElementById('material-subject-id').value,
            title: document.getElementById('material-title').value,
            file_path: document.getElementById('material-file').value
        };

        try {
            const response = await fetch('http://localhost:5000/api/teacher/materials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Material uploaded successfully!');
                showStudentSubsection(null);
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error uploading material:', error);
            alert('Failed to upload material');
        }
    }

    async function handleAssignmentSubmit(e) {
        e.preventDefault();
        
        const formData = {
            teacher_id: teacherId,
            class_id: document.getElementById('assignment-class-id').value,
            subject_id: document.getElementById('assignment-subject-id').value,
            semester_id: 1, // Default for now
            title: document.getElementById('assignment-title').value,
            description: document.getElementById('assignment-description').value,
            due_date: document.getElementById('assignment-due-date').value,
            file_path: document.getElementById('assignment-file').value
        };

        try {
            const response = await fetch('http://localhost:5000/api/teacher/assignments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Assignment created successfully!');
                showStudentSubsection(null);
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error creating assignment:', error);
            alert('Failed to create assignment');
        }
    }

    // Logout
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.removeItem('teacher');
        window.location.href = 'teacherLogin.html');
    });
});