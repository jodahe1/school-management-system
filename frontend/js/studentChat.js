// Load student data from localStorage
const student = JSON.parse(localStorage.getItem('student'));
if (!student) {
  window.location.href = 'studentLogin.html';
  throw new Error('Student not found');
}

// API base URL
const API_BASE_URL = 'http://localhost:5000';

// Display student name
document.getElementById('studentName').textContent = student.username || 'Student';

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

// Fetch teachers
async function fetchTeachers() {
  const teachers = await fetchWithErrorHandling(
    `api/message-board/teachers?student_id=${student.user_id}`,
    'Failed to load teachers'
  );
  
  const teacherList = document.getElementById('teacherList');
  teacherList.innerHTML = teachers && teachers.length > 0
    ? teachers.map(teacher => `
        <li data-recipient="teacher">
          ${teacher.first_name} ${teacher.last_name} (${teacher.subject_teaches})
        </li>
      `).join('')
    : '<li>No teachers found</li>';
}

// Fetch parent
async function fetchParent() {
  const parent = await fetchWithErrorHandling(
    `api/student/${student.user_id}/parent`,
    'Failed to load parent'
  );
  
  const parentList = document.getElementById('parentList');
  parentList.innerHTML = parent && parent.parent_id
    ? `<li data-recipient="parent">${parent.first_name} ${parent.last_name}</li>`
    : '<li>No parent assigned</li>';
}

// Fetch and display messages
async function fetchMessages() {
  const messages = await fetchWithErrorHandling(
    `api/message-board/messages?user_id=${student.user_id}&role=student`,
    'Failed to load messages'
  );
  
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = messages && messages.length > 0
    ? messages.map(msg => `
        <div class="message ${msg.sender_id === student.user_id ? 'sent' : 'received'}">
          <p><strong>${msg.sender_name}</strong> (${msg.recipient_role}):</p>
          <p>${msg.message_text}</p>
          <span class="timestamp">${new Date(msg.posted_at).toLocaleString()}</span>
        </div>
      `).join('')
    : '<p class="no-messages">No messages available</p>';

  // Update last read timestamp
  if (messages && messages.length > 0) {
    const latestMessageTime = messages[0].posted_at;
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
        sender_id: student.user_id,
        student_id: student.user_id,
        recipient_role: recipientRole,
        message_text: messageText,
      }),
    });

    if (response.ok) {
      showToast('Message sent successfully!', false);
      document.getElementById('messageText').value = '';
      fetchMessages();
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
  fetchTeachers();
  fetchParent();
  fetchMessages();

  // Refresh messages every 30 seconds
  setInterval(fetchMessages, 30000);

  // Handle message form submission
  document.getElementById('messageForm').addEventListener('submit', sendMessage);
});