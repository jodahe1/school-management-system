// classrom.js
document.addEventListener('DOMContentLoaded', async () => {
    const teacher = JSON.parse(localStorage.getItem('teacher'));
    if (!teacher) {
      window.location.href = 'teacherLogin.html';
      return;
    }
  
    const teacherId = teacher.user_id;
    document.getElementById('attendance-date').valueAsDate = new Date();
  
    await loadClasses(teacherId);
  
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
  
    document.getElementById('start-attendance').addEventListener('click', () => {
      const subjectId = document.getElementById('subject-select').value;
      if (!subjectId) {
        alert('Please select a subject first');
        return;
      }
  
      document.querySelectorAll('.status-select').forEach(select => {
        select.disabled = false;
      });
  
      document.querySelectorAll('.attendance-status-cell, .attendance-status-header').forEach(el => {
        el.classList.remove('hidden');
      });
  
      document.getElementById('submit-attendance').classList.remove('hidden');
    });
  
    document.getElementById('submit-attendance').addEventListener('click', submitAttendance);
  });
  
  // Load teacher's classes
  async function loadClasses(teacherId) {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/classes?teacher_id=${teacherId}`);
      const classes = await response.json();
      const classSelect = document.getElementById('class-select');
      classSelect.innerHTML = '<option value="">-- Select Class --</option>';
  
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
  
  // Load subjects for selected class
  async function loadSubjects(teacherId, classId) {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/schedule?teacher_id=${teacherId}`);
      const schedule = await response.json();
      const subjectSelect = document.getElementById('subject-select');
      subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
  
      const filteredSubjects = schedule.filter(item => item.class_id === parseInt(classId));
      const uniqueSubjects = [];
  
      filteredSubjects.forEach(item => {
        if (!uniqueSubjects.includes(item.subject_id)) {
          const option = document.createElement('option');
          option.value = item.subject_id;
          option.textContent = item.subject_name;
          subjectSelect.appendChild(option);
          uniqueSubjects.push(item.subject_id);
        }
      });
  
      subjectSelect.disabled = uniqueSubjects.length === 0;
      if (uniqueSubjects.length === 0) {
        alert('No subjects found for this class');
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      alert('Failed to load subjects');
    }
  }
  
  // Load students for selected class
  async function loadStudents(classId) {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/students?class_id=${classId}`);
      const students = await response.json();
      const tbody = document.querySelector('#student-table tbody');
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
          <td class="attendance-status-cell hidden">
            <select class="status-select" data-student-id="${student.student_id}" disabled>
              <option value="present" selected>Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </td>
        `;
        tbody.appendChild(row);
      });
  
      document.getElementById('submit-attendance').classList.add('hidden');
      document.querySelectorAll('.attendance-status-cell, .attendance-status-header').forEach(el => {
        el.classList.add('hidden');
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

    if (!classId || !subjectId || !date || !period) {
        alert('Please fill all required fields: class, subject, date, and period.');
        return;
    }

    if (new Date(date) > new Date()) {
        alert('Date cannot be in the future.');
        return;
    }

    const attendanceRecords = [];
    document.querySelectorAll('.status-select').forEach(select => {
        attendanceRecords.push({
            student_id: select.dataset.studentId,
            status: select.value
        });
    });

    try {
        const response = await fetch('http://localhost:5000/api/teacher/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                teacher_id: JSON.parse(localStorage.getItem('teacher')).user_id,
                class_id: classId,
                subject_id: subjectId,
                semester_id: await getActiveSemesterId(),
                date: date,
                period_number: period,
                attendance: attendanceRecords
            })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.message || 'Failed to record attendance'}`);
            return;
        }

        alert('Attendance recorded successfully!');
        document.getElementById('submit-attendance').classList.add('hidden');
        document.querySelectorAll('.status-select').forEach(select => {
            select.disabled = true;
            select.value = 'present';
        });

    } catch (error) {
        console.error('Error submitting attendance:', error);
        alert('Failed to submit attendance. Please check your connection and try again.');
    }
}
  
  // Helper: Get active semester
  async function getActiveSemesterId() {
    try {
      const response = await fetch('http://localhost:5000/api/semesters');
      const semesters = await response.json();
      const activeSemester = semesters.find(s => s.is_active);
      return activeSemester?.semester_id || 1;
    } catch (error) {
      console.error('Error fetching semesters:', error);
      return 1;
    }
  }