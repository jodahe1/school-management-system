const express = require('express');
const router = express.Router();
const messageBoardController = require('../controllers/messageBoardController');

// Post a message
router.post('/post', messageBoardController.postMessage);

// Get messages
router.get('/messages', messageBoardController.getMessages);

// Get classes for a teacher
router.get('/classes', messageBoardController.getClassesForTeacher);

// Get students in a class
router.get('/students', messageBoardController.getStudentsInClass);

// Get teachers for a student
router.get('/teachers', messageBoardController.getTeachersForStudent);

module.exports = router;