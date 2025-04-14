// chat.js
class ChatApp {
    constructor() {
      this.currentUser = JSON.parse(localStorage.getItem('user'));
      this.currentRecipient = null;
      this.API_BASE_URL = 'http://localhost:5000/api';
      this.messagePollingInterval = null;
      
      if (!this.currentUser) {
        window.location.href = 'login.html';
        return;
      }
      
      this.initElements();
      this.initEventListeners();
      this.loadRecipients();
      this.loadConversations();
      this.startMessagePolling();
    }
    
    initElements() {
      this.elements = {
        chatRecipient: document.getElementById('chatRecipient'),
        newChatBtn: document.getElementById('newChat'),
        chatList: document.getElementById('chatList'),
        chatThread: document.getElementById('chatThread'),
        chatMessage: document.getElementById('chatMessage'),
        sendMessageBtn: document.getElementById('sendMessage')
      };
    }
    
    initEventListeners() {
      this.elements.chatRecipient.addEventListener('change', (e) => {
        this.currentRecipient = e.target.value ? JSON.parse(e.target.value) : null;
        this.loadMessages();
      });
      
      this.elements.newChatBtn.addEventListener('click', () => {
        if (this.elements.chatRecipient.value) {
          this.loadMessages();
        } else {
          alert('Please select a recipient first');
        }
      });
      
      this.elements.sendMessageBtn.addEventListener('click', () => this.sendMessage());
      
      this.elements.chatMessage.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
    
    async loadRecipients() {
      try {
        let endpoint = '';
        let response;
        
        // Determine endpoint based on user role
        switch(this.currentUser.role) {
          case 'student':
            endpoint = `${this.API_BASE_URL}/student/${this.currentUser.user_id}/teachers`;
            response = await fetch(endpoint);
            break;
          case 'teacher':
            endpoint = `${this.API_BASE_URL}/teacher/${this.currentUser.user_id}/students`;
            response = await fetch(endpoint);
            break;
          case 'parent':
            endpoint = `${this.API_BASE_URL}/parent/${this.currentUser.user_id}/teachers`;
            response = await fetch(endpoint);
            break;
          default:
            throw new Error('Invalid user role');
        }
        
        if (!response.ok) throw new Error('Failed to load recipients');
        
        const recipients = await response.json();
        this.populateRecipientsDropdown(recipients);
      } catch (error) {
        console.error('Error loading recipients:', error);
        this.showToast('Failed to load recipients', true);
      }
    }
    
    populateRecipientsDropdown(recipients) {
      this.elements.chatRecipient.innerHTML = '<option value="">Select recipient...</option>';
      
      if (recipients && recipients.length > 0) {
        recipients.forEach(recipient => {
          const option = document.createElement('option');
          option.value = JSON.stringify(recipient);
          option.textContent = `${recipient.username} (${recipient.role})`;
          this.elements.chatRecipient.appendChild(option);
        });
      }
    }
    
    async loadConversations() {
      try {
        const response = await fetch(`${this.API_BASE_URL}/message-board/messages?user_id=${this.currentUser.user_id}&role=${this.currentUser.role}`);
        
        if (!response.ok) throw new Error('Failed to load conversations');
        
        const conversations = await response.json();
        this.renderConversationList(conversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
        this.showToast('Failed to load conversations', true);
      }
    }
    
    renderConversationList(conversations) {
      this.elements.chatList.innerHTML = '';
      
      if (conversations.length === 0) {
        this.elements.chatList.innerHTML = '<div class="no-conversations">No conversations yet</div>';
        return;
      }
      
      conversations.forEach(conversation => {
        const conversationEl = document.createElement('div');
        conversationEl.className = `chat-list-item ${conversation.unread ? 'unread' : ''}`;
        conversationEl.dataset.recipientId = conversation.recipient_id;
        
        conversationEl.innerHTML = `
          <div class="recipient-name">${conversation.recipient_name}</div>
          <div class="last-message">${conversation.last_message || 'No messages yet'}</div>
          <div class="message-time">${new Date(conversation.last_message_time).toLocaleString() || ''}</div>
        `;
        
        conversationEl.addEventListener('click', () => {
          this.currentRecipient = {
            user_id: conversation.recipient_id,
            username: conversation.recipient_name,
            role: conversation.recipient_role
          };
          this.loadMessages();
        });
        
        this.elements.chatList.appendChild(conversationEl);
      });
    }
    
    async loadMessages() {
      if (!this.currentRecipient) return;
      
      try {
        const response = await fetch(
          `${this.API_BASE_URL}/message-board/messages?` + 
          `sender_id=${this.currentUser.user_id}&` +
          `recipient_id=${this.currentRecipient.user_id}&` +
          `student_id=${this.currentUser.role === 'student' ? this.currentUser.user_id : this.currentRecipient.user_id}`
        );
        
        if (!response.ok) throw new Error('Failed to load messages');
        
        const messages = await response.json();
        this.renderMessages(messages);
        
        // Enable message input
        this.elements.chatMessage.disabled = false;
        this.elements.sendMessageBtn.disabled = false;
      } catch (error) {
        console.error('Error loading messages:', error);
        this.showToast('Failed to load messages', true);
      }
    }
    
    renderMessages(messages) {
      this.elements.chatThread.innerHTML = '';
      
      if (messages.length === 0) {
        this.elements.chatThread.innerHTML = `
          <div class="no-messages">
            <i class="fas fa-comment-slash"></i>
            <p>No messages yet. Start the conversation!</p>
          </div>
        `;
        return;
      }
      
      messages.forEach(message => {
        const isSent = message.sender_id === this.currentUser.user_id;
        const messageEl = document.createElement('div');
        messageEl.className = `message ${isSent ? 'sent' : 'received'}`;
        
        messageEl.innerHTML = `
          <div class="message-text">${message.message_text}</div>
          <div class="message-time">
            ${new Date(message.posted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        `;
        
        this.elements.chatThread.appendChild(messageEl);
      });
      
      // Scroll to bottom
      this.elements.chatThread.scrollTop = this.elements.chatThread.scrollHeight;
    }
    
    async sendMessage() {
      const messageText = this.elements.chatMessage.value.trim();
      if (!messageText || !this.currentRecipient) return;
      
      try {
        const response = await fetch(`${this.API_BASE_URL}/message-board/post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_id: this.currentUser.user_id,
            student_id: this.currentUser.role === 'student' ? this.currentUser.user_id : this.currentRecipient.user_id,
            recipient_role: this.currentRecipient.role,
            message_text: messageText
          })
        });
        
        if (!response.ok) throw new Error('Failed to send message');
        
        this.elements.chatMessage.value = '';
        this.loadMessages();
        this.loadConversations();
      } catch (error) {
        console.error('Error sending message:', error);
        this.showToast('Failed to send message', true);
      }
    }
    
    startMessagePolling() {
      // Check for new messages every 10 seconds
      this.messagePollingInterval = setInterval(() => {
        if (this.currentRecipient) {
          this.loadMessages();
        }
        this.loadConversations();
      }, 10000);
    }
    
    showToast(message, isError = false) {
      const toast = document.createElement('div');
      toast.className = `toast ${isError ? 'error' : 'success'}`;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  }
  
  // Initialize the chat app when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
  });