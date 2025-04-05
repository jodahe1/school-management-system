document.addEventListener('DOMContentLoaded', () => {
    const classesSection = document.getElementById('classes-section');
    const classesList = document.getElementById('classes-list');
    const schedulesSection = document.getElementById('schedules-section');
    const schedulesList = document.getElementById('schedules-list');
    const selectedClassName = document.getElementById('selected-class-name');
    const updateMessage = document.getElementById('update-message');

    const addNewScheduleBtn = document.getElementById('add-new-schedule-btn');
    const scheduleFormSection = document.getElementById('schedule-form-section');
    const scheduleForm = document.getElementById('schedule-form');
    const formTitle = document.getElementById('form-title');
    const cancelScheduleBtn = document.getElementById('cancel-schedule-btn');

    const teacherDropdown = document.getElementById('teacher-id');
    const subjectDropdown = document.getElementById('subject-id');
    const semesterDropdown = document.getElementById('semester-id');

    let selectedClassId = null;

    // Fetch All Classes
    const fetchClasses = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/classes');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
            }
            const classes = await response.json();

            if (classes.length === 0) {
                classesList.innerHTML = '<p>No classes found.</p>';
                return;
            }

            classesList.innerHTML = '';
            classes.forEach((cls) => {
                const button = document.createElement('button');
                button.textContent = cls.class_name;
                button.onclick = () => fetchSchedules(cls.class_id, cls.class_name);
                classesList.appendChild(button);
            });
        } catch (error) {
            console.error('Error fetching classes:', error);
            classesList.innerHTML = `<p>Error loading classes: ${error.message}</p>`;
        }
    };

    // Fetch Schedules for a Specific Class
    const fetchSchedules = async (classId, className) => {
        try {
            selectedClassId = classId;
            schedulesSection.style.display = 'block';
            selectedClassName.textContent = className;

            const response = await fetch(`http://localhost:5000/api/admin/schedules/class/${classId}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
            }
            const schedules = await response.json();

            if (schedules.length === 0) {
                schedulesList.innerHTML = '<p>No schedules found for this class.</p>';
                return;
            }

            schedulesList.innerHTML = '';
            schedules.forEach((schedule) => {
                const div = document.createElement('div');
                div.classList.add('schedule-item');
                div.innerHTML = `
                    <p>${schedule.teacher_name} | ${schedule.subject_name} | ${schedule.day_of_week}, Period ${schedule.period_number} (${schedule.start_time} - ${schedule.end_time})</p>
                    <button class="edit-btn" data-id="${schedule.schedule_id}">Edit</button>
                    <button class="delete-btn" data-id="${schedule.schedule_id}">Delete</button>
                `;
                schedulesList.appendChild(div);
            });

            document.querySelectorAll('.edit-btn').forEach((btn) => {
                btn.addEventListener('click', () => openEditScheduleModal(btn.dataset.id));
            });

            document.querySelectorAll('.delete-btn').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const scheduleId = btn.dataset.id;
                    if (confirm('Are you sure you want to delete this schedule?')) {
                        try {
                            const response = await fetch(`http://localhost:5000/api/admin/schedules/${scheduleId}/delete`, { 
                                method: 'DELETE' 
                            });
                            if (!response.ok) {
                                const errorText = await response.text();
                                throw new Error(`Delete failed: ${errorText}`);
                            }
                            fetchSchedules(selectedClassId, className);
                        } catch (error) {
                            alert(`Delete failed: ${error.message}`);
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching schedules:', error);
            schedulesList.innerHTML = `<p>Error loading schedules: ${error.message}</p>`;
        }
    };

    // Populate Dropdowns (Teachers, Subjects, Semesters)
    const populateDropdowns = async () => {
        try {
            console.log('Fetching dropdown data...');
            
            // Fetch Teachers
            const teachersResponse = await fetch('http://localhost:5000/api/admin/dropdown/teachers');
            if (!teachersResponse.ok) {
                const errorText = await teachersResponse.text();
                console.error('Teachers fetch error:', {
                    status: teachersResponse.status,
                    statusText: teachersResponse.statusText,
                    response: errorText
                });
                throw new Error(`Failed to fetch teachers: ${teachersResponse.statusText}`);
            }
            const teachers = await teachersResponse.json();
            console.log('Teachers data:', teachers);

            teacherDropdown.innerHTML = '';
            if (teachers.length === 0) {
                teacherDropdown.innerHTML = '<option value="">No teachers available</option>';
            } else {
                teachers.forEach((teacher) => {
                    const option = document.createElement('option');
                    option.value = teacher.teacher_id;
                    option.textContent = `${teacher.first_name} ${teacher.last_name}`;
                    teacherDropdown.appendChild(option);
                });
            }

            // Fetch Subjects
            const subjectsResponse = await fetch('http://localhost:5000/api/admin/dropdown/subjects');
            if (!subjectsResponse.ok) {
                const errorText = await subjectsResponse.text();
                throw new Error(`Failed to fetch subjects: ${errorText}`);
            }
            const subjects = await subjectsResponse.json();

            subjectDropdown.innerHTML = '';
            subjects.forEach((subject) => {
                const option = document.createElement('option');
                option.value = subject.subject_id;
                option.textContent = subject.subject_name;
                subjectDropdown.appendChild(option);
            });

            // Fetch Semesters
            const semestersResponse = await fetch('http://localhost:5000/api/admin/dropdown/semesters');
            if (!semestersResponse.ok) {
                const errorText = await semestersResponse.text();
                throw new Error(`Failed to fetch semesters: ${errorText}`);
            }
            const semesters = await semestersResponse.json();

            semesterDropdown.innerHTML = '';
            semesters.forEach((semester) => {
                const option = document.createElement('option');
                option.value = semester.semester_id;
                option.textContent = semester.semester_name;
                semesterDropdown.appendChild(option);
            });

        } catch (error) {
            console.error('Error populating dropdowns:', error);
            updateMessage.textContent = `Error loading dropdown options: ${error.message}`;
            updateMessage.className = 'error';
        }
    };

    // Open the form to add/edit a schedule
    const openEditScheduleModal = async (scheduleId) => {
        try {
            if (scheduleId) {
                const response = await fetch(`http://localhost:5000/api/admin/schedules/${scheduleId}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch schedule: ${errorText}`);
                }
                const schedule = await response.json();

                document.getElementById('schedule-id').value = schedule.schedule_id;
                document.getElementById('teacher-id').value = schedule.teacher_id;
                document.getElementById('subject-id').value = schedule.subject_id;
                document.getElementById('semester-id').value = schedule.semester_id;
                document.getElementById('day-of-week').value = schedule.day_of_week;
                document.getElementById('period-number').value = schedule.period_number;
                document.getElementById('start-time').value = schedule.start_time;
                document.getElementById('end-time').value = schedule.end_time;

                formTitle.textContent = 'Edit Schedule';
            } else {
                document.getElementById('schedule-id').value = '';
                document.getElementById('teacher-id').value = '';
                document.getElementById('subject-id').value = '';
                document.getElementById('semester-id').value = '';
                document.getElementById('day-of-week').value = '';
                document.getElementById('period-number').value = '';
                document.getElementById('start-time').value = '';
                document.getElementById('end-time').value = '';

                formTitle.textContent = 'Add New Schedule';
            }

            scheduleFormSection.style.display = 'block';
        } catch (error) {
            console.error('Error opening schedule modal:', error);
            updateMessage.textContent = `Error loading schedule: ${error.message}`;
            updateMessage.className = 'error';
        }
    };

    // Save Updated or New Schedule
    scheduleForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(scheduleForm);
        const scheduleData = Object.fromEntries(formData.entries());
        const isEditMode = !!scheduleData.scheduleId;

        try {
            const url = isEditMode
                ? `http://localhost:5000/api/admin/schedules/${scheduleData.scheduleId}/update`
                : 'http://localhost:5000/api/admin/schedules/add';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...scheduleData,
                    classId: selectedClassId,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(isEditMode 
                    ? `Update failed: ${errorText}`
                    : `Create failed: ${errorText}`);
            }

            updateMessage.textContent = 'Schedule saved successfully!';
            updateMessage.className = 'success';
            scheduleFormSection.style.display = 'none';
            fetchSchedules(selectedClassId, selectedClassName.textContent);
        } catch (error) {
            console.error('Error saving schedule:', error);
            updateMessage.textContent = `Error saving schedule: ${error.message}`;
            updateMessage.className = 'error';
        }
    });

    // Cancel Button
    cancelScheduleBtn.addEventListener('click', () => {
        scheduleFormSection.style.display = 'none';
    });

    // Add New Schedule Button
    addNewScheduleBtn.addEventListener('click', () => {
        openEditScheduleModal(null);
    });

    // Initialize the Page
    fetchClasses();
    populateDropdowns();
});