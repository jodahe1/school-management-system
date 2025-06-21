const express = require('express');
const chatController = require('../controllers/chatController');
const router = express.Router();

// Send a message
router.post('/send', chatController.sendMessage);

// Get chat messages between two users
router.get('/messages', chatController.getMessages);

// Get user conversations
router.get('/conversations', chatController.getConversations);

// Mark messages as read
router.post('/mark-read', chatController.markAsRead);

// Get unread message count
router.get('/unread-count', chatController.getUnreadCount);

// Get user details
router.get('/user-details', chatController.getUserDetails);

// Get related users for a student
router.get('/related-users', chatController.getRelatedUsers);

module.exports = router; 