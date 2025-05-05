document.addEventListener('DOMContentLoaded', () => {
    const student = JSON.parse(localStorage.getItem('student'));

    if (!student) {
        window.location.href = '../studentLogin.html';
        return;
    }

    document.getElementById('studentName').textContent = `${student.first_name} ${student.last_name}`;
    document.getElementById('studentClass').textContent = `Class: ${student.class_name}`;

    const announcementList = document.getElementById('announcementList');
    const filterSubject = document.getElementById('filterSubject');
    const filterDate = document.getElementById('filterDate');
    const unreadCount = document.getElementById('unreadCount');
    const logoutBtn = document.getElementById('logoutBtn');

    const modal = document.getElementById('announcementModal');
    const closeModal = modal.querySelector('.close-modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalTeacher = document.getElementById('modalTeacher');
    const modalDate = document.getElementById('modalDate');
    const modalSubject = document.getElementById('modalSubject');
    const modalContent = document.getElementById('modalContent');
    const modalAttachment = document.getElementById('modalAttachment');

    let announcements = [];

    async function fetchAnnouncements() {
        try {
            const res = await fetch(`http://localhost:5000/api/student/${student.student_id}/announcements`);
            if (!res.ok) throw new Error('Failed to fetch announcements');

            announcements = await res.json();
            renderFilterOptions(announcements);
            renderAnnouncements(announcements);
            updateUnreadCount(announcements);
        } catch (error) {
            console.error('Error:', error);
            announcementList.innerHTML = `<p class="error-message">Error loading announcements.</p>`;
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

    function renderAnnouncements(data) {
        announcementList.innerHTML = '';

        if (!data.length) {
            announcementList.innerHTML = '<p>No announcements found.</p>';
            return;
        }

        data.forEach(announcement => {
            const card = document.createElement('div');
            card.className = `announcement-card ${announcement.is_important ? 'important' : ''} ${announcement.is_read ? 'read' : 'unread'}`;
            card.innerHTML = `
                <h3>${announcement.title}</h3>
                <p class="meta">
                    <span>${announcement.teacher_name}</span> |
                    <span>${announcement.subject_name}</span> |
                    <span>${new Date(announcement.created_at).toLocaleString()}</span>
                </p>
                <p>${announcement.content.slice(0, 100)}...</p>
            `;
            card.addEventListener('click', () => openModal(announcement));
            announcementList.appendChild(card);
        });
    }

    function openModal(announcement) {
        modalTitle.textContent = announcement.title;
        modalTeacher.textContent = `Teacher: ${announcement.teacher_name}`;
        modalDate.textContent = `Date: ${new Date(announcement.created_at).toLocaleString()}`;
        modalSubject.textContent = `Subject: ${announcement.subject_name}`;
        modalContent.textContent = announcement.content;

        if (announcement.file_path) {
            modalAttachment.innerHTML = `
                <a href="http://localhost:5000${announcement.file_path}" target="_blank">View Attachment</a>
            `;
        } else {
            modalAttachment.innerHTML = '';
        }

        modal.style.display = 'block';
        announcement.is_read = true;
        updateUnreadCount(announcements);
        renderAnnouncements(applyFiltersAndSort());
    }

    function updateUnreadCount(data) {
        const unread = data.filter(a => !a.is_read).length;
        unreadCount.textContent = unread;
        unreadCount.style.display = unread > 0 ? 'inline-block' : 'none';
    }

    function applyFiltersAndSort() {
        let filtered = [...announcements];

        const subject = filterSubject.value;
        if (subject !== 'all') {
            filtered = filtered.filter(a => a.subject_name === subject);
        }

        if (filterDate.value === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
            filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        return filtered;
    }

    filterSubject.addEventListener('change', () => {
        const result = applyFiltersAndSort();
        renderAnnouncements(result);
    });

    filterDate.addEventListener('change', () => {
        const result = applyFiltersAndSort();
        renderAnnouncements(result);
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('student');
        window.location.href = '../studentLogin.html';
    });

    // Initial load
    fetchAnnouncements();
});
