// backend/controllers/teacherController.js
const teacherModel = require('../models/teacherModel');

// Teacher Login
const loginTeacher = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Verify credentials and fetch teacher details
        const teacher = await teacherModel.verifyTeacher(username, password);

        if (!teacher) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful', teacher });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// View Profile
const getProfile = async (req, res) => {
    try {
        const { teacher_id } = req.query;
        const profile = await teacherModel.getTeacherProfile(teacher_id);
        if (!profile) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// View Schedule
const getSchedule = async (req, res) => {
    try {
        const { teacher_id } = req.query;
        const schedule = await teacherModel.getTeacherSchedule(teacher_id);
        if (schedule.length === 0) {
            return res.status(200).json({ message: 'No schedules found for this teacher', schedule: [] });
        }
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Record Attendance
const recordAttendance = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, semester_id, date, period_number, attendance } = req.body;
        const result = await teacherModel.recordAttendance(teacher_id, class_id, subject_id, semester_id, date, period_number, attendance);
        res.status(201).json({ message: 'Attendance recorded successfully', attendance: result });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Assign Grades
const assignGrades = async (req, res) => {
    try {
        const { teacher_id, student_id, subject_id, semester_id, grade, comments } = req.body;
        const newGrade = await teacherModel.assignGrade(teacher_id, student_id, subject_id, semester_id, grade, comments);
        res.status(201).json({ message: 'Grade assigned successfully', grade: newGrade });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Upload Materials
const uploadMaterials = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, semester_id, title, file_path } = req.body;
        const material = await teacherModel.uploadMaterial(teacher_id, class_id, subject_id, semester_id, title, file_path);
        res.status(201).json({ message: 'Material uploaded successfully', material });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Create Assignment
const createAssignment = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, semester_id, title, description, due_date, file_path } = req.body;
        const assignment = await teacherModel.createAssignment(teacher_id, class_id, subject_id, semester_id, title, description, due_date, file_path);
        res.status(201).json({ message: 'Assignment created successfully', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// View Submissions
const getSubmissions = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id } = req.query;
        const submissions = await teacherModel.getTeacherSubmissions(teacher_id, class_id, subject_id);
        if (submissions.length === 0) {
            return res.status(200).json({ message: 'No submissions found for this teacher', submissions: [] });
        }
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// NEW CONTROLLER METHODS

// Get Classes for Teacher
const getTeacherClasses = async (req, res) => {
    try {
        const { teacher_id } = req.query;
        const classes = await teacherModel.getTeacherClasses(teacher_id);
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get Students in Class
const getClassStudents = async (req, res) => {
    try {
        const { class_id } = req.query;
        const students = await teacherModel.getClassStudents(class_id);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get Student Details
const getStudentDetails = async (req, res) => {
    try {
        const { student_id } = req.query;
        const student = await teacherModel.getStudentDetails(student_id);
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

module.exports = {
    loginTeacher,
    getProfile,
    getSchedule,
    recordAttendance,
    assignGrades,
    uploadMaterials,
    createAssignment,
    getSubmissions,
    // New exports
    getTeacherClasses,
    getClassStudents,
    getStudentDetails
};