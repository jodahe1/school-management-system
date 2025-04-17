// Load parent data from localStorage
const parent = JSON.parse(localStorage.getItem('parent'));
if (!parent) {
    window.location.href = 'parentLogin.html';
    throw new Error('Parent not found');
}

// API base URL
const API_BASE_URL = 'http://localhost:5000';

// Display parent name
document.getElementById('parentName').textContent = parent.username || 'Parent';

// Helper function for API calls
async function fetchWithErrorHandling(endpoint, errorMessage) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(errorMessage, error);
        showToast(errorMessage);
        return null;
    }
}

// Show toast notification
function showToast(message, isError = true) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : 'success'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Fetch child (student)
async function fetchChild() {
    const children = await fetchWithErrorHandling(
        `api/parent/children?parent_id=${parent.user_id}`,
        'Failed to load child information'
    );
    
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = children && children.length > 0
        ? children.map(child => `
            <li data-student-id="${child.student_id}" data-role="student">
                ${child.first_name} ${child.last_name}
            </li>
        `).join('')
        : '<li>No child assigned</li>';

    // Add click events to child
    document.querySelectorAll('#studentList li[data-student-id]').forEach(li => {
        li.addEventListener('click', () => {
            document.querySelectorAll('.recipient-list li').forEach(item => item.classList.remove('selected'));
            li.classList.add('selected');
            const studentId = li.getAttribute('data-student-id');
            const studentName = li.textContent.trim();
            document.getElementById('selectedRecipient').textContent = studentName;
            document.getElementById('selectedRecipient').dataset.role = 'student';
            document.getElementById('selectedRecipient').dataset.id = studentId;
            fetchMessages('student', studentId);
        });
    });
}

// Fetch teachers
async function fetchTeachers() {
    const teachers = await fetchWithErrorHandling(
        `api/message-board/teachers-for-parent?parent_id=${parent.user_id}`,
        'Failed to load teachers'
    );
    
    const teacherList = document.getElementById('teacherList');
    teacherList.innerHTML = teachers && teachers.length > 0
        ? teachers.map(teacher => `
            <li data-teacher-id="${teacher.teacher_id}" data-role="teacher">
                ${teacher.first_name} ${teacher.last_name} (${teacher.subject_teaches})
            </li>
        `).join('')
        : '<li>No teachers found</li>';

    // Add click events to teachers
    document.querySelectorAll('#teacherList li[data-teacher-id]').forEach(li => {
        li.addEventListener('click', () => {
            document.querySelectorAll('.recipient-list li').forEach(item => item.classList.remove('selected'));
            li.classList.add('selected');
            const teacherId = li.getAttribute('data-teacher-id');
            const teacherName = li.textContent.trim();
            document.getElementById('selectedRecipient').textContent = teacherName;
            document.getElementById('selectedRecipient').dataset.role = 'teacher';
            document.getElementById('selectedRecipient').dataset.id = teacherId;
            fetchMessages('teacher', teacherId);
        });
    });
}

// Fetch and display messages
async function fetchMessages(recipientRole, recipientId) {
    const messages = await fetchWithErrorHandling(
        `api/message-board/messages?user_id=${parent.user_id}&role=parent`,
        'Failed to load messages'
    );
    
    const chatMessages = document.getElementById('chatMessages');
    // Filter messages for the selected recipient
    const filteredMessages = messages ? messages.filter(msg => {
        if (recipientRole === 'student') {
            return msg.student_id === parseInt(recipientId) && 
                   (msg.recipient_role === 'student' || msg.sender_id === parseInt(recipientId));
        } else {
            return (msg.recipient_role === 'teacher' && msg.recipient_id === parseInt(recipientId)) ||
                   (msg.sender_id === parseInt(recipientId) && msg.recipient_role === 'parent');
        }
    }) : [];
    
    chatMessages.innerHTML = filteredMessages.length > 0
        ? filteredMessages.map(msg => `
            <div class="message ${msg.sender_id === parent.user_id ? 'sent' : 'received'}">
                <p><strong>${msg.sender_name}</strong> (${msg.recipient_role}):</p>
                <p>${msg.message_text}</p>
                <span class="timestamp">${new Date(msg.posted_at).toLocaleString()}</span>
            </div>
        `).join('')
        : '<p class="no-messages">No messages for this recipient</p>';

    // Update last read timestamp
    if (filteredMessages.length > 0) {
        const latestMessageTime = filteredMessages[0].posted_at;
        localStorage.setItem('lastMessageRead', latestMessageTime);
    }

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message
async function sendMessage(event) {
    event.preventDefault();
    
    const recipientRole = document.getElementById('selectedRecipient').dataset.role;
    const messageText = document.getElementById('messageText').value.trim();
    const selectedRecipient = document.getElementById('selectedRecipient');
    const recipientId = selectedRecipient.dataset.id;
    const recipientDataRole = selectedRecipient.dataset.role;

    if (!recipientId || !recipientDataRole) {
        showToast('Please select a recipient');
        return;
    }

    if (!recipientRole) {
        showToast('Please select a recipient role');
        return;
    }

    if (!messageText) {
        showToast('Message cannot be empty');
        return;
    }

    try {
        const payload = {
            sender_id: parent.user_id,
            recipient_role: recipientRole,
            message_text: messageText,
        };

        if (recipientRole === 'student') {
            payload.student_id = parseInt(recipientId);
        } else {
            payload.recipient_id = parseInt(recipientId);
            // Include student_id for teacher messages (select first child as context)
            const children = await fetchWithErrorHandling(
                `api/parent/children?parent_id=${parent.user_id}`,
                'Failed to load child information'
            );
            if (children && children.length > 0) {
                payload.student_id = children[0].student_id;
            }
        }

        const response = await fetch(`${API_BASE_URL}/api/message-board/post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            showToast('Message sent successfully!', false);
            document.getElementById('messageText').value = '';
            fetchMessages(recipientDataRole, recipientId);
        } else {
            const errorData = await response.json();
            showToast(errorData.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('An error occurred while sending');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    fetchChild();
    fetchTeachers();

    // Handle message form submission
    document.getElementById('messageForm').addEventListener('submit', sendMessage);

    // Refresh messages every 30 seconds if a recipient is selected
    setInterval(() => {
        const selectedRecipient = document.getElementById('selectedRecipient');
        const recipientId = selectedRecipient.dataset.id;
        const recipientRole = selectedRecipient.dataset.role;
        if (recipientId && recipientRole) {
            fetchMessages(recipientRole, recipientId);
        }
    }, 30000);
});