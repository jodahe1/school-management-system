// backend/controllers/studentController.js
const studentModel = require('../models/studentModel');
const pool = require('../config/db'); // Import the pool object

// Login Student
const loginStudent = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        console.log('Login attempt:', { username, password: '***' });
        
        const student = await studentModel.loginStudent(username, password);
        
        if (!student) {
            console.log('Login failed: No student found with these credentials');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        console.log('Login successful for student:', student.username);
        res.status(200).json({ message: 'Login successful', student });
    } catch (error) {
        console.error('Login error:', error);
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

// Fetch Not Submitted Assignments
const getNotSubmittedAssignments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const assignments = await studentModel.getNotSubmittedAssignments(studentId);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Submitted Assignments
const getSubmittedAssignments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const assignments = await studentModel.getSubmittedAssignments(studentId);
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

// Get first-time login info
const getFirstTimeInfo = async (req, res) => {
    try {
        const { user_id } = req.query;
        const info = await studentModel.getFirstTimeInfo(user_id);
        if (!info) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Complete profile setup
const completeSetup = async (req, res) => {
    try {
        const { user_id, currentPassword, newPassword, firstName, lastName, email, dateOfBirth } = req.body;
        
        // Validate current password by checking against the user's current password
        const validatePasswordQuery = `
            SELECT password_hash FROM users WHERE user_id = $1 AND role = 'student';
        `;
        const passwordResult = await pool.query(validatePasswordQuery, [user_id]);
        
        if (passwordResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (passwordResult.rows[0].password_hash !== currentPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        // Update user information
        const updatedUser = await studentModel.completeSetup(user_id, {
            newPassword,
            firstName,
            lastName,
            email,
            dateOfBirth
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

// Get profile information
const getProfile = async (req, res) => {
    try {
        const { user_id } = req.query;
        const profile = await studentModel.getProfile(user_id);
        if (!profile) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const { user_id, currentPassword, newPassword, firstName, lastName, email, dateOfBirth } = req.body;
        
        // If password change is requested, validate current password
        if (currentPassword && newPassword) {
            const validatePasswordQuery = `
                SELECT password_hash FROM users WHERE user_id = $1 AND role = 'student';
            `;
            const passwordResult = await pool.query(validatePasswordQuery, [user_id]);
            
            if (passwordResult.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            if (passwordResult.rows[0].password_hash !== currentPassword) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
        }
        
        // Update user information
        const updatedUser = await studentModel.updateProfile(user_id, {
            newPassword,
            firstName,
            lastName,
            email,
            dateOfBirth
        });
        
        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get all teachers for a student
const getStudentTeachers = async (req, res) => {
    try {
        const { studentId } = req.params;
        const teachers = await studentModel.getStudentTeachers(studentId);
        res.status(200).json(teachers);
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
    getNotSubmittedAssignments,
    getSubmittedAssignments,
    submitAssignment,
    getChatMessages,
    getStudentAnnouncements,
    getUnreadAnnouncementsCount,
    markAnnouncementAsRead,
    getFirstTimeInfo,
    completeSetup,
    getProfile,
    updateProfile,
    getStudentTeachers
};