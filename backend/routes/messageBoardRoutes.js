const express = require('express');
const router = express.Router();
const MessageBoardController = require('../controllers/messageBoardController');

router.post('/post', MessageBoardController.postMessage);
router.get('/messages', MessageBoardController.getMessages);
router.get('/classes', MessageBoardController.getClassesForTeacher);
router.get('/students', MessageBoardController.getStudentsInClass);
router.get('/teachers', MessageBoardController.getTeachersForStudent);
router.get('/teachers-for-parent', MessageBoardController.getTeachersForParent);

module.exports = router;