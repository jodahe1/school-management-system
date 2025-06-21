const teacherModel = require('../models/teacherModel');
const pool = require('../config/db');

// Teacher Login
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
            return res.status(200).json({ message: 'No schedules found', schedule: [] });
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
        
        // Validate teacher access
        const isValid = await teacherModel.validateTeacherClassSubject(teacher_id, class_id, subject_id);
        if (!isValid) {
            return res.status(403).json({ message: 'Unauthorized for this class/subject' });
        }

        const result = await teacherModel.recordAttendance(teacher_id, class_id, subject_id, semester_id, date, period_number, attendance);
        res.status(201).json({ message: 'Attendance recorded', attendance: result });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Assign Grades (Updated with validation)
const assignGrades = async (req, res) => {
    try {
        const { teacher_id, student_id, subject_id, semester_id, grade, comments } = req.body;
        
        const isValid = await teacherModel.validateTeacherAccess(teacher_id, student_id, subject_id);
        if (!isValid) {
            return res.status(403).json({ message: 'Unauthorized to grade this student' });
        }

        const newGrade = await teacherModel.assignGrade(teacher_id, student_id, subject_id, semester_id, grade, comments);
        res.status(201).json({ message: 'Grade assigned', grade: newGrade });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Upload Materials (Updated with validation)
const uploadMaterials = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, semester_id, title } = req.body;
        const file_path = req.file?.path;
        
        const isValid = await teacherModel.validateTeacherClassSubject(teacher_id, class_id, subject_id);
        if (!isValid) {
            return res.status(403).json({ message: 'Unauthorized for this class/subject' });
        }

        const material = await teacherModel.uploadMaterial(teacher_id, class_id, subject_id, semester_id, title, file_path);
        res.status(201).json({ message: 'Material uploaded', material });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Create Assignment (Updated with validation)
const createAssignment = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, semester_id, title, description, due_date } = req.body;
        const file_path = req.file?.path;
        
        const isValid = await teacherModel.validateTeacherClassSubject(teacher_id, class_id, subject_id);
        if (!isValid) {
            return res.status(403).json({ message: 'Unauthorized for this class/subject' });
        }

        const assignment = await teacherModel.createAssignment(teacher_id, class_id, subject_id, semester_id, title, description, due_date, file_path);
        res.status(201).json({ message: 'Assignment created', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// View Submissions (Updated with validation)
const getSubmissions = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id } = req.query;
        
        if (!teacher_id) {
            return res.status(400).json({ message: 'Teacher ID required' });
        }

        const submissions = await teacherModel.getTeacherSubmissions(teacher_id, class_id, subject_id);
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

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

const getStudentsForContext = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, semester_id } = req.query;
        const students = await teacherModel.getStudentsForContext(teacher_id, class_id, subject_id, semester_id);
        
        if (!students) {
            return res.status(403).json({ message: 'Unauthorized or invalid context' });
        }

        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Create Announcement
const createAnnouncement = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, semester_id, title, content, is_important } = req.body;
        const file_path = req.file?.path;

        // Validate teacher access
        const isValid = await teacherModel.validateTeacherClassSubject(teacher_id, class_id, subject_id);
        if (!isValid) {
            return res.status(403).json({ message: 'Unauthorized for this class/subject' });
        }

        // Create announcement
        const result = await teacherModel.createAnnouncement(
            teacher_id,
            class_id,
            subject_id,
            semester_id,
            title,
            content,
            file_path,
            is_important || false
        );

        res.status(201).json({
            message: 'Announcement created successfully',
            announcement_id: result.announcement_id,
            students_notified: result.students_notified
        });
    } catch (error) {
        console.error('Announcement creation failed:', error);
        res.status(500).json({ 
            message: 'Failed to create announcement',
            error: error.message 
        });
    }
};

// Get Class Announcements
const getClassAnnouncements = async (req, res) => {
    try {
        const { class_id, semester_id } = req.query;
        
        if (!class_id) {
            return res.status(400).json({ message: 'Class ID required' });
        }

        const announcements = await teacherModel.getClassAnnouncements(class_id, semester_id);
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ 
            message: 'Database error', 
            error: error.message 
        });
    }
};

// Get first-time login info
const getFirstTimeInfo = async (req, res) => {
    try {
        const { user_id } = req.query;
        const info = await teacherModel.getFirstTimeInfo(user_id);
        if (!info) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Complete profile setup
const completeSetup = async (req, res) => {
    try {
        const { user_id, currentPassword, newPassword, firstName, lastName, email } = req.body;
        
        // Validate current password by checking against the user's current password
        const validatePasswordQuery = `
            SELECT password_hash FROM users WHERE user_id = $1 AND role = 'teacher';
        `;
        const passwordResult = await pool.query(validatePasswordQuery, [user_id]);
        
        if (passwordResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (passwordResult.rows[0].password_hash !== currentPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        // Update user information
        const updatedUser = await teacherModel.completeSetup(user_id, {
            newPassword,
            firstName,
            lastName,
            email
        });
        
        res.status(200).json({ 
            message: 'Profile setup completed successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Complete setup error:', error);
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
    getTeacherClasses,
    getClassStudents,
    getStudentDetails,
    getStudentsForContext,
    createAnnouncement,
    getClassAnnouncements,
    getFirstTimeInfo,
    completeSetup
};