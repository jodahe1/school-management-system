// backend/routes/adminRoutes.js
const express = require('express');
const { addAdmin, getAnalytics, loginAdmin, addStudent, addTeacher, addParent } = require('../controllers/adminController');

const router = express.Router();

router.post('/add', addAdmin); // Add Admin Route
router.get('/analytics', getAnalytics); // Fetch Analytics Route
router.post('/login', loginAdmin); // Admin Login Route
router.post('/add-student', addStudent); // Add Student Route
router.post('/add-teacher', addTeacher); // Add Teacher Route
router.post('/add-parent', addParent); // Add Parent Route

module.exports = router;