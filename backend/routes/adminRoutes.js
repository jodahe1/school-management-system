// backend/routes/adminRoutes.js
const express = require('express');
const {
    addAdmin,
    loginAdmin,
    getAnalytics,
    addStudent,
    addTeacher,
    addParent,
    fetchClasses,
    fetchStudentsByClass,
    fetchStudentDetails,
    editStudent,
    editParent,
    removeStudent,
    removeTeacher,
    removeParent,
    editTeacher,
    fetchTeachers, // Ensure this function is imported
} = require('../controllers/adminController');

const router = express.Router();

// Add Admin Route
router.post('/add', addAdmin);

// Admin Login Route
router.post('/login', loginAdmin);

// Fetch Analytics Route
router.get('/analytics', getAnalytics);

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

// Delete Student Route
router.delete('/students/:studentId/delete', removeStudent);

// Delete Teacher Route
router.delete('/teachers/:teacherId/delete', removeTeacher);

// Delete Parent Route
router.delete('/parents/:parentId/delete', removeParent);

// Update Teacher Information Route
router.put('/teachers/:teacherId/update', editTeacher);

// Fetch All Teachers Route
router.get('/teachers', fetchTeachers); // Add this line

module.exports = router;