// backend/routes/studentRoutes.js
const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

// Login Student
router.post('/login', studentController.loginStudent);

// First-time login routes
router.get('/first-time-info', studentController.getFirstTimeInfo);
router.post('/complete-setup', studentController.completeSetup);

// Profile management routes
router.get('/profile', studentController.getProfile);
router.post('/update-profile', studentController.updateProfile);

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

// Fetch Not Submitted Assignments for Student's Class
router.get('/:studentId/assignments/not-submitted', studentController.getNotSubmittedAssignments);

// Fetch Submitted Assignments for Student's Class
router.get('/:studentId/assignments/submitted', studentController.getSubmittedAssignments);

// Submit Assignment
router.post('/:studentId/assignments/submit', studentController.submitAssignment);

// Fetch Chat Messages (Paginated)
router.get('/:studentId/chat-messages', studentController.getChatMessages);
// Student Announcements
router.get('/:studentId/announcements', studentController.getStudentAnnouncements);
router.get('/:studentId/announcements/unread-count', studentController.getUnreadAnnouncementsCount);
router.put('/:studentId/announcements/:announcementId/mark-read', studentController.markAnnouncementAsRead);
module.exports = router;