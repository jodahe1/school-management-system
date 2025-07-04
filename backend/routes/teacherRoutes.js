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
router.post('/update-profile', teacherController.updateProfile);

// Schedule Viewing
router.get('/schedule', teacherController.getSchedule);

// Class Management
router.get('/classes', teacherController.getTeacherClasses);
router.get('/students', teacherController.getClassStudents);
router.get('/student', teacherController.getStudentDetails);
router.get('/student-parent-details', teacherController.getStudentAndParentDetails);

// Attendance
router.post('/attendance', teacherController.recordAttendance);

// Grading
router.post('/grades', teacherController.assignGrades);
router.get('/student-grades', teacherController.getStudentGrades);

// Materials
router.post('/materials', teacherController.uploadMaterials);
router.get('/materials', teacherController.getTeacherMaterials);

// Assignments
router.post('/assignments', teacherController.createAssignment);
router.get('/assignments', teacherController.getTeacherAssignments);
router.get('/submissions', teacherController.getSubmissions);
router.get('/students-by-context', teacherController.getStudentsForContext);

// Announcements
router.post('/announcements', teacherController.createAnnouncement);
router.get('/announcements', teacherController.getClassAnnouncements);

// Submissions Overview (Coming Soon)
router.get('/submissions-overview', teacherController.submissionsOverviewComingSoon);

module.exports = router;