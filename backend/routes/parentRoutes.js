// routes/parentRoutes.js

const express = require('express');
const router = express.Router();
const ParentController = require('../controllers/parentController');

// Parent Login
router.post('/login', ParentController.login);

// First-time login routes
router.get('/first-time-info', ParentController.getFirstTimeInfo);
router.post('/complete-setup', ParentController.completeSetup);

// Profile management routes
router.get('/profile', ParentController.getProfile);
router.post('/update-profile', ParentController.updateProfile);

// View Children's Profiles
router.get('/children', ParentController.getChildrenProfiles);

// View Children's Grades
router.get('/grades', ParentController.getChildrenGrades);

// View Children's Attendance
router.get('/attendance', ParentController.getChildrenAttendance);

// View Materials for Children's Classes
router.get('/materials', ParentController.getChildrenMaterials);

// View Children's Assignments
router.get('/assignments', ParentController.getChildrenAssignments);

// View Children's Submissions
router.get('/submissions', ParentController.getChildrenSubmissions);

module.exports = router;