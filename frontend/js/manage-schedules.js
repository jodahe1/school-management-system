// frontend/js/manage-schedules.js

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

    let selectedClassId = null;

    // Fetch All Classes
    const fetchClasses = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/classes');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
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
            console.error('Error fetching classes:', error.message);
            classesList.innerHTML = '<p>Error loading classes. Please try again.</p>';
        }
    };

    // Fetch Schedules for a Specific Class
    const fetchSchedules = async (classId, className) => {
        try {
            selectedClassId = classId;
            schedulesSection.style.display = 'block';
            selectedClassName.textContent = className;

            const response = await fetch(`http://localhost:5000/api/admin/schedules/class/${classId}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
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

            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-btn').forEach((btn) => {
                btn.addEventListener('click', () => openEditScheduleModal(btn.dataset.id));
            });

            document.querySelectorAll('.delete-btn').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const scheduleId = btn.dataset.id;
                    if (confirm('Are you sure you want to delete this schedule?')) {
                        try {
                            await fetch(`http://localhost:5000/api/admin/schedules/${scheduleId}/delete`, { method: 'DELETE' });
                            fetchSchedules(selectedClassId, className); // Refresh the list after deletion
                        } catch (error) {
                            alert('An error occurred while deleting the schedule.');
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching schedules:', error.message);
            schedulesList.innerHTML = '<p>Error loading schedules. Please try again.</p>';
        }
    };

    // Open the form to add/edit a schedule
    const openEditScheduleModal = async (scheduleId) => {
        try {
            if (scheduleId) {
                // Fetch existing schedule details for editing
                const response = await fetch(`http://localhost:5000/api/admin/schedules/${scheduleId}`);
                const schedule = await response.json();

                // Populate the form with existing data
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
                // Clear the form for adding a new schedule
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

            // Show the form
            scheduleFormSection.style.display = 'block';
        } catch (error) {
            console.error('Error fetching schedule details:', error.message);
            alert('An error occurred while loading the schedule details.');
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

            if (!response.ok) throw new Error(isEditMode ? 'Failed to update schedule' : 'Failed to add schedule');

            updateMessage.textContent = 'Changes saved successfully!';
            updateMessage.className = 'success';
            scheduleFormSection.style.display = 'none'; // Hide the form after saving
            fetchSchedules(selectedClassId); // Refresh the list after adding/updating
        } catch (error) {
            console.error('Error saving schedule:', error.message);
            updateMessage.textContent = 'Error saving changes. Please try again.';
            updateMessage.className = 'error';
        }
    });

    // Cancel Button
    cancelScheduleBtn.addEventListener('click', () => {
        scheduleFormSection.style.display = 'none';
    });

    // Add New Schedule Button
    addNewScheduleBtn.addEventListener('click', () => {
        openEditScheduleModal(null); // Pass `null` for adding a new schedule
    });

    // Initialize the Page
    fetchClasses();
});