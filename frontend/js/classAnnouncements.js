document.addEventListener('DOMContentLoaded', async () => {
    const teacher = JSON.parse(localStorage.getItem('teacher'));
    if (!teacher) {
        window.location.href = 'teacherLogin.html';
        return;
    }

    // Back button functionality
    document.getElementById('backToClass').addEventListener('click', () => {
        window.location.href = 'teacherDashboard.html';
    });

    // Initialize form elements
    const classSelect = document.getElementById('announcement-class');
    const subjectSelect = document.getElementById('announcement-subject');

    // Load initial data
    await loadClasses(teacher.user_id);

    // Event listeners
    classSelect.addEventListener('change', async () => {
        const classId = classSelect.value;
        if (classId) {
            await loadSubjects(teacher.user_id, classId);
            await loadRecentAnnouncements(classId, 6); // Using 6 as default semester
        } else {
            subjectSelect.innerHTML = '<option value="">Select Subject</option>';
        }
    });

    // Setup form handler
    setupAnnouncementForm(teacher.user_id);
});

// Load teacher's classes
async function loadClasses(teacherId) {
    try {
        const response = await fetch(`http://localhost:5000/api/teacher/classes?teacher_id=${teacherId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const classes = await response.json();
        const select = document.getElementById('announcement-class');
        select.innerHTML = '<option value="">Select Class</option>';
        
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.class_id;
            option.textContent = cls.class_name;
            select.appendChild(option);
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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const schedule = await response.json();
        const select = document.getElementById('announcement-subject');
        select.innerHTML = '<option value="">All Subjects</option>';
        
        const uniqueSubjects = new Set();
        schedule
            .filter(item => item.class_id === parseInt(classId))
            .forEach(item => {
                if (!uniqueSubjects.has(item.subject_id)) {
                    const option = document.createElement('option');
                    option.value = item.subject_id;
                    option.textContent = item.subject_name;
                    select.appendChild(option);
                    uniqueSubjects.add(item.subject_id);
                }
            });
    } catch (error) {
        console.error('Error loading subjects:', error);
        alert('Failed to load subjects');
    }
}

// Setup announcement form submission
// Updated setupAnnouncementForm function
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
                await loadRecentAnnouncements(classId, semesterId);
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
// Load recent announcements for selected class and semester
async function loadRecentAnnouncements(classId, semesterId) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/teacher/announcements?class_id=${classId}&semester_id=${semesterId}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const announcements = await response.json();
        const tbody = document.getElementById('announcements-table');
        tbody.innerHTML = '';
        
        if (announcements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No announcements found</td></tr>';
            return;
        }
        
        announcements.forEach(ann => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ann.title}</td>
                <td>${ann.class_name || 'All Classes'}</td>
                <td>${ann.subject_name || 'All Subjects'}</td>
                <td>${new Date(ann.created_at).toLocaleDateString()}</td>
                <td>${ann.teacher_name}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading announcements:', error);
        document.getElementById('announcements-table').innerHTML = 
            '<tr><td colspan="5">Failed to load announcements</td></tr>';
    }
}