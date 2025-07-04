document.addEventListener('DOMContentLoaded', () => {
    // Sidebar student info (optional, can be improved)
    const student = JSON.parse(localStorage.getItem('student'));
    if (student) {
        document.getElementById('sidebarStudentName').textContent = `${student.first_name || ''} ${student.last_name || ''}`;
        document.getElementById('sidebarStudentId').textContent = `ID: ${student.username || student.student_id}`;
        document.getElementById('sidebarStudentClass').textContent = `Class: ${student.class_name || ''}`;
    }

    const tableContainer = document.getElementById('announcementsTableContainer');
    const sortSelect = document.getElementById('sortDate');
    let announcements = [];

    async function fetchAnnouncements() {
        if (!student || !student.student_id) {
            tableContainer.innerHTML = '<p>Student not found in localStorage.</p>';
            return;
        }
        tableContainer.innerHTML = '<p>Loading...</p>';
        try {
            const res = await fetch(`http://localhost:5000/api/student/${student.student_id}/announcements`);
            if (!res.ok) throw new Error('Failed to fetch announcements');
            announcements = await res.json();
            if (!Array.isArray(announcements) || announcements.length === 0) {
                tableContainer.innerHTML = '<p>No announcements found.</p>';
                return;
            }
            renderTable();
        } catch (err) {
            tableContainer.innerHTML = `<p>Error: ${err.message}</p>`;
        }
    }

    function renderTable() {
        // Sort announcements
        const sortOrder = sortSelect.value;
        const sorted = [...announcements].sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        let table = `<table class="announcements-table"><thead><tr>
            <th>ID</th><th>Title</th><th>Content</th><th>File</th><th>Date</th><th>Important</th><th>Teacher</th><th>Subject</th><th>Class</th><th>Read</th>
        </tr></thead><tbody>`;
        for (const a of sorted) {
            const importantClass = a.is_important ? 'important-yes' : 'important-no';
            table += `<tr class="${importantClass}">
                <td>${a.announcement_id}</td>
                <td>${a.title}</td>
                <td>${a.content}</td>
                <td>${a.file_path ? `<a href="${a.file_path}" target="_blank">Download</a>` : ''}</td>
                <td>${new Date(a.created_at).toLocaleString()}</td>
                <td>${a.is_important ? 'Yes' : 'No'}</td>
                <td>${a.teacher_name}</td>
                <td>${a.subject_name}</td>
                <td>${a.class_name}</td>
                <td>${a.is_read ? 'Yes' : 'No'}</td>
            </tr>`;
        }
        table += '</tbody></table>';
        tableContainer.innerHTML = table;
    }

    sortSelect.addEventListener('change', renderTable);
    fetchAnnouncements();
}); 