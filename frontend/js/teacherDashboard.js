document.addEventListener('DOMContentLoaded', () => {
    const apiBase = '/api/teacher'; // Adjust this base URL as needed

    // Elements
    const navMenu = document.querySelector('.nav-menu ul');
    const contentSections = document.querySelectorAll('.content-section');
    const logoutBtn = document.getElementById('logoutBtn');
    const teacherName = document.getElementById('teacherName');
    const teacherSubject = document.getElementById('teacherSubject');

    let currentTeacherId;

    // Initialize dashboard
    async function init() {
        try {
            // Fetch teacher profile
            const profile = await fetch(`${apiBase}/profile`, {
                method: 'GET',
                credentials: 'include'
            }).then(res => res.json());

            currentTeacherId = profile.user_id;
            teacherName.textContent = `${profile.first_name} ${profile.last_name}`;
            teacherSubject.textContent = profile.subject_teaches;

            loadSection('dashboard');
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }

    // Navigation handling
    navMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const section = e.target.getAttribute('data-section');
            loadSection(section);
        }
    });

    // Load section
    function loadSection(section) {
        contentSections.forEach(sec => sec.classList.add('hidden'));
        document.querySelector(`#${section}Section`).classList.remove('hidden');
        document.getElementById('sectionTitle').textContent = e.target.textContent;

        switch (section) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'schedule':
                loadSchedule();
                break;
            case 'attendance':
                loadAttendance();
                break;
            case 'grades':
                loadGrades();
                break;
            case 'materials':
                loadMaterials();
                break;
            case 'assignments':
                loadAssignments();
                break;
            case 'messages':
                loadMessages();
                break;
        }
    }

    // Dashboard loading
    async function loadDashboard() {
        try {
            const [schedules, assignments] = await Promise.all([
                fetch(`${apiBase}/schedules`, { credentials: 'include' }).then(res => res.json()),
                fetch(`${apiBase}/assignments`, { credentials: 'include' }).then(res => res.json())
            ]);

            populateTodaysClasses(schedules);
            document.getElementById('classCount').textContent = new Set(schedules.map(s => s.class_name)).size;
            document.getElementById('pendingAssignments').textContent = assignments.length;
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    // Populate today's classes
    function populateTodaysClasses(schedules) {
        const today = new Date().getDay();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todaysClasses = schedules.filter(s => s.day_of_week === days[today]);

        const container = document.getElementById('todaysClasses');
        container.innerHTML = '';
        todaysClasses.forEach(cls => {
            const div = document.createElement('div');
            div.className = 'class-item';
            div.innerHTML = `
                <h4>${cls.class_name}</h4>
                <p>${cls.subject_name} - Period ${cls.period_number}</p>
                <p>${cls.start_time} - ${cls.end_time}</p>
            `;
            container.appendChild(div);
        });
    }

    // Schedule loading
    async function loadSchedule() {
        try {
            const schedules = await fetch(`${apiBase}/schedules`, { credentials: 'include' }).then(res => res.json());

            const table = document.getElementById('scheduleTable');
            table.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Class</th>
                            <th>Subject</th>
                            <th>Period</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${schedules.map(s => `
                            <tr>
                                <td>${s.day_of_week}</td>
                                <td>${s.class_name}</td>
                                <td>${s.subject_name}</td>
                                <td>${s.period_number}</td>
                                <td>${s.start_time} - ${s.end_time}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    }

    // Attendance loading
    async function loadAttendance() {
        try {
            const attendance = await fetch(`${apiBase}/attendance`, { credentials: 'include' }).then(res => res.json());

            const container = document.getElementById('attendanceTableContainer');
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Student</th>
                            <th>Class</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${attendance.map(a => `
                            <tr>
                                <td>${a.date}</td>
                                <td>${a.first_name} ${a.last_name}</td>
                                <td>${a.class_name}</td>
                                <td>${a.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    }

    // Grades loading
    async function loadGrades() {
        try {
            const grades = await fetch(`${apiBase}/grades`, { credentials: 'include' }).then(res => res.json());

            const container = document.getElementById('gradesTableContainer');
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Subject</th>
                            <th>Grade</th>
                            <th>Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${grades.map(g => `
                            <tr>
                                <td>${g.first_name} ${g.last_name}</td>
                                <td>${g.subject_name}</td>
                                <td>${g.grade}</td>
                                <td>${g.comments || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error('Error loading grades:', error);
        }
    }

    // Materials loading
    async function loadMaterials() {
        try {
            const materials = await fetch(`${apiBase}/materials`, { credentials: 'include' }).then(res => res.json());

            const container = document.getElementById('materialsList');
            container.innerHTML = '';
            materials.forEach(m => {
                const div = document.createElement('div');
                div.className = 'material-item';
                div.innerHTML = `
                    <h4>${m.title}</h4>
                    <p>${new Date(m.uploaded_at).toLocaleDateString()}</p>
                    <a href="${m.file_path}" target="_blank">View Material</a>
                `;
                container.appendChild(div);
            });
        } catch (error) {
            console.error('Error loading materials:', error);
        }
    }

    // Assignments loading
    async function loadAssignments() {
        try {
            const assignments = await fetch(`${apiBase}/assignments`, { credentials: 'include' }).then(res => res.json());

            const container = document.getElementById('assignmentsList');
            container.innerHTML = '';
            assignments.forEach(a => {
                const div = document.createElement('div');
                div.className = 'assignment-item';
                div.innerHTML = `
                    <h4>${a.title}</h4>
                    <p>${a.description}</p>
                    <p>Due: ${new Date(a.due_date).toLocaleDateString()}</p>
                    <p>Submissions: ${a.submission_count}</p>
                `;
                container.appendChild(div);
            });
        } catch (error) {
            console.error('Error loading assignments:', error);
        }
    }

    // Messages loading
    async function loadMessages() {
        try {
            const messages = await fetch(`${apiBase}/chats`, { credentials: 'include' }).then(res => res.json());

            const conversationsList = document.getElementById('conversationsList');
            conversationsList.innerHTML = '';
            messages.forEach(msg => {
                const div = document.createElement('div');
                div.className = 'conversation-item';
                div.dataset.studentId = msg.student_id;
                div.innerHTML = `
                    <h4>${msg.student_first_name} ${msg.student_last_name}</h4>
                    <p>${msg.message_text.substring(0, 50)}...</p>
                `;
                conversationsList.appendChild(div);
            });
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    // Handle conversation selection
    document.getElementById('conversationsList').addEventListener('click', async (e) => {
        if (e.target.classList.contains('conversation-item')) {
            const studentId = e.target.dataset.studentId;
            const messages = await fetch(`${apiBase}/chats?studentId=${studentId}`, { credentials: 'include' }).then(res => res.json());

            const messageHistory = document.getElementById('messageHistory');
            messageHistory.innerHTML = '';
            messages.forEach(msg => {
                const div = document.createElement('div');
                div.className = `message ${msg.sender_id === currentTeacherId ? 'sent' : 'received'}`;
                div.innerHTML = `
                    <p>${msg.message_text}</p>
                    <small>${new Date(msg.sent_at).toLocaleString()}</small>
                `;
                messageHistory.appendChild(div);
            });

            document.getElementById('sendMessageBtn').dataset.studentId = studentId;
        }
    });

    // Send message
    document.getElementById('sendMessageBtn').addEventListener('click', async () => {
        const studentId = document.getElementById('sendMessageBtn').dataset.studentId;
        const messageText = document.getElementById('messageInput').value;

        if (!studentId || !messageText.trim()) return;

        try {
            await fetch(`${apiBase}/chats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    receiverId: studentId,
                    studentId: studentId,
                    messageText: messageText
                })
            });

            document.getElementById('messageInput').value = '';
            loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        fetch('/logout', { method: 'POST', credentials: 'include' })
            .then(() => window.location.href = '/login')
            .catch(error => console.error('Logout error:', error));
    });

    // Initialize
    init();
});