const studentModel = require('../models/studentModel');

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
        const { studentId, assignmentId, submittedFilePath } = req.body;
        const submission = await studentModel.submitAssignment(studentId, assignmentId, submittedFilePath);
        res.status(201).json(submission);
    } catch (error) {
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

module.exports = {
    loginStudent,
    getStudentInfo,
    getStudentGrades,
    getStudentAttendance,
    getMaterials,
    getAssignments,
    submitAssignment,
    getChatMessages,
};