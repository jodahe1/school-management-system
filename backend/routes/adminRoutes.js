// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
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
    fetchTeachers,
    fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    fetchSchedulesForClass, // New function for fetching schedules by class
} = require('../controllers/adminController');

// Add Admin
router.post('/admins', addAdmin);

// Login Admin
router.post('/admins/login', loginAdmin);

// Fetch Analytics
router.get('/analytics', getAnalytics);

// Add Student
router.post('/students', addStudent);

// Add Teacher
router.post('/teachers', addTeacher);

// Add Parent
router.post('/parents', addParent);

// Fetch All Classes
router.get('/classes', fetchClasses);

// Fetch Students in a Specific Class
router.get('/classes/:classId/students', fetchStudentsByClass);

// Fetch Student Details
router.get('/students/:studentId/details', fetchStudentDetails);

// Edit Student
router.put('/students/:studentId/update', editStudent);

// Edit Parent
router.put('/parents/:parentId/update', editParent);

// Delete Student
router.delete('/students/:studentId/delete', removeStudent);

// Delete Teacher
router.delete('/teachers/:teacherId/delete', removeTeacher);

// Delete Parent
router.delete('/parents/:parentId/delete', removeParent);

// Edit Teacher
router.put('/teachers/:teacherId/update', editTeacher);

// Fetch All Teachers
router.get('/teachers', fetchTeachers);

// Fetch All Schedules
router.get('/schedules', fetchSchedules);

// Add Schedule
router.post('/schedules/add', addSchedule);

// Update Schedule
router.put('/schedules/:scheduleId/update', updateSchedule);

// Delete Schedule
router.delete('/schedules/:scheduleId/delete', deleteSchedule);

// Fetch Schedules for a Specific Class (New Route)
router.get('/schedules/class/:classId', fetchSchedulesForClass);

module.exports = router;