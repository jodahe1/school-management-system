// backend/routes/adminRoutes.js
const express = require('express');
const {
    addAdmin,
    getAnalytics,
    loginAdmin,
    addStudent,
    addTeacher,
    addParent,
    fetchClasses,
    fetchStudentsByClass,
    fetchStudentDetails,
    editStudent,
    editParent,
} = require('../controllers/adminController');

const router = express.Router();

// Add Admin Route
router.post('/add', addAdmin);

// Fetch Analytics Route
router.get('/analytics', getAnalytics);

// Admin Login Route
router.post('/login', loginAdmin);

// Add Student Route
router.post('/add-student', addStudent);

// Add Teacher Route
router.post('/add-teacher', addTeacher);

// Add Parent Route
router.post('/add-parent', addParent);

// Fetch All Classes Route
router.get('/classes', fetchClasses);

// Fetch Students in a Specific Class Route
router.get('/classes/:classId/students', fetchStudentsByClass);

// Fetch Student and Parent Details Route
router.get('/students/:studentId/details', fetchStudentDetails);

// Update Student Information Route
router.put('/students/:studentId/update', editStudent);

// Update Parent Information Route
router.put('/parents/:parentId/update', editParent);

module.exports = router;