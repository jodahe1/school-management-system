// backend/routes/adminRoutes.js
const express = require('express');
const { addAdmin, getAnalytics, addStudent } = require('../controllers/adminController');

const router = express.Router();

router.post('/add', addAdmin); // Add Admin Route
router.get('/analytics', getAnalytics); // Fetch Analytics Route
router.post('/add-student', addStudent); // Add Student Route

module.exports = router;