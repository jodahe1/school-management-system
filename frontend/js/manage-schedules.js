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
                const classCard = document.createElement('div');
                classCard.className = 'class-card';
                classCard.tabIndex = 0;
                classCard.innerHTML = `<span class="class-name">${cls.class_name}</span>`;
                classCard.addEventListener('click', () => handleClassClick(cls.class_id, cls.class_name, classCard));
                classCard.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClassClick(cls.class_id, cls.class_name, classCard);
                    }
                });
                classesList.appendChild(classCard);
            });
        } catch (error) {
            console.error('Error fetching classes:', error);
            classesList.innerHTML = `<p>Error loading classes: ${error.message}</p>`;
        }
    };

    // Handle Class Click: Show schedules below the clicked class
    const handleClassClick = async (classId, className, classCard) => {
        // Remove any existing schedules list and add button
        document.querySelectorAll('.schedules-list-inline').forEach(el => el.remove());
        document.querySelectorAll('.add-new-schedule-btn').forEach(el => el.remove());
        selectedClassId = classId;
        selectedClassName.textContent = className;

        // Create a container for the schedules
        const schedulesContainer = document.createElement('div');
        schedulesContainer.className = 'schedules-list-inline';
        schedulesContainer.style.marginTop = '1rem';
        schedulesContainer.innerHTML = '<p>Loading schedules...</p>';

        // Insert schedulesContainer right after the classCard
        classCard.insertAdjacentElement('afterend', schedulesContainer);

        try {
            const response = await fetch(`http://localhost:5000/api/admin/schedules/class/${classId}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
            }
            const schedules = await response.json();

            if (schedules.length === 0) {
                schedulesContainer.innerHTML = '<p>No schedules found for this class.</p>';
            } else {
                schedulesContainer.innerHTML = '';
                schedules.forEach((schedule) => {
                    const teacherDisplay = (schedule.teacher_first_name && schedule.teacher_last_name)
                        ? `${schedule.teacher_first_name} ${schedule.teacher_last_name}`
                        : (schedule.teacher_name || '');
                    const div = document.createElement('div');
                    div.classList.add('schedule-card');
                    div.innerHTML = `
                        <div class="schedule-info">
                            <div class="schedule-title">${schedule.subject_name}</div>
                            <div class="schedule-details">${teacherDisplay} | ${schedule.day_of_week}, Period ${schedule.period_number}</div>
                            <div class="schedule-time">${schedule.start_time} - ${schedule.end_time}</div>
                        </div>
                        <div class="schedule-actions">
                            <button class="edit-btn" data-id="${schedule.schedule_id}">Edit</button>
                            <button class="delete-btn" data-id="${schedule.schedule_id}">Delete</button>
                        </div>
                    `;
                    schedulesContainer.appendChild(div);
                });
            }

            // Always add the Add New Schedule Button (inline) after the schedulesContainer
            const addBtn = document.createElement('button');
            addBtn.className = 'add-new-schedule-btn';
            addBtn.id = 'add-new-schedule-btn';
            addBtn.innerHTML = 'Add New Schedule';
            addBtn.addEventListener('click', () => {
                // Remove any existing inline add/edit forms
                document.querySelectorAll('.inline-edit-schedule-form').forEach(f => f.remove());
                // Prevent multiple add buttons
                document.querySelectorAll('.add-new-schedule-btn').forEach((btn, idx) => {
                    if (btn !== addBtn) btn.remove();
                });
                const blankSchedule = {
                    schedule_id: '',
                    teacher_id: '',
                    subject_id: '',
                    semester_id: '',
                    day_of_week: 'Monday',
                    period_number: '',
                    start_time: '',
                    end_time: ''
                };
                let addForm;
                addForm = createInlineAddForm(blankSchedule, () => {
                    // On save, remove the form and refresh the list (which will re-add the button)
                    if (addForm) addForm.remove();
                    handleClassClick(classId, className, classCard);
                }, () => {
                    if (addForm) addForm.remove();
                });
                addBtn.insertAdjacentElement('afterend', addForm);
            });
            schedulesContainer.insertAdjacentElement('afterend', addBtn);

            schedulesContainer.querySelectorAll('.edit-btn').forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.inline-edit-schedule-form').forEach(f => f.remove());
                    try {
                        const response = await fetch(`http://localhost:5000/api/admin/schedules/${btn.dataset.id}`);
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`Failed to fetch schedule: ${errorText}`);
                        }
                        const schedule = await response.json();
                        const scheduleCard = btn.closest('.schedule-card');
                        const form = createInlineEditForm(schedule, () => {
                            handleClassClick(classId, className, classCard);
                        }, () => {
                            form.remove();
                        });
                        scheduleCard.insertAdjacentElement('afterend', form);
                    } catch (error) {
                        showToast('Error loading schedule: ' + error.message, 'error');
                    }
                });
            });

            schedulesContainer.querySelectorAll('.delete-btn').forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
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
                            handleClassClick(classId, className, classCard);
                        } catch (error) {
                            showToast('Delete failed: ' + error.message, 'error');
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching schedules:', error);
            schedulesContainer.innerHTML = `<p>Error loading schedules: ${error.message}</p>`;
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

    // Toast Notification System
    function showToast(message, type = 'success') {
        let toast = document.createElement('div');
        toast.className = `custom-toast custom-toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

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

            showToast('Schedule saved successfully!', 'success');
            updateMessage.textContent = 'Schedule saved successfully!';
            updateMessage.className = 'success';
            scheduleFormSection.style.display = 'none';
            fetchClasses();
        } catch (error) {
            showToast('Error saving schedule: ' + error.message, 'error');
            console.error('Error saving schedule:', error);
            updateMessage.textContent = `Error saving schedule: ${error.message}`;
            updateMessage.className = 'error';
        }
    });

    // Cancel Button
    cancelScheduleBtn.addEventListener('click', () => {
        scheduleFormSection.style.display = 'none';
    });

    // Initialize the Page
    fetchClasses();
    populateDropdowns();

    // Helper: Populate teachers for a class
    async function populateTeachersDropdown(dropdown, classId, selectedTeacherId = '') {
        dropdown.innerHTML = '';
        if (!classId) return;
        const res = await fetch(`http://localhost:5000/api/admin/class/${classId}/teachers`);
        const teachers = await res.json();
        teachers.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.teacher_id;
            opt.textContent = `${t.first_name} ${t.last_name}`;
            if (t.teacher_id == selectedTeacherId) opt.selected = true;
            dropdown.appendChild(opt);
        });
    }
    // Helper: Populate subjects for a class+teacher
    async function populateSubjectsDropdown(dropdown, classId, teacherId, selectedSubjectId = '') {
        dropdown.innerHTML = '';
        if (!classId || !teacherId) return;
        const res = await fetch(`http://localhost:5000/api/admin/class/${classId}/teacher/${teacherId}/subjects`);
        const subjects = await res.json();
        subjects.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.subject_id;
            opt.textContent = s.subject_name;
            if (s.subject_id == selectedSubjectId) opt.selected = true;
            dropdown.appendChild(opt);
        });
    }

    // Update createInlineEditForm to use new dropdown logic
    function createInlineEditForm(schedule, onSave, onCancel) {
        const form = document.createElement('form');
        form.className = 'inline-edit-schedule-form';
        form.style.margin = '1.5rem 0';
        form.style.background = '#fff';
        form.style.borderRadius = '16px';
        form.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
        form.style.padding = '2rem';
        form.style.border = '1px solid #e5e7eb';
        form.innerHTML = `
            <input type="hidden" name="scheduleId" value="${schedule.schedule_id}">
            <div style="display: grid; gap: 1.2rem; grid-template-columns: 1fr 1fr;">
                <div>
                    <label>Teacher:</label>
                    <select name="teacherId" required></select>
                </div>
                <div>
                    <label>Subject:</label>
                    <select name="subjectId" required></select>
                </div>
                <div>
                    <label>Semester:</label>
                    <select name="semesterId" required></select>
                </div>
                <div>
                    <label>Day of Week:</label>
                    <select name="dayOfWeek" required>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                    </select>
                </div>
                <div>
                    <label>Period Number:</label>
                    <input type="number" name="periodNumber" min="1" max="8" required value="${schedule.period_number}">
                </div>
                <div>
                    <label>Start Time:</label>
                    <input type="time" name="startTime" required value="${schedule.start_time}">
                </div>
                <div>
                    <label>End Time:</label>
                    <input type="time" name="endTime" required value="${schedule.end_time}">
                </div>
            </div>
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                <button type="submit" style="background: var(--primary); color: #fff; border-radius: 8px; padding: 0.7rem 1.5rem; border: none; font-weight: 700;">Save</button>
                <button type="button" class="cancel-inline-edit-btn" style="background: #f3f4f6; color: #374151; border-radius: 8px; padding: 0.7rem 1.5rem; border: none; font-weight: 700;">Cancel</button>
            </div>
        `;
        // Populate dropdowns
        const teacherSelect = form.querySelector('select[name="teacherId"]');
        const subjectSelect = form.querySelector('select[name="subjectId"]');
        const semesterSelect = form.querySelector('select[name="semesterId"]');
        // Teachers for this class
        populateTeachersDropdown(teacherSelect, selectedClassId, schedule.teacher_id).then(() => {
            // Subjects for this class+teacher
            populateSubjectsDropdown(subjectSelect, selectedClassId, teacherSelect.value, schedule.subject_id);
        });
        // When teacher changes, update subjects
        teacherSelect.addEventListener('change', () => {
            populateSubjectsDropdown(subjectSelect, selectedClassId, teacherSelect.value);
        });
        // Semesters (all)
        fetch('http://localhost:5000/api/admin/dropdown/semesters').then(r => r.json()).then(semesters => {
            semesterSelect.innerHTML = '';
            semesters.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.semester_id;
                opt.textContent = s.semester_name;
                if (s.semester_id == schedule.semester_id) opt.selected = true;
                semesterSelect.appendChild(opt);
            });
        });
        // Set day of week
        form.querySelector('select[name="dayOfWeek"]').value = schedule.day_of_week;
        // ... existing submit/cancel logic ...
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            try {
                const response = await fetch(`http://localhost:5000/api/admin/schedules/${schedule.schedule_id}/update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, classId: selectedClassId })
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Update failed: ${errorText}`);
                }
                showToast('Schedule updated successfully!', 'success');
                if (onSave) onSave();
            } catch (error) {
                showToast('Error saving schedule: ' + error.message, 'error');
            }
        });
        form.querySelector('.cancel-inline-edit-btn').addEventListener('click', () => {
            if (onCancel) onCancel();
        });
        return form;
    }

    // Update createInlineAddForm to use new dropdown logic
    function createInlineAddForm(schedule, onSave, onCancel) {
        const form = document.createElement('form');
        form.className = 'inline-edit-schedule-form';
        form.style.margin = '1.5rem 0';
        form.style.background = '#fff';
        form.style.borderRadius = '16px';
        form.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
        form.style.padding = '2rem';
        form.style.border = '1px solid #e5e7eb';
        form.innerHTML = `
            <div style="display: grid; gap: 1.2rem; grid-template-columns: 1fr 1fr;">
                <div>
                    <label>Teacher:</label>
                    <select name="teacherId" required></select>
                </div>
                <div>
                    <label>Subject:</label>
                    <select name="subjectId" required></select>
                </div>
                <div>
                    <label>Semester:</label>
                    <select name="semesterId" required></select>
                </div>
                <div>
                    <label>Day of Week:</label>
                    <select name="dayOfWeek" required>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                    </select>
                </div>
                <div>
                    <label>Period Number:</label>
                    <input type="number" name="periodNumber" min="1" max="8" required value="">
                </div>
                <div>
                    <label>Start Time:</label>
                    <input type="time" name="startTime" required value="">
                </div>
                <div>
                    <label>End Time:</label>
                    <input type="time" name="endTime" required value="">
                </div>
            </div>
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                <button type="submit" style="background: var(--primary); color: #fff; border-radius: 8px; padding: 0.7rem 1.5rem; border: none; font-weight: 700;">Save</button>
                <button type="button" class="cancel-inline-edit-btn" style="background: #f3f4f6; color: #374151; border-radius: 8px; padding: 0.7rem 1.5rem; border: none; font-weight: 700;">Cancel</button>
            </div>
        `;
        // Populate dropdowns
        const teacherSelect = form.querySelector('select[name="teacherId"]');
        const subjectSelect = form.querySelector('select[name="subjectId"]');
        const semesterSelect = form.querySelector('select[name="semesterId"]');
        // Teachers for this class
        populateTeachersDropdown(teacherSelect, selectedClassId).then(() => {
            // Subjects for this class+teacher
            populateSubjectsDropdown(subjectSelect, selectedClassId, teacherSelect.value);
        });
        // When teacher changes, update subjects
        teacherSelect.addEventListener('change', () => {
            populateSubjectsDropdown(subjectSelect, selectedClassId, teacherSelect.value);
        });
        // Semesters (all)
        fetch('http://localhost:5000/api/admin/dropdown/semesters').then(r => r.json()).then(semesters => {
            semesterSelect.innerHTML = '';
            semesters.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.semester_id;
                opt.textContent = s.semester_name;
                semesterSelect.appendChild(opt);
            });
        });
        // Set day of week
        form.querySelector('select[name="dayOfWeek"]').value = 'Monday';
        // ... existing submit/cancel logic ...
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            try {
                const response = await fetch('http://localhost:5000/api/admin/schedules/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, classId: selectedClassId })
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Create failed: ${errorText}`);
                }
                showToast('Schedule added successfully!', 'success');
                if (onSave) onSave();
            } catch (error) {
                showToast('Error adding schedule: ' + error.message, 'error');
            }
        });
        form.querySelector('.cancel-inline-edit-btn').addEventListener('click', () => {
            if (onCancel) onCancel();
        });
        return form;
    }
});

// js/delete-students.js

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

    // Add your existing logic for loading classes, students, deletion, etc.
    // Example:
    const classesList = document.getElementById('classes-list');
    if (classesList) {
        classesList.innerHTML = '<p>Classes loaded (placeholder).</p>';
    }
});