document.addEventListener('DOMContentLoaded', async () => {
    const teacher = JSON.parse(localStorage.getItem('teacher'));
    if (!teacher) {
        window.location.href = 'teacherLogin.html';
        return;
    }

    const teacherId = teacher.user_id;
    
    // Set today's date as default
    document.getElementById('attendance-date').valueAsDate = new Date();

    // Load classes for this teacher
    await loadClasses(teacherId);

    // Class selection handler
    document.getElementById('class-select').addEventListener('change', async (e) => {
        const classId = e.target.value;
        if (classId) {
            await loadSubjects(teacherId, classId);
            await loadStudents(classId);
        } else {
            document.getElementById('subject-select').disabled = true;
            document.getElementById('student-table').querySelector('tbody').innerHTML = 
                '<tr><td colspan="3">Select a class to view students</td></tr>';
        }
    });

    // Submit attendance handler
    document.getElementById('submit-attendance').addEventListener('click', submitAttendance);
});

async function loadClasses(teacherId) {
    try {
        const response = await fetch(`http://localhost:5000/api/teacher/classes?teacher_id=${teacherId}`);
        const classes = await response.json();
        
        const classSelect = document.getElementById('class-select');
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.class_id;
            option.textContent = cls.class_name;
            classSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading classes:', error);
        alert('Failed to load classes');
    }
}

async function loadSubjects(teacherId, classId) {
    try {
        const response = await fetch(`http://localhost:5000/api/teacher/schedule?teacher_id=${teacherId}`);
        const schedule = await response.json();
        
        const subjectSelect = document.getElementById('subject-select');
        subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
        
        // Filter subjects for this class
        const classSubjects = schedule.filter(item => item.class_id === classId);
        
        // Remove duplicate subjects
        const uniqueSubjects = [];
        classSubjects.forEach(item => {
            if (!uniqueSubjects.some(sub => sub.subject_id === item.subject_id)) {
                uniqueSubjects.push(item);
            }
        });
        
        uniqueSubjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.subject_id;
            option.textContent = subject.subject_name;
            subjectSelect.appendChild(option);
        });
        
        subjectSelect.disabled = false;
    } catch (error) {
        console.error('Error loading subjects:', error);
        alert('Failed to load subjects');
    }
}

async function loadStudents(classId) {
    try {
        const response = await fetch(`http://localhost:5000/api/teacher/students?class_id=${classId}`);
        const students = await response.json();
        
        const tbody = document.getElementById('student-table').querySelector('tbody');
        tbody.innerHTML = '';
        
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No students in this class</td></tr>';
            return;
        }
        
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.student_id}</td>
                <td>${student.first_name} ${student.last_name}</td>
                <td>
                    <select class="status-select" data-student-id="${student.student_id}">
                        <option value="present" selected>Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                    </select>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading students:', error);
        alert('Failed to load students');
    }
}

async function submitAttendance() {
    const classId = document.getElementById('class-select').value;
    const subjectId = document.getElementById('subject-select').value;
    const date = document.getElementById('attendance-date').value;
    const period = document.getElementById('period-number').value;
    
    if (!classId || !subjectId || !date) {
        alert('Please select class, subject, and date');
        return;
    }
    
    // Get all student statuses
    const attendanceRecords = [];
    document.querySelectorAll('#student-table .status-select').forEach(select => {
        attendanceRecords.push({
            student_id: select.dataset.studentId,
            status: select.value
        });
    });
    
    const teacher = JSON.parse(localStorage.getItem('teacher'));
    
    try {
        const response = await fetch('http://localhost:5000/api/teacher/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                teacher_id: teacher.user_id,
                class_id: classId,
                subject_id: subjectId,
                semester_id: 1, // You may need to adjust this
                date: date,
                period_number: period,
                attendance: attendanceRecords
            })
        });
        
        if (response.ok) {
            alert('Attendance recorded successfully!');
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'Failed to record attendance'}`);
        }
    } catch (error) {
        console.error('Error submitting attendance:', error);
        alert('Failed to submit attendance');
    }
}