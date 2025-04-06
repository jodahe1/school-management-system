// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Teacher Profile
router.get('/profile', teacherController.getTeacherProfile);

// Schedules
router.get('/schedules', teacherController.getSchedules);

// Attendance
router.get('/attendance', teacherController.getAttendanceRecords);
router.post('/attendance', teacherController.recordAttendance);

// Grades
router.get('/grades', teacherController.getGrades);
router.post('/grades', teacherController.assignGrade);

// Materials
router.get('/materials', teacherController.getMaterials);
router.post('/materials', teacherController.uploadMaterial);

// Assignments
router.get('/assignments', teacherController.getAssignments);
router.post('/assignments', teacherController.createAssignment);

// Submissions
router.get('/submissions', teacherController.getSubmissions);
router.put('/submissions/:submissionId', teacherController.gradeSubmission);

// Chat
router.get('/chats', teacherController.getChatMessages);
router.post('/chats', teacherController.sendChatMessage);

module.exports = router;