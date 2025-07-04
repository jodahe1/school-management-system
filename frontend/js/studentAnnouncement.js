document.addEventListener('DOMContentLoaded', () => {
    // Load student from localStorage
    const studentRaw = localStorage.getItem('student');
    let student;

    if (!studentRaw) {
        console.error("No student found in localStorage");
        alert("Session expired. Please log in again.");
        window.location.href = '../studentLogin.html';
        return;
    }

    try {
        student = JSON.parse(studentRaw);

        // Ensure student has student_id; fallback to user_id if available
        if (!student.student_id && student.user_id) {
            console.warn("student_id not found, using user_id as fallback");
            student.student_id = student.user_id;

            // Save updated student back to localStorage
            localStorage.setItem('student', JSON.stringify(student));
        }
    } catch (e) {
        console.error("Failed to parse student from localStorage", e);
        alert("Invalid session data. Please log in again.");
        window.location.href = '../studentLogin.html';
        return;
    }

    // Set welcome message next to Student Announcements
    const welcomeStudentEl = document.getElementById('welcomeStudent');
    if (welcomeStudentEl && student.student_id) {
        welcomeStudentEl.textContent = `Welcome Student ${student.student_id}`;
    }

    // DOM Elements
    const announcementList = document.getElementById('announcementList');
    const filterSubject = document.getElementById('filterSubject');
    const filterDate = document.getElementById('filterDate');
    const unreadCountEl = document.getElementById('unreadCount');
    const logoutBtn = document.getElementById('logoutBtn');
    const modal = document.getElementById('announcementModal');
    const closeModal = modal.querySelector('.close-modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalTeacher = document.getElementById('modalTeacher');
    const modalDate = document.getElementById('modalDate');
    const modalSubject = document.getElementById('modalSubject');
    const modalContent = document.getElementById('modalContent');
    const modalAttachment = document.getElementById('modalAttachment');

    // Display student name and class
    if (student.first_name || student.last_name) {
        document.getElementById('studentName').textContent = `${student.first_name || ''} ${student.last_name || ''}`;
    } else {
        document.getElementById('studentName').textContent = 'Student';
    }

    if (student.class_name) {
        document.getElementById('studentClass').textContent = `Class: ${student.class_name}`;
    }

    let announcements = [];

    async function fetchAnnouncements() {
        try {
            const res = await fetch(`http://localhost:5000/api/student/${student.student_id}/announcements`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            announcements = await res.json();
            renderFilterOptions(announcements);
            renderAnnouncements(applyFiltersAndSort());
            updateUnreadCount(announcements);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            announcementList.innerHTML = `<p class="error-message">Error loading announcements: ${error.message}</p>`;
        }
    }

    function renderFilterOptions(data) {
        const subjects = [...new Set(data.map(a => a.subject_name))];
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            filterSubject.appendChild(option);
        });
    }

    function applyFiltersAndSort(data = announcements) {
        let filtered = [...data];

        // Filter by subject
        const selectedSubject = filterSubject.value;
        if (selectedSubject !== "all") {
            filtered = filtered.filter(a => a.subject_name === selectedSubject);
        }

        // Sort by date
        if (filterDate.value === "newest") {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
            filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        return filtered;
    }

    function renderAnnouncements(data) {
        announcementList.innerHTML = "";
        if (data.length === 0) {
            announcementList.innerHTML = "<p>No announcements found.</p>";
            return;
        }

        data.forEach(announcement => {
            const card = document.createElement("div");
            card.className = `announcement-card ${!announcement.is_read ? 'unread' : ''} ${announcement.is_important ? 'important' : ''}`;
            card.innerHTML = `
                <h3>${announcement.title}</h3>
                <p class="meta">
                    <span>${announcement.teacher_name}</span> |
                    <span>${announcement.subject_name}</span> |
                    <span>${new Date(announcement.created_at).toLocaleString()}</span>
                </p>
                <p>${announcement.content.slice(0, 100)}${announcement.content.length > 100 ? "..." : ""}</p>
            `;
            card.addEventListener("click", () => showModal(announcement));
            announcementList.appendChild(card);
        });
    }

    function showModal(announcement) {
        modalTitle.textContent = announcement.title;
        modalTeacher.textContent = `Teacher: ${announcement.teacher_name}`;
        modalDate.textContent = `Date: ${new Date(announcement.created_at).toLocaleString()}`;
        modalSubject.textContent = `Subject: ${announcement.subject_name}`;
        modalContent.textContent = announcement.content;

        if (announcement.file_path) {
            modalAttachment.innerHTML = `<a href="${announcement.file_path}" target="_blank">Download Attachment</a>`;
        } else {
            modalAttachment.innerHTML = '';
        }

        modal.style.display = "block";

        // Mark as read if not already
        if (!announcement.is_read) {
            markAsRead(announcement.announcement_id);
            announcement.is_read = true;
            updateUnreadCount(announcements);
            renderAnnouncements(applyFiltersAndSort(announcements));
        }
    }

    async function markAsRead(id) {
        try {
            const res = await fetch(`http://localhost:5000/api/student/${student.student_id}/announcements/${id}/mark-read`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            });

            if (!res.ok) {
                console.error("Failed to mark as read", res.statusText);
            }
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    }

    function updateUnreadCount(data) {
        const unread = data.filter(a => !a.is_read).length;
        unreadCountEl.textContent = unread;
        unreadCountEl.style.display = unread > 0 ? "inline-block" : "none";
    }

    // Event Listeners
    [filterSubject, filterDate].forEach(el => {
        el.addEventListener("change", () => {
            const result = applyFiltersAndSort(announcements);
            renderAnnouncements(result);
        });
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("student");
        window.location.href = "../studentLogin.html";
    });

    // Initial Load
    fetchAnnouncements();
});