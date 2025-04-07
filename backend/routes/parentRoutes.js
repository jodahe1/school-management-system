// routes/parentRoutes.js

const express = require('express');
const router = express.Router();
const ParentController = require('../controllers/parentController');

// Parent Login
router.post('/login', ParentController.login);

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