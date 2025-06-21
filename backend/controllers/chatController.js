const chatModel = require('../models/chatModel');

// Send a message
const sendMessage = async (req, res) => {
    try {
        const { sender_id, sender_type, receiver_id, receiver_type, message_content, message_type = 'text' } = req.body;
        
        if (!sender_id || !sender_type || !receiver_id || !receiver_type || !message_content) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const message = await chatModel.createMessage(sender_id, sender_type, receiver_id, receiver_type, message_content, message_type);
        res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get chat messages between two users
const getMessages = async (req, res) => {
    try {
        const { user1_id, user1_type, user2_id, user2_type, limit = 50, offset = 0 } = req.query;
        
        if (!user1_id || !user1_type || !user2_id || !user2_type) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const messages = await chatModel.getChatMessages(user1_id, user1_type, user2_id, user2_type, limit, offset);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get user conversations
const getConversations = async (req, res) => {
    try {
        const { user_id, user_type } = req.query;
        
        if (!user_id || !user_type) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const conversations = await chatModel.getUserConversations(user_id, user_type);
        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Mark messages as read
const markAsRead = async (req, res) => {
    try {
        const { receiver_id, receiver_type, sender_id, sender_type } = req.body;
        
        if (!receiver_id || !receiver_type || !sender_id || !sender_type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const updatedCount = await chatModel.markMessagesAsRead(receiver_id, receiver_type, sender_id, sender_type);
        res.status(200).json({ message: 'Messages marked as read', updated_count: updatedCount });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
    try {
        const { user_id, user_type } = req.query;
        
        if (!user_id || !user_type) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const unreadCount = await chatModel.getUnreadCount(user_id, user_type);
        res.status(200).json({ unread_count: unreadCount });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get user details
const getUserDetails = async (req, res) => {
    try {
        const { user_id, user_type } = req.query;
        
        if (!user_id || !user_type) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const userDetails = await chatModel.getUserDetails(user_id, user_type);
        if (!userDetails) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(userDetails);
    } catch (error) {
        console.error('Error getting user details:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get related users for a student
const getRelatedUsers = async (req, res) => {
    try {
        const { student_id } = req.query;
        
        if (!student_id) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        const relatedUsers = await chatModel.getRelatedUsers(student_id);
        res.status(200).json(relatedUsers);
    } catch (error) {
        console.error('Error getting related users:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getConversations,
    markAsRead,
    getUnreadCount,
    getUserDetails,
    getRelatedUsers
}; 