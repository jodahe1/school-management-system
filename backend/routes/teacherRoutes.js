const express = require('express');
const teacherController = require('../controllers/teacherController');
const router = express.Router();

// Authentication
router.post('/login', teacherController.loginTeacher);

// First-time login routes
router.get('/first-time-info', teacherController.getFirstTimeInfo);
router.post('/complete-setup', teacherController.completeSetup);

// Profile Management
router.get('/profile', teacherController.getProfile);

// Schedule Viewing
router.get('/schedule', teacherController.getSchedule);

// Class Management
router.get('/classes', teacherController.getTeacherClasses);
router.get('/students', teacherController.getClassStudents);
router.get('/student', teacherController.getStudentDetails);

// Attendance
router.post('/attendance', teacherController.recordAttendance);

// Grading
router.post('/grades', teacherController.assignGrades);

// Materials
router.post('/materials', teacherController.uploadMaterials);

// Assignments
router.post('/assignments', teacherController.createAssignment);
router.get('/submissions', teacherController.getSubmissions);
router.get('/students-by-context', teacherController.getStudentsForContext);

// Announcements
router.post('/announcements', teacherController.createAnnouncement);
router.get('/announcements', teacherController.getClassAnnouncements);

module.exports = router;