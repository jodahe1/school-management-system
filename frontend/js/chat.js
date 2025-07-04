// --- Chat App Logic ---
// Assumes user info is stored in localStorage as { userId, userType, userName }
// Example: localStorage.setItem('user', JSON.stringify({ userId: 28, userType: 'student', userName: 'John Doe' }))

const API_BASE = 'http://localhost:5000/api/chat';

let currentUser = JSON.parse(localStorage.getItem('user'));
let selectedConversation = null;

const conversationList = document.getElementById('conversation-list');
const messageList = document.getElementById('message-list');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const chatHeader = document.getElementById('chat-header');

if (!currentUser) {
  alert('User not logged in. Please log in first.');
  window.location.href = '/';
}

// Fetch conversations
async function fetchConversations() {
  const res = await fetch(`${API_BASE}/conversations?user_id=${currentUser.userId}&user_type=${currentUser.userType}`);
  const conversations = await res.json();
  renderConversations(conversations);
}

function renderConversations(conversations) {
  conversationList.innerHTML = '';
  if (!conversations || conversations.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No conversations yet. Start a chat with your teacher or parent!';
    li.style.color = '#888';
    li.style.textAlign = 'center';
    conversationList.appendChild(li);
    messageList.innerHTML = '<div style="color:#888;text-align:center;margin-top:2rem;">Select a conversation or start a new one to see messages here.</div>';
    chatHeader.textContent = '';
    return;
  }

  // Deduplicate by other_user_id + other_user_type
  const seen = new Set();
  const uniqueConversations = [];
  conversations.forEach(conv => {
    const key = `${conv.other_user_id}_${conv.other_user_type}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueConversations.push(conv);
    }
  });

  uniqueConversations.forEach(conv => {
    const li = document.createElement('li');
    // Create a span for the role with a class
    const roleSpan = document.createElement('span');
    roleSpan.textContent = conv.other_user_role || '';
    roleSpan.className = 'role-badge ' + (conv.other_user_role ? conv.other_user_role.toLowerCase() : '');
    roleSpan.style.marginRight = '8px';

    li.appendChild(roleSpan);

    // Add the name after the badge
    li.appendChild(document.createTextNode(conv.other_user_name || `${conv.other_user_role} ${conv.other_user_id}`));
    li.onclick = () => selectConversation(conv);
    if (
      selectedConversation &&
      conv.other_user_id === selectedConversation.other_user_id &&
      conv.other_user_type === selectedConversation.other_user_type
    ) {
      li.classList.add('active');
    }
    conversationList.appendChild(li);
  });
}

function selectConversation(conv) {
  selectedConversation = conv;
  chatHeader.textContent = conv.other_user_name || `${conv.other_user_role} ${conv.other_user_id}`;
  fetchMessages();
  fetchConversations(); // To update active state
}

// Fetch messages for selected conversation
async function fetchMessages() {
  if (!selectedConversation) return;
  const res = await fetch(`${API_BASE}/messages?user1_id=${currentUser.userId}&user1_type=${currentUser.userType}&user2_id=${selectedConversation.other_user_id}&user2_type=${selectedConversation.other_user_type}&limit=50&offset=0`);
  const messages = await res.json();
  renderMessages(messages);
  // Mark as read
  await fetch(`${API_BASE}/mark-read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender_id: selectedConversation.other_user_id,
      sender_type: selectedConversation.other_user_type,
      receiver_id: currentUser.userId,
      receiver_type: currentUser.userType
    })
  });
}

function renderMessages(messages) {
  messageList.innerHTML = '';
  messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'message ' + (msg.sender_id === currentUser.userId && msg.sender_type === currentUser.userType ? 'sent' : 'received');
    div.textContent = msg.message_content;
    messageList.appendChild(div);
  });
  messageList.scrollTop = messageList.scrollHeight;
}

// Send message
messageForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!selectedConversation) return;
  const content = messageInput.value.trim();
  if (!content) return;
  await fetch(`${API_BASE}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender_id: currentUser.userId,
      sender_type: currentUser.userType,
      receiver_id: selectedConversation.other_user_id,
      receiver_type: selectedConversation.other_user_type,
      message_content: content,
      message_type: 'text'
    })
  });
  messageInput.value = '';
  fetchMessages();
};

// Initial load
fetchConversations();

// Poll for new messages every 5 seconds
globalThis.chatPollInterval = setInterval(() => {
  if (selectedConversation) fetchMessages();
  fetchConversations();
}, 5000);