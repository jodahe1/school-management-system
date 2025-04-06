// backend/routes/studentRoutes.js
const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

// Login Student
router.post('/login', studentController.loginStudent);

// Fetch Student Personal Info
router.get('/:studentId/info', studentController.getStudentInfo);

// Fetch Student Grades
router.get('/:studentId/grades', studentController.getStudentGrades);

// Fetch Student Attendance
router.get('/:studentId/attendance', studentController.getStudentAttendance);

// Fetch Materials for Student's Class
router.get('/:studentId/materials', studentController.getMaterials);

// Fetch Assignments for Student's Class
router.get('/:studentId/assignments', studentController.getAssignments);

// Submit Assignment
router.post('/:studentId/assignments/submit', studentController.submitAssignment);

// Fetch Chat Messages (Paginated)
router.get('/:studentId/chat-messages', studentController.getChatMessages);

module.exports = router;