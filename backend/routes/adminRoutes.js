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
    fetchSchedulesForClass,
    fetchAllTeachers,
    fetchAllSubjects,
    fetchAllSemesters,
    fetchScheduleById,
    manageSemesters,
    createSemester,
    editSemester,
    removeSemester,
    manageClasses,
    createClass,
    editClass,
    removeClass,
    getTeachersByClass,
    getSubjectsByClassAndTeacher,
    removeAdmin,
    fetchAllAdmins
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

// Fetch Schedules for a Specific Class
router.get('/schedules/class/:classId', fetchSchedulesForClass);

// Fetch Single Schedule by ID
router.get('/schedules/:scheduleId', fetchScheduleById);

// Fetch All Teachers (Dropdown Data)
router.get('/dropdown/teachers', fetchAllTeachers);

// Fetch All Subjects (Dropdown Data)
router.get('/dropdown/subjects', fetchAllSubjects);

// Fetch All Semesters (Dropdown Data)
router.get('/dropdown/semesters', fetchAllSemesters);

// Semester Management Routes
router.get('/semesters', manageSemesters);
router.post('/semesters', createSemester);
router.put('/semesters/:semesterId', editSemester);
router.delete('/semesters/:semesterId', removeSemester);

// Class Management Routes
router.get('/classes/manage', manageClasses);
router.post('/classes', createClass);
router.put('/classes/:classId', editClass);
router.delete('/classes/:classId', removeClass);

// New routes
router.get('/class/:classId/teachers', getTeachersByClass);
router.get('/class/:classId/teacher/:teacherId/subjects', getSubjectsByClassAndTeacher);

// Delete Admin
router.delete('/admins/:adminId/delete', removeAdmin);

// Fetch All Admins
router.get('/admins', fetchAllAdmins);

module.exports = router;