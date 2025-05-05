document.addEventListener('DOMContentLoaded', async () => {
    // Check if student is logged in
    const student = JSON.parse(localStorage.getItem('student'));
    if (!student) {
        window.location.href = 'studentLogin.html';
        return;
    }

    // Set student info in sidebar
    document.getElementById('studentName').textContent = `${student.first_name} ${student.last_name}`;
    document.getElementById('studentClass').textContent = `Class: ${student.class_name}`; // Remove fallback

    // DOM Elements
    const announcementList = document.getElementById('announcementList');
    const filterSubject = document.getElementById('filterSubject');
    const filterDate = document.getElementById('filterDate');
    const logoutBtn = document.getElementById('logoutBtn');
    const unreadCount = document.getElementById('unreadCount');
    const modal = document.getElementById('announcementModal');
    const closeModal = document.querySelector('.close-modal');

    // Load announcements
    let announcements = [];
    let subjects = new Set();
    
    // Fetch announcements from API
    async function fetchAnnouncements() {
        try {
            announcementList.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading announcements...</p>
                </div>
            `;
            
            const response = await fetch(`http://localhost:5000/api/student/${student.student_id}/announcements`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch announcements');
            }
            
            announcements = await response.json();
            renderAnnouncements(announcements);
            updateUnreadCount();
            
            // Clear existing options first
            filterSubject.innerHTML = '<option value="all">All Subjects</option>';
            
            // Extract unique subjects from announcements
            const uniqueSubjects = new Set();
            announcements.forEach(ann => {
                if (ann.subject_name && ann.subject_name.trim() !== '') {
                    uniqueSubjects.add(ann.subject_name);
                }
            });
    
            // Add subject options
            uniqueSubjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                filterSubject.appendChild(option);
            });
    
        } catch (error) {
            console.error('Error fetching announcements:', error);
            announcementList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${error.message}</p>
                    <button id="retryButton">Retry</button>
                </div>
            `;
            document.getElementById('retryButton').addEventListener('click', fetchAnnouncements);
        }
    }

    // Render announcements to the DOM
    function renderAnnouncements(data) {
        if (data.length === 0) {
            announcementList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullhorn"></i>
                    <p>No announcements found</p>
                </div>
            `;
            return;
        }
        
        announcementList.innerHTML = '';
        
        data.forEach(announcement => {
            const announcementCard = document.createElement('div');
            announcementCard.className = `announcement-card ${announcement.is_read ? '' : 'unread'}`;
            announcementCard.dataset.id = announcement.announcement_id;
            
            const date = new Date(announcement.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            announcementCard.innerHTML = `
                <div class="announcement-header">
                    <h3 class="announcement-title">
                        ${announcement.title}
                        ${announcement.is_important ? '<i class="fas fa-exclamation-circle"></i>' : ''}
                    </h3>
                    <span class="announcement-date">${date}</span>
                </div>
                <div class="announcement-meta">
                    <span class="announcement-teacher">
                        <i class="fas fa-chalkboard-teacher"></i>
                        ${announcement.teacher_name}
                    </span>
                </div>
                <div class="announcement-content">
                    ${announcement.content}
                </div>
                <div class="announcement-footer">
                    <span class="announcement-subject">${announcement.subject_name || 'General'}</span>
                    ${announcement.file_path ? `
                        <span class="announcement-attachment">
                            <i class="fas fa-paperclip"></i>
                            Attachment
                        </span>
                    ` : ''}
                </div>
            `;
            
            announcementList.appendChild(announcementCard);
            
            // Add click event to view full announcement
            announcementCard.addEventListener('click', () => viewAnnouncement(announcement));
        });
    }

    // View full announcement in modal
    function viewAnnouncement(announcement) {
        const modalTitle = document.getElementById('modalTitle');
        const modalTeacher = document.getElementById('modalTeacher');
        const modalDate = document.getElementById('modalDate');
        const modalSubject = document.getElementById('modalSubject');
        const modalContent = document.getElementById('modalContent');
        const modalAttachment = document.getElementById('modalAttachment');
        
        const date = new Date(announcement.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        modalTitle.textContent = announcement.title;
        modalTeacher.innerHTML = `<i class="fas fa-chalkboard-teacher"></i> ${announcement.teacher_name}`;
        modalDate.innerHTML = `<i class="far fa-clock"></i> ${date}`;
        modalSubject.innerHTML = `<i class="fas fa-book"></i> ${announcement.subject_name || 'General'}`;
        modalContent.innerHTML = announcement.content;
        
        if (announcement.file_path) {
            modalAttachment.innerHTML = `
                <p><strong>Attachment:</strong></p>
                <a href="${announcement.file_path}" target="_blank">
                    <i class="fas fa-paperclip"></i>
                    Download File
                </a>
            `;
        } else {
            modalAttachment.innerHTML = '';
        }
        
        // Mark as read if unread
        if (!announcement.is_read) {
            markAsRead(announcement.announcement_id);
        }
        
        modal.style.display = 'flex';
    }

    // Mark announcement as read
    async function markAsRead(announcementId) {
        try {
            const response = await fetch(
                `http://localhost:5000/api/student/${student.student_id}/announcements/${announcementId}/mark-read`,
                { method: 'PUT' }
            );
            
            if (response.ok) {
                // Update local data
                const announcement = announcements.find(a => a.announcement_id == announcementId);
                if (announcement) {
                    announcement.is_read = true;
                    updateUnreadCount();
                    
                    // Update UI
                    const card = document.querySelector(`.announcement-card[data-id="${announcementId}"]`);
                    if (card) {
                        card.classList.remove('unread');
                    }
                }
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    // Update unread count badge
    async function updateUnreadCount() {
        try {
            const response = await fetch(
                `http://localhost:5000/api/student/${student.student_id}/announcements/unread-count`
            );
            
            if (response.ok) {
                const data = await response.json();
                unreadCount.textContent = data.count || '0';
                
                if (data.count > 0) {
                    unreadCount.style.display = 'flex';
                } else {
                    unreadCount.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }

    // Filter announcements
    function filterAnnouncements() {
        const subjectFilter = filterSubject.value;
        const dateFilter = filterDate.value;
        
        let filtered = [...announcements];
        
        // Apply subject filter
        if (subjectFilter !== 'all') {
            filtered = filtered.filter(ann => 
                ann.subject_name === subjectFilter
            );
        }
        
        // Apply date filter
        if (dateFilter === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
            filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        
        renderAnnouncements(filtered);
    }

    // Event Listeners
    filterSubject.addEventListener('change', filterAnnouncements);
    filterDate.addEventListener('change', filterAnnouncements);
    
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('student');
        window.location.href = 'studentLogin.html';
    });
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Initial load
    await fetchAnnouncements();
});
// Add this function to handle API errors
function handleApiError(error) {
    console.error('API Error:', error);
    announcementList.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${error.message || 'Failed to load announcements'}</p>
            <button id="retryButton" class="retry-btn">
                <i class="fas fa-sync-alt"></i> Try Again
            </button>
        </div>
    `;
    document.getElementById('retryButton').addEventListener('click', fetchAnnouncements);
}

