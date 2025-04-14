// Load teacher data from localStorage
const teacher = JSON.parse(localStorage.getItem('teacher'));
if (!teacher) {
    window.location.href = 'teacherLogin.html';
    throw new Error('Teacher not found');
}

// API base URL
const API_BASE_URL = 'http://localhost:5000';

// Display teacher name
document.getElementById('teacherName').textContent = `${teacher.first_name} ${teacher.last_name}` || 'Teacher';

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

// Fetch classes
async function fetchClasses() {
    const classes = await fetchWithErrorHandling(
        `api/message-board/classes?teacher_id=${teacher.user_id}`,
        'Failed to load classes'
    );
    
    const classSelect = document.getElementById('classSelect');
    classSelect.innerHTML = '<option value="">Select a class</option>';
    
    if (classes && classes.length > 0) {
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.class_id;
            option.textContent = cls.class_name;
            classSelect.appendChild(option);
        });
    }
}

// Fetch students for a class
async function fetchStudents(classId) {
    const students = await fetchWithErrorHandling(
        `api/message-board/students?teacher_id=${teacher.user_id}&class_id=${classId}`,
        'Failed to load students'
    );
    
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = students && students.length > 0
        ? students.map(student => `
            <li data-student-id="${student.student_id}">
                ${student.first_name} ${student.last_name}
            </li>
        `).join('')
        : '<li>No students found</li>';

    // Add click events to students
    document.querySelectorAll('#studentList li[data-student-id]').forEach(li => {
        li.addEventListener('click', () => {
            document.querySelectorAll('#studentList li').forEach(item => item.classList.remove('selected'));
            li.classList.add('selected');
            const studentId = li.getAttribute('data-student-id');
            const studentName = li.textContent.trim();
            document.getElementById('selectedStudent').textContent = studentName;
            document.getElementById('selectedStudent').dataset.studentId = studentId;
            fetchMessages(studentId);
        });
    });
}

// Fetch and display messages
async function fetchMessages(studentId) {
    const messages = await fetchWithErrorHandling(
        `api/message-board/messages?user_id=${teacher.user_id}&role=teacher`,
        'Failed to load messages'
    );
    
    const chatMessages = document.getElementById('chatMessages');
    // Filter messages for the selected student
    const filteredMessages = messages ? messages.filter(msg => msg.student_id === parseInt(studentId)) : [];
    
    chatMessages.innerHTML = filteredMessages.length > 0
        ? filteredMessages.map(msg => `
            <div class="message ${msg.sender_id === teacher.user_id ? 'sent' : 'received'}">
                <p><strong>${msg.sender_name}</strong> (${msg.recipient_role}):</p>
                <p>${msg.message_text}</p>
                <span class="timestamp">${new Date(msg.posted_at).toLocaleString()}</span>
            </div>
        `).join('')
        : '<p class="no-messages">No messages for this student</p>';

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
    
    const recipientRole = document.getElementById('recipientRole').value;
    const messageText = document.getElementById('messageText').value.trim();
    const studentId = document.getElementById('selectedStudent').dataset.studentId;

    if (!studentId) {
        showToast('Please select a student');
        return;
    }

    if (!recipientRole) {
        showToast('Please select a recipient');
        return;
    }

    if (!messageText) {
        showToast('Message cannot be empty');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/message-board/post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender_id: teacher.user_id,
                student_id: parseInt(studentId),
                recipient_role: recipientRole,
                message_text: messageText,
            }),
        });

        if (response.ok) {
            showToast('Message sent successfully!', false);
            document.getElementById('messageText').value = '';
            fetchMessages(studentId);
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
    fetchClasses();

    // Handle class selection
    document.getElementById('classSelect').addEventListener('change', (e) => {
        const classId = e.target.value;
        if (classId) {
            fetchStudents(classId);
        } else {
            document.getElementById('studentList').innerHTML = '<li class="loading">Select a class to view students...</li>';
            document.getElementById('selectedStudent').textContent = '[No student selected]';
            document.getElementById('selectedStudent').dataset.studentId = '';
            document.getElementById('chatMessages').innerHTML = '<p class="no-messages">No messages selected</p>';
        }
    });

    // Handle message form submission
    document.getElementById('messageForm').addEventListener('submit', sendMessage);

    // Refresh messages every 30 seconds if a student is selected
    setInterval(() => {
        const studentId = document.getElementById('selectedStudent').dataset.studentId;
        if (studentId) {
            fetchMessages(studentId);
        }
    }, 30000);
});