// Updated Code: Message Board Routes
const express = require('express');
const messageBoardController = require('../controllers/messageBoardController');

const router = express.Router();

// Post a Message
router.post('/post', messageBoardController.postMessage);

// View Messages
router.get('/messages', messageBoardController.getMessages);

module.exports = router;