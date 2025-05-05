// backend/controllers/studentController.js
const studentModel = require('../models/studentModel');
const pool = require('../config/db'); // Import the pool object

// Login Student
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await studentModel.loginStudent(email, password);
        if (!student) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json({ message: 'Login successful', student });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Student Personal Info
const getStudentInfo = async (req, res) => {
    try {
        const { studentId } = req.params;
        const info = await studentModel.getStudentInfo(studentId);
        if (!info) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Student Grades
const getStudentGrades = async (req, res) => {
    try {
        const { studentId } = req.params;
        const grades = await studentModel.getStudentGrades(studentId);
        res.status(200).json(grades);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Student Attendance
const getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const attendance = await studentModel.getStudentAttendance(studentId);
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Materials
const getMaterials = async (req, res) => {
    try {
        const { studentId } = req.params;
        const materials = await studentModel.getMaterials(studentId);
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Assignments
const getAssignments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const assignments = await studentModel.getAssignments(studentId);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Submit Assignment
const submitAssignment = async (req, res) => {
    try {
        const { studentId } = req.params; // Extract studentId from URL params
        const { assignmentId, submittedFilePath } = req.body;

        // Validate required fields
        if (!studentId || !assignmentId || !submittedFilePath) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the assignment exists
        const assignmentQuery = `
            SELECT * FROM assignments
            WHERE assignment_id = $1;
        `;
        const assignmentResult = await pool.query(assignmentQuery, [assignmentId]);
        if (assignmentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Insert the submission using the model function
        const submission = await studentModel.submitAssignment(studentId, assignmentId, submittedFilePath);

        // Return the newly created submission
        res.status(201).json({
            message: 'Assignment submitted successfully',
            submission,
        });
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Chat Messages (Paginated)
const getChatMessages = async (req, res) => {
    try {
        const { studentId } = req.params;
        const limit = parseInt(req.query.limit) || 50; // Default to 50 messages
        const offset = parseInt(req.query.offset) || 0; // Default to 0
        const messages = await studentModel.getChatMessages(studentId, limit, offset);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};
// Get all announcements for student
const getStudentAnnouncements = async (req, res) => {
    try {
        const { studentId } = req.params;
        const announcements = await studentModel.getStudentAnnouncements(studentId);
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};
// Get unread announcements count
const getUnreadAnnouncementsCount = async (req, res) => {
    try {
        const { studentId } = req.params;
        const count = await studentModel.getUnreadAnnouncementsCount(studentId);
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Mark announcement as read
const markAnnouncementAsRead = async (req, res) => {
    try {
        const { studentId, announcementId } = req.params;
        const result = await studentModel.markAnnouncementAsRead(studentId, announcementId);
        if (!result) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        res.status(200).json({ message: 'Announcement marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};
module.exports = {
    loginStudent,
    getStudentInfo,
    getStudentGrades,
    getStudentAttendance,
    getMaterials,
    getAssignments,
    submitAssignment,
    getChatMessages,
    getStudentAnnouncements,
    getUnreadAnnouncementsCount,
    markAnnouncementAsRead
};