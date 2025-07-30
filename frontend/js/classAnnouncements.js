document.addEventListener('DOMContentLoaded', async () => {
    const teacher = JSON.parse(localStorage.getItem('teacher'));
    if (!teacher) {
        window.location.href = 'teacherLogin.html';
        return;
    }

    // Get class_id from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedClassId = urlParams.get('class_id');

    // Set greeting message below the announcement title
    const greetingDiv = document.getElementById('greeting-message');
    if (greetingDiv) {
        greetingDiv.textContent = `Wellcome to announcment page selcet class and subject to announce `;
    }

    // Back button functionality
    document.getElementById('backToClass').addEventListener('click', () => {
        window.location.href = 'teacherDashboard.html';
    });

    // Initialize form elements
    const classSelect = document.getElementById('announcement-class');
    const subjectSelect = document.getElementById('announcement-subject');

    // Load initial data using the new utility
    await loadClassesForSelect('announcement-class', teacher.user_id, preselectedClassId);

    // If preselected class, load subjects
    if (preselectedClassId) {
        await loadSubjectsForClass(teacher.user_id, preselectedClassId, 'announcement-subject');
        classSelect.value = preselectedClassId;
    }

    // Event listeners
    classSelect.addEventListener('change', async () => {
        const classId = classSelect.value;
        if (classId) {
            await loadSubjectsForClass(teacher.user_id, classId, 'announcement-subject');
            await loadRecentAnnouncements(teacher.user_id, classId);
        } else {
            subjectSelect.innerHTML = '<option value="">Select Subject</option>';
        }
    });

    // Setup form handler
    setupAnnouncementForm(teacher.user_id);
});

// Utility: Load classes for select dropdown (copied from teacherDashboard.js)
async function loadClassesForSelect(selectId, teacherId, preselectedClassId) {
    try {
        const response = await fetch(`http://localhost:5000/api/teacher/classes?teacher_id=${teacherId}`);
        if (response.ok) {
            const classes = await response.json();
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Class</option>' +
                classes.map(cls => `<option value="${cls.class_id}" ${preselectedClassId && cls.class_id == preselectedClassId ? 'selected' : ''}>${cls.class_name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

// Load subjects for selected class (filtered by teacher and class)
async function loadSubjectsForClass(teacherId, classId, selectId) {
    try {
        const response = await fetch(`http://localhost:5000/api/teacher/schedule?teacher_id=${teacherId}`);
        if (!response.ok) return;
        const schedule = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Subject</option>';
        const uniqueSubjects = new Set();
        schedule
            .filter(item => item.class_id == classId)
            .forEach(item => {
                if (!uniqueSubjects.has(item.subject_id)) {
                    select.innerHTML += `<option value="${item.subject_id}">${item.subject_name}</option>`;
                    uniqueSubjects.add(item.subject_id);
                }
            });
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

// Setup announcement form submission
function setupAnnouncementForm(teacherId) {
    document.getElementById('announcementForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const classId = document.getElementById('announcement-class').value;
        const subjectId = document.getElementById('announcement-subject').value || null;
        const semesterId = 6; // Hardcoded as requested
        const title = document.getElementById('announcement-title').value;
        const content = document.getElementById('announcement-content').value;
        
        if (!classId) {
            alert('Please select a class');
            return;
        }
        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }

        try {
            // Create the exact same structure that works in Postman
            const payload = {
                teacher_id: teacherId,
                class_id: classId,
                subject_id: subjectId,
                semester_id: semesterId,
                title: title,
                content: content,
                file: "http://localhost:5000/api/teacher/announcements" // Matching Postman
            };

            console.log("Submitting:", payload); // Debug log

            const response = await fetch('http://localhost:5000/api/teacher/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Crucial header
                },
                body: JSON.stringify(payload) // Stringify the object
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error("Backend error:", error);
                throw new Error(error.message || 'Failed to post announcement');
            }

            const result = await response.json();
            console.log("Success:", result); // Debug log
            alert('Announcement posted successfully!');
            document.getElementById('announcementForm').reset();
            
            // Refresh announcements list
            if (classId) {
                await loadRecentAnnouncements(teacherId, classId);
            }
        } catch (error) {
            console.error('Full error:', {
                message: error.message,
                stack: error.stack,
                time: new Date().toISOString()
            });
            alert(`Error: ${error.message}`);
        }
    });
}

// Load recent announcements for selected class and teacher
async function loadRecentAnnouncements(teacherId, classId) {
    try {
        // Print IDs to backend terminal for debugging
        fetch('http://localhost:5000/api/debug/print-ids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId, classId })
        });
        const url = `http://localhost:5000/api/teacher/announcements?teacher_id=${teacherId}&class_id=${classId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const announcements = await response.json();
        const tbody = document.getElementById('announcements-table');
        tbody.innerHTML = '';
        
        if (announcements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Sorry, you don\'t have any.</td></tr>';
            return;
        }
        
        announcements.forEach(ann => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ann.title}</td>
                <td>${ann.class_name || ''}</td>
                <td>${ann.subject_name || ''}</td>
                <td>${ann.file_path ? `<a href="${ann.file_path}" target="_blank">View</a>` : '-'}</td>
                <td>${new Date(ann.created_at).toLocaleDateString()}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading announcements:', error);
        document.getElementById('announcements-table').innerHTML = 
            '<tr><td colspan="5">Failed to load announcements</td></tr>';
    }
}