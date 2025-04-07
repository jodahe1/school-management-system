// backend/routes/teacherRoutes.js
const express = require('express');
const teacherController = require('../controllers/teacherController');

const router = express.Router();

// Teacher Login
router.post('/login', teacherController.loginTeacher);

// View Profile
router.get('/profile', teacherController.getProfile);

// View Schedule
router.get('/schedule', teacherController.getSchedule);

// Record Attendance
router.post('/attendance', teacherController.recordAttendance);

// Assign Grades
router.post('/grades', teacherController.assignGrades);

// Upload Materials
router.post('/materials', teacherController.uploadMaterials);

// Create Assignment
router.post('/assignments', teacherController.createAssignment);

// View Submissions
router.get('/submissions', teacherController.getSubmissions);

// NEW ROUTES

// Get Classes for Teacher
router.get('/classes', teacherController.getTeacherClasses);

// Get Students in Class
router.get('/students', teacherController.getClassStudents);

// Get Student Details
router.get('/student', teacherController.getStudentDetails);

module.exports = router;