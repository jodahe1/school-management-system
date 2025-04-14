document.addEventListener('DOMContentLoaded', async () => {
  // Get authenticated student from localStorage
  const student = JSON.parse(localStorage.getItem('student'));
  if (!student) {
      console.error('Student not authenticated');
      window.location.href = 'studentLogin.html';
      return;
  }

  // DOM Elements
  const messagesContainer = document.getElementById('messagesContainer');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const API_BASE_URL = 'http://localhost:5000/api/message-board';

  // Load messages from backend
  const loadMessages = async () => {
      try {
          const response = await fetch(`${API_BASE_URL}/messages?user_id=${student.user_id}&role=student`);
          
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          displayMessages(data.messages || []);
      } catch (error) {
          console.error('Failed to load messages:', error);
          showError('Failed to load messages. Please try again.');
      }
  };

  // Display messages in UI
  const displayMessages = (messages) => {
      messagesContainer.innerHTML = '';
      
      if (messages.length === 0) {
          messagesContainer.innerHTML = '<div class="no-messages">No messages yet</div>';
          return;
      }

      messages.forEach(message => {
          const isSent = message.sender_id === student.user_id;
          const messageDiv = document.createElement('div');
          messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
          
          messageDiv.innerHTML = `
              <div class="message-text">${message.message_text}</div>
              <div class="message-info">
                  <span class="sender">${isSent ? 'You' : message.sender_name || 'Teacher'}</span>
                  <span class="time">${formatTime(message.posted_at)}</span>
              </div>
          `;
          
          messagesContainer.appendChild(messageDiv);
      });

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  // Send new message to backend
  const sendMessage = async () => {
      const messageText = messageInput.value.trim();
      if (!messageText) return;

      try {
          const response = await fetch(`${API_BASE_URL}/post`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  sender_id: student.user_id,
                  student_id: student.user_id, // Student messaging about themselves
                  recipient_role: 'teacher',   // Default to teacher
                  message_text: messageText
              })
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to send message');
          }

          messageInput.value = '';
          await loadMessages(); // Refresh messages after sending
      } catch (error) {
          console.error('Failed to send message:', error);
          showError(error.message || 'Failed to send message. Please try again.');
      }
  };

  // Helper functions
  const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const showError = (message) => {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      messagesContainer.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
  };

  // Event Listeners
  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
      }
  });

  // Initial load and refresh every 5 seconds
  await loadMessages();
  setInterval(loadMessages, 5000);
});