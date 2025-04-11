document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const recipientRoleSelect = document.getElementById('recipient-role');
    const studentSelect = document.getElementById('student-select');
    const subjectSelect = document.getElementById('subject-select');
    const teacherSelect = document.getElementById('teacher-select');
    const messageList = document.getElementById('message-list');
    const messagesContainer = document.getElementById('messages');
    const messageText = document.getElementById('message-text');
    const sendBtn = document.getElementById('send-btn');

    // State variables
    let currentUser = null;
    let currentStudentId = null;
    let currentRecipientRole = null;
    let currentSubjectId = null;
    let currentTeacherId = null;
    let allMessages = [];
    let students = [];
    let teachers = [];
    let subjects = [];

    // Initialize the application
    async function init() {
        // Get user data from session storage
        const userData = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!userData) {
            redirectToLogin();
            return;
        }

        currentUser = userData;
        usernameDisplay.textContent = currentUser.username;

        // Load initial data based on user role
        await loadInitialData();

        // Set up UI based on user role
        setupUIForRole();

        // Set up event listeners
        setupEventListeners();

        // Load initial messages
        await loadMessages();
    }

    // Redirect to appropriate login page
    function redirectToLogin() {
        // In a real app, you might have different login pages
        // For this example, we'll redirect to a generic login
        window.location.href = 'studentLogin.html';
    }

    // Load initial data based on user role
    async function loadInitialData() {
        try {
            if (currentUser.role === 'teacher') {
                // Load teacher's students and subjects
                const [studentsRes, subjectsRes] = await Promise.all([
                    fetch(`/api/teachers/${currentUser.user_id}/students`),
                    fetch(`/api/teachers/${currentUser.user_id}/subjects`)
                ]);
                
                if (!studentsRes.ok || !subjectsRes.ok) {
                    throw new Error('Failed to load teacher data');
                }
                
                students = await studentsRes.json();
                subjects = await subjectsRes.json();
            } 
            else if (currentUser.role === 'parent') {
                // Load parent's children
                const response = await fetch(`/api/parents/${currentUser.user_id}/students`);
                if (!response.ok) throw new Error('Failed to load parent data');
                students = await response.json();
            } 
            else if (currentUser.role === 'student') {
                // Load student's teachers and subjects
                const [teachersRes, subjectsRes] = await Promise.all([
                    fetch(`/api/students/${currentUser.user_id}/teachers`),
                    fetch(`/api/students/${currentUser.user_id}/subjects`)
                ]);
                
                if (!teachersRes.ok || !subjectsRes.ok) {
                    throw new Error('Failed to load student data');
                }
                
                teachers = await teachersRes.json();
                subjects = await subjectsRes.json();
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            alert('Failed to load initial data');
        }
    }

    // Set up UI based on user role
    function setupUIForRole() {
        if (currentUser.role === 'teacher') {
            // Teachers can message parents or students
            populateSelect(studentSelect, students, 'Select student');
            populateSelect(subjectSelect, subjects, 'Select subject');
            document.getElementById('teacher-controls').style.display = 'none';
        } 
        else if (currentUser.role === 'parent') {
            // Parents can message teachers
            populateSelect(studentSelect, students, 'Select student');
            recipientRoleSelect.value = 'teacher';
            document.getElementById('subject-controls').style.display = 'none';
            document.getElementById('teacher-controls').style.display = 'none';
        } 
        else if (currentUser.role === 'student') {
            // Students can message teachers
            populateSelect(teacherSelect, teachers, 'Select teacher');
            populateSelect(subjectSelect, subjects, 'Select subject');
            recipientRoleSelect.value = 'teacher';
            document.getElementById('student-controls').style.display = 'none';
        }
    }

    // Populate a select element with options
    function populateSelect(selectElement, items, defaultText) {
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            selectElement.appendChild(option);
        });
        selectElement.disabled = false;
    }

    // Set up event listeners
    function setupEventListeners() {
        logoutBtn.addEventListener('click', handleLogout);
        
        if (recipientRoleSelect) {
            recipientRoleSelect.addEventListener('change', handleRecipientRoleChange);
        }
        
        if (studentSelect) {
            studentSelect.addEventListener('change', handleStudentSelect);
        }
        
        if (subjectSelect) {
            subjectSelect.addEventListener('change', handleSubjectSelect);
        }
        
        if (teacherSelect) {
            teacherSelect.addEventListener('change', handleTeacherSelect);
        }
        
        sendBtn.addEventListener('click', handleSendMessage);
        messageText.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }

    // Handle logout
    function handleLogout() {
        sessionStorage.removeItem('currentUser');
        redirectToLogin();
    }

    // Handle recipient role change (for teachers)
    function handleRecipientRoleChange(e) {
        currentRecipientRole = e.target.value;
        loadMessages();
    }

    // Handle student selection
    function handleStudentSelect(e) {
        currentStudentId = e.target.value;
        loadMessages();
    }

    // Handle subject selection
    function handleSubjectSelect(e) {
        currentSubjectId = e.target.value;
        loadMessages();
    }

    // Handle teacher selection (for students)
    function handleTeacherSelect(e) {
        currentTeacherId = e.target.value;
        loadMessages();
    }

    // Load messages from backend
    async function loadMessages() {
        try {
            const params = new URLSearchParams();
            params.append('user_id', currentUser.user_id);
            params.append('role', currentUser.role);

            if (currentUser.role === 'teacher') {
                if (currentStudentId) params.append('student_id', currentStudentId);
                if (currentSubjectId) params.append('subject_id', currentSubjectId);
                if (currentRecipientRole) params.append('recipient_role', currentRecipientRole);
            } 
            else if (currentUser.role === 'parent') {
                if (currentStudentId) params.append('student_id', currentStudentId);
                params.append('recipient_role', 'teacher');
            } 
            else if (currentUser.role === 'student') {
                if (currentTeacherId) params.append('teacher_id', currentTeacherId);
                if (currentSubjectId) params.append('subject_id', currentSubjectId);
                params.append('recipient_role', 'teacher');
            }

            const response = await fetch(`/api/message-board/messages?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            allMessages = data.messages || [];
            renderMessageList();
            renderMessages();
        } catch (error) {
            console.error('Error loading messages:', error);
            alert('Failed to load messages');
        }
    }

    // Render message list in sidebar
    function renderMessageList() {
        messageList.innerHTML = '';
        
        if (allMessages.length === 0) {
            messageList.innerHTML = '<p class="no-messages">No messages found</p>';
            return;
        }

        // Group messages by conversation
        const conversations = {};
        allMessages.forEach(msg => {
            let key;
            if (currentUser.role === 'teacher') {
                key = `${msg.student_id}-${msg.recipient_role}-${msg.subject_id}`;
            } else if (currentUser.role === 'parent') {
                key = `${msg.student_id}-teacher`;
            } else {
                key = `${msg.teacher_id}-${msg.subject_id}`;
            }

            if (!conversations[key]) {
                conversations[key] = {
                    student_id: msg.student_id,
                    teacher_id: msg.teacher_id,
                    subject_id: msg.subject_id,
                    recipient_role: msg.recipient_role,
                    student_name: msg.student_name,
                    teacher_name: msg.teacher_name,
                    subject_name: msg.subject_name,
                    last_message: msg.message_text,
                    last_message_time: msg.posted_at
                };
            }
        });

        // Create preview items for each conversation
        Object.values(conversations).forEach(convo => {
            const preview = document.createElement('div');
            preview.className = 'message-preview';
            
            // Determine if this conversation is active
            let isActive = false;
            if (currentUser.role === 'teacher') {
                isActive = convo.student_id == currentStudentId && 
                          convo.recipient_role == currentRecipientRole &&
                          convo.subject_id == currentSubjectId;
            } else if (currentUser.role === 'parent') {
                isActive = convo.student_id == currentStudentId;
            } else {
                isActive = convo.teacher_id == currentTeacherId && 
                          convo.subject_id == currentSubjectId;
            }

            if (isActive) preview.classList.add('active');
            
            // Create preview content based on user role
            let previewContent = '';
            if (currentUser.role === 'teacher') {
                previewContent = `
                    <h4>${convo.student_name} (${convo.recipient_role})</h4>
                    <p>${convo.subject_name}</p>
                    <p>${convo.last_message}</p>
                    <small>${formatTime(convo.last_message_time)}</small>
                `;
            } else if (currentUser.role === 'parent') {
                previewContent = `
                    <h4>${convo.student_name} - Teacher</h4>
                    <p>${convo.last_message}</p>
                    <small>${formatTime(convo.last_message_time)}</small>
                `;
            } else {
                previewContent = `
                    <h4>${convo.teacher_name} - ${convo.subject_name}</h4>
                    <p>${convo.last_message}</p>
                    <small>${formatTime(convo.last_message_time)}</small>
                `;
            }
            
            preview.innerHTML = previewContent;
            
            preview.addEventListener('click', () => {
                if (currentUser.role === 'teacher') {
                    currentStudentId = convo.student_id;
                    currentRecipientRole = convo.recipient_role;
                    currentSubjectId = convo.subject_id;
                    studentSelect.value = currentStudentId;
                    recipientRoleSelect.value = currentRecipientRole;
                    subjectSelect.value = currentSubjectId;
                } else if (currentUser.role === 'parent') {
                    currentStudentId = convo.student_id;
                    studentSelect.value = currentStudentId;
                } else {
                    currentTeacherId = convo.teacher_id;
                    currentSubjectId = convo.subject_id;
                    teacherSelect.value = currentTeacherId;
                    subjectSelect.value = currentSubjectId;
                }
                
                renderMessages();
                
                // Update active state
                document.querySelectorAll('.message-preview').forEach(el => el.classList.remove('active'));
                preview.classList.add('active');
            });
            
            messageList.appendChild(preview);
        });
    }

    // Render messages in main area
    function renderMessages() {
        messagesContainer.innerHTML = '';
        
        // Check if we have enough selection criteria
        let isValidSelection = false;
        if (currentUser.role === 'teacher') {
            isValidSelection = currentStudentId && currentRecipientRole && currentSubjectId;
        } else if (currentUser.role === 'parent') {
            isValidSelection = currentStudentId;
        } else {
            isValidSelection = currentTeacherId && currentSubjectId;
        }

        if (!isValidSelection) {
            messagesContainer.innerHTML = '<p>Please make all required selections to view messages</p>';
            return;
        }

        // Filter messages based on current selections
        const filteredMessages = allMessages.filter(msg => {
            if (currentUser.role === 'teacher') {
                return msg.student_id == currentStudentId && 
                       msg.recipient_role == currentRecipientRole &&
                       msg.subject_id == currentSubjectId;
            } else if (currentUser.role === 'parent') {
                return msg.student_id == currentStudentId && 
                       msg.recipient_role == 'teacher';
            } else {
                return msg.teacher_id == currentTeacherId && 
                       msg.subject_id == currentSubjectId;
            }
        });

        if (filteredMessages.length === 0) {
            messagesContainer.innerHTML = '<p>No messages in this conversation</p>';
            return;
        }

        // Display messages
        filteredMessages.forEach(msg => {
            const isSent = msg.sender_id == currentUser.user_id;
            const messageEl = document.createElement('div');
            messageEl.className = `message ${isSent ? 'sent' : 'received'}`;
            
            messageEl.innerHTML = `
                <div class="message-header">
                    <span>${msg.sender_name}</span>
                    <span>${formatDate(msg.posted_at)}</span>
                </div>
                <div class="message-text">${msg.message_text}</div>
                <div class="message-time">${formatTime(msg.posted_at)}</div>
            `;
            
            messagesContainer.appendChild(messageEl);
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Handle sending a message
    async function handleSendMessage() {
        const text = messageText.value.trim();
        
        // Validate inputs based on user role
        let isValid = false;
        let errorMessage = '';
        
        if (currentUser.role === 'teacher') {
            isValid = currentStudentId && currentRecipientRole && currentSubjectId && text;
            errorMessage = 'Please select student, recipient type, subject, and enter a message';
        } else if (currentUser.role === 'parent') {
            isValid = currentStudentId && text;
            errorMessage = 'Please select student and enter a message';
        } else {
            isValid = currentTeacherId && currentSubjectId && text;
            errorMessage = 'Please select teacher, subject, and enter a message';
        }

        if (!isValid) {
            alert(errorMessage);
            return;
        }

        try {
            // Prepare message data based on user role
            const messageData = {
                sender_id: currentUser.user_id,
                message_text: text
            };

            if (currentUser.role === 'teacher') {
                messageData.student_id = currentStudentId;
                messageData.recipient_role = currentRecipientRole;
                messageData.subject_id = currentSubjectId;
            } else if (currentUser.role === 'parent') {
                messageData.student_id = currentStudentId;
                messageData.recipient_role = 'teacher';
            } else {
                messageData.teacher_id = currentTeacherId;
                messageData.subject_id = currentSubjectId;
                messageData.recipient_role = 'teacher';
            }

            const response = await fetch('/api/message-board/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData)
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const newMessage = await response.json();
            
            // Add the new message to our local state
            allMessages.unshift(newMessage.data);
            
            // Clear input and reload messages
            messageText.value = '';
            await loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    }

    // Helper functions for formatting
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    function formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Initialize the app
    init();
});