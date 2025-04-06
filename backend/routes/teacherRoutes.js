// routes/teacherRoutes.js
const express = require('express');
const teacherController = require('../controllers/teacherController');

const router = express.Router();

// Login
router.post('/login', teacherController.loginTeacher);

// Profile
router.get('/:teacherId/profile', teacherController.getProfile);

// Schedules
router.get('/:teacherId/schedules', teacherController.getSchedules);

// Attendance
router.post('/:teacherId/attendance', teacherController.recordAttendance);

// Grades
router.post('/:teacherId/grades', teacherController.assignGrades);

// Materials
router.post('/:teacherId/materials', teacherController.uploadMaterials);

// Assignments
router.post('/:teacherId/assignments', teacherController.createAssignment);

// Submissions
router.put('/submissions/:submissionId', teacherController.gradeSubmission);

// Chat Messages
router.post('/chats', teacherController.sendChatMessage);

module.exports = router;