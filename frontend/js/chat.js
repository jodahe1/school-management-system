document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const recipientRoleSelect = document.getElementById('recipient-role');
    const studentSelect = document.getElementById('student-select');
    const messageList = document.getElementById('message-list');
    const messagesContainer = document.getElementById('messages');
    const messageText = document.getElementById('message-text');
    const sendBtn = document.getElementById('send-btn');

    // State variables
    let currentUser = null;
    let currentStudentId = null;
    let currentRecipientRole = null;
    let allMessages = [];
    let students = [];

    // Initialize the application
    async function init() {
        // Check if user is logged in (in a real app, you'd have proper auth)
        const userData = await fetchCurrentUser();
        if (!userData) {
            window.location.href = 'login.html';
            return;
        }

        currentUser = userData;
        usernameDisplay.textContent = currentUser.username;

        // Load students based on user role
        await loadStudents();

        // Set up event listeners
        setupEventListeners();

        // Load initial messages
        await loadMessages();
    }

    // Fetch current user data (mock - replace with actual API call)
    async function fetchCurrentUser() {
        try {
            // In a real app, you'd get this from your authentication system
            // This is just for demonstration
            const response = await fetch('/api/current-user');
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return await response.json();
            
            // For testing purposes, you can use this mock data:
            /*
            return {
                user_id: 1,
                username: 'JohnDoe',
                role: 'teacher', // or 'parent', 'student'
                teacher_id: 1,  // if role is teacher
                parent_id: null, // if role is parent
                student_id: null // if role is student
            };
            */
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    // Load students based on user role
    async function loadStudents() {
        try {
            let url = '';
            if (currentUser.role === 'teacher') {
                url = `/api/teacher/${currentUser.teacher_id}/students`;
            } else if (currentUser.role === 'parent') {
                url = `/api/parent/${currentUser.parent_id}/students`;
            } else {
                // Students can only message their teachers
                studentSelect.disabled = true;
                return;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }

            students = await response.json();
            populateStudentSelect(students);
        } catch (error) {
            console.error('Error loading students:', error);
            alert('Failed to load students');
        }
    }

    // Populate student select dropdown
    function populateStudentSelect(students) {
        studentSelect.innerHTML = '<option value="">Select a student</option>';
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.student_id;
            option.textContent = student.name || `Student ${student.student_id}`;
            studentSelect.appendChild(option);
        });
        studentSelect.disabled = false;
    }

    // Set up event listeners
    function setupEventListeners() {
        logoutBtn.addEventListener('click', handleLogout);
        recipientRoleSelect.addEventListener('change', handleRecipientRoleChange);
        studentSelect.addEventListener('change', handleStudentSelect);
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
        // In a real app, you'd call your logout API
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }

    // Handle recipient role change
    function handleRecipientRoleChange(e) {
        currentRecipientRole = e.target.value;
        
        // Enable/disable student select based on role
        if (currentRecipientRole === 'teacher' || currentRecipientRole === 'parent') {
            studentSelect.disabled = false;
        } else {
            studentSelect.disabled = true;
            currentStudentId = null;
        }
        
        // Load messages for the selected recipient type
        loadMessages();
    }

    // Handle student selection
    function handleStudentSelect(e) {
        currentStudentId = e.target.value;
        loadMessages();
    }

    // Load messages
    async function loadMessages() {
        try {
            let url = '/api/message-board/messages';
            const params = new URLSearchParams();
            params.append('user_id', currentUser.user_id);
            params.append('role', currentUser.role);
            
            if (currentRecipientRole && currentStudentId) {
                params.append('recipient_role', currentRecipientRole);
                params.append('student_id', currentStudentId);
            }

            const response = await fetch(`${url}?${params.toString()}`);
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

        // Group messages by conversation (student + recipient role)
        const conversations = {};
        allMessages.forEach(msg => {
            const key = `${msg.student_id}-${msg.recipient_role}`;
            if (!conversations[key]) {
                conversations[key] = {
                    student_id: msg.student_id,
                    recipient_role: msg.recipient_role,
                    student_name: msg.student_name || `Student ${msg.student_id}`,
                    last_message: msg.message_text,
                    last_message_time: msg.posted_at,
                    unread: false // You could track unread status
                };
            }
        });

        // Create preview items for each conversation
        Object.values(conversations).forEach(convo => {
            const preview = document.createElement('div');
            preview.className = 'message-preview';
            if (convo.student_id == currentStudentId && convo.recipient_role == currentRecipientRole) {
                preview.classList.add('active');
            }
            
            preview.innerHTML = `
                <h4>${convo.student_name} (${convo.recipient_role})</h4>
                <p>${convo.last_message}</p>
                <small>${formatTime(convo.last_message_time)}</small>
            `;
            
            preview.addEventListener('click', () => {
                currentStudentId = convo.student_id;
                currentRecipientRole = convo.recipient_role;
                studentSelect.value = currentStudentId;
                recipientRoleSelect.value = currentRecipientRole;
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
        
        if (!currentStudentId || !currentRecipientRole) {
            messagesContainer.innerHTML = '<p>Select a student and recipient type to view messages</p>';
            return;
        }

        const filteredMessages = allMessages.filter(msg => 
            msg.student_id == currentStudentId && 
            msg.recipient_role == currentRecipientRole
        );

        if (filteredMessages.length === 0) {
            messagesContainer.innerHTML = '<p>No messages in this conversation</p>';
            return;
        }

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
        if (!text || !currentStudentId || !currentRecipientRole) {
            alert('Please select a student, recipient type, and enter a message');
            return;
        }

        try {
            const response = await fetch('/api/message-board/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender_id: currentUser.user_id,
                    student_id: currentStudentId,
                    recipient_role: currentRecipientRole,
                    message_text: text
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

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