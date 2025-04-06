// controllers/teacherController.js
const teacherModel = require('../models/teacherModel');

// Login Teacher
const loginTeacher = async (req, res) => {
    try {
        const { username, password } = req.body;
        const teacher = await teacherModel.verifyTeacher(username, password);
        if (!teacher) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json({ message: 'Login successful', teacher });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get Teacher Profile
const getProfile = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const profile = await teacherModel.getTeacherProfile(teacherId);
        if (!profile) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get Schedules for Teacher
const getSchedules = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const schedules = await teacherModel.getSchedulesByTeacher(teacherId);
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Record Attendance
const recordAttendance = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { attendanceRecords } = req.body;
        await teacherModel.recordAttendance(teacherId, attendanceRecords);
        res.status(201).json({ message: 'Attendance recorded successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Assign Grades
const assignGrades = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { studentId, subjectId, semesterId, grade, comments } = req.body;
        const newGrade = await teacherModel.assignGrade(teacherId, studentId, subjectId, semesterId, grade, comments);
        res.status(201).json({ message: 'Grade assigned successfully', grade: newGrade });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Upload Materials
const uploadMaterials = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { classId, subjectId, semesterId, title, filePath } = req.body;
        const material = await teacherModel.uploadMaterial(teacherId, classId, subjectId, semesterId, title, filePath);
        res.status(201).json({ message: 'Material uploaded successfully', material });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Create Assignment
const createAssignment = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { classId, subjectId, semesterId, title, description, dueDate, filePath } = req.body;
        const assignment = await teacherModel.createAssignment(
            teacherId,
            classId,
            subjectId,
            semesterId,
            title,
            description,
            dueDate,
            filePath
        );
        res.status(201).json({ message: 'Assignment created successfully', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Grade Submission
const gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback } = req.body;
        const updatedSubmission = await teacherModel.gradeSubmission(submissionId, grade, feedback);
        res.status(200).json({ message: 'Submission graded successfully', submission: updatedSubmission });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Send Chat Message
const sendChatMessage = async (req, res) => {
    try {
        const { senderId, receiverId, studentId, messageText } = req.body;
        const chatMessage = await teacherModel.sendChatMessage(senderId, receiverId, studentId, messageText);
        res.status(201).json({ message: 'Message sent successfully', chatMessage });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

module.exports = {
    loginTeacher,
    getProfile,
    getSchedules,
    recordAttendance,
    assignGrades,
    uploadMaterials,
    createAssignment,
    gradeSubmission,
    sendChatMessage,
};