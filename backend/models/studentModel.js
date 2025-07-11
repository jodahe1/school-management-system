// backend/models/studentModel.js
const pool = require('../config/db');

// Login Student
const loginStudent = async (username, password) => {
    try {
        const query = `
            SELECT u.user_id, u.username, u.email, u.role, u.password_reset_required, s.student_id, s.first_name, s.last_name
            FROM users u
            JOIN students s ON u.user_id = s.student_id
            WHERE u.username = $1 AND u.password_hash = $2 AND u.role = 'student';
        `;
        const result = await pool.query(query, [username, password]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Fetch Student Personal Info
const getStudentInfo = async (studentId) => {
    try {
        const query = `
            SELECT u.username, u.email, s.first_name, s.last_name, s.date_of_birth, c.class_name
            FROM students s
            JOIN users u ON s.student_id = u.user_id
            JOIN classes c ON s.class_id = c.class_id
            WHERE s.student_id = $1;
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Fetch Student Grades
const getStudentGrades = async (studentId) => {
    try {
        const query = `
            SELECT g.grade_id, sb.subject_name, g.grade, g.comments, sm.semester_name
            FROM grades g
            JOIN subjects sb ON g.subject_id = sb.subject_id
            JOIN semesters sm ON g.semester_id = sm.semester_id
            WHERE g.student_id = $1;
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Fetch Student Attendance
const getStudentAttendance = async (studentId) => {
    try {
        const query = `
            SELECT a.attendance_id, sb.subject_name, a.date, a.period_number, a.status, sm.semester_name
            FROM attendance a
            JOIN subjects sb ON a.subject_id = sb.subject_id
            JOIN semesters sm ON a.semester_id = sm.semester_id
            WHERE a.student_id = $1;
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Fetch Materials for Student's Class
const getMaterials = async (studentId) => {
    try {
        const query = `
            SELECT m.material_id, sb.subject_name, m.title, m.file_path, m.uploaded_at
            FROM materials m
            JOIN subjects sb ON m.subject_id = sb.subject_id
            JOIN students s ON m.class_id = s.class_id
            WHERE s.student_id = $1;
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Fetch Assignments for Student's Class
const getAssignments = async (studentId) => {
    try {
        const query = `
            SELECT a.assignment_id, sb.subject_name, a.title, a.description, a.due_date, a.file_path
            FROM assignments a
            JOIN subjects sb ON a.subject_id = sb.subject_id
            JOIN students s ON a.class_id = s.class_id
            WHERE s.student_id = $1;
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Fetch Not Submitted Assignments for Student's Class
const getNotSubmittedAssignments = async (studentId) => {
    try {
        const query = `
            SELECT a.assignment_id, sb.subject_name, a.title, a.description, a.due_date, a.file_path
            FROM assignments a
            JOIN subjects sb ON a.subject_id = sb.subject_id
            JOIN students s ON a.class_id = s.class_id
            WHERE s.student_id = $1
            AND a.assignment_id NOT IN (
                SELECT assignment_id 
                FROM submissions 
                WHERE student_id = $1
            );
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Fetch Submitted Assignments for Student's Class
const getSubmittedAssignments = async (studentId) => {
    try {
        const query = `
            SELECT 
                a.assignment_id, 
                sb.subject_name, 
                a.title, 
                a.description, 
                a.due_date, 
                a.file_path,
                s.submitted_file_path,
                s.submission_date,
                s.grade,
                s.feedback
            FROM assignments a
            JOIN subjects sb ON a.subject_id = sb.subject_id
            JOIN students st ON a.class_id = st.class_id
            JOIN submissions s ON a.assignment_id = s.assignment_id AND st.student_id = s.student_id
            WHERE st.student_id = $1
            ORDER BY s.submission_date DESC;
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Submit Assignment
const submitAssignment = async (studentId, assignmentId, submittedFilePath) => {
    try {
        const query = `
            INSERT INTO submissions (student_id, assignment_id, submitted_file_path)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await pool.query(query, [studentId, assignmentId, submittedFilePath]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Fetch Chat Messages (Paginated)
const getChatMessages = async (studentId, limit = 50, offset = 0) => {
    try {
        const query = `
            SELECT cm.message_id, u.username AS sender, cm.message_text, cm.sent_at, cm.is_read
            FROM chat_messages cm
            JOIN users u ON cm.sender_id = u.user_id
            WHERE cm.student_id = $1
            ORDER BY cm.sent_at DESC
            LIMIT $2 OFFSET $3;
        `;
        const result = await pool.query(query, [studentId, limit, offset]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};
// Get all announcements for a student
const getStudentAnnouncements = async (studentId) => {
    try {
        const query = `
            SELECT 
                a.announcement_id,
                a.title,
                a.content,
                a.file_path,
                a.created_at,
                a.is_important,
                a.class_id,
                a.subject_id,
                a.semester_id,
                t.first_name || ' ' || t.last_name AS teacher_name,
                s.subject_name,
                c.class_name,
                sa.is_read
            FROM student_announcements sa
            JOIN announcements a ON sa.announcement_id = a.announcement_id
            JOIN teachers t ON a.teacher_id = t.teacher_id
            LEFT JOIN subjects s ON a.subject_id = s.subject_id
            LEFT JOIN classes c ON a.class_id = c.class_id
            WHERE sa.student_id = $1
            ORDER BY a.created_at DESC;
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Get unread announcements count
const getUnreadAnnouncementsCount = async (studentId) => {
    try {
        const query = `
            SELECT COUNT(*) 
            FROM student_announcements 
            WHERE student_id = $1 AND is_read = FALSE;
        `;
        const result = await pool.query(query, [studentId]);
        return parseInt(result.rows[0].count);
    } catch (error) {
        throw error;
    }
};


// Mark announcement as read
const markAnnouncementAsRead = async (studentId, announcementId) => {
    try {
        const query = `
            UPDATE student_announcements
            SET is_read = TRUE,
                read_at = NOW()
            WHERE student_id = $1 AND announcement_id = $2
            RETURNING *;
        `;
        const result = await pool.query(query, [studentId, announcementId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Get first-time login information
const getFirstTimeInfo = async (userId) => {
    try {
        const query = `
            SELECT 
                u.user_id, u.username, u.email, u.role, u.created_at, u.password_reset_required,
                s.student_id, s.first_name, s.last_name, s.date_of_birth, c.class_name
            FROM users u
            JOIN students s ON u.user_id = s.student_id
            JOIN classes c ON s.class_id = c.class_id
            WHERE u.user_id = $1 AND u.role = 'student';
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Complete profile setup
const completeSetup = async (userId, updateData) => {
    try {
        // Start a transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Update users table
            const updateUserQuery = `
                UPDATE users 
                SET password_hash = $1, email = $2, password_reset_required = FALSE
                WHERE user_id = $3
                RETURNING user_id, username, email, role;
            `;
            const userResult = await client.query(updateUserQuery, [
                updateData.newPassword, 
                updateData.email, 
                userId
            ]);
            
            // Update students table
            const updateStudentQuery = `
                UPDATE students 
                SET first_name = $1, last_name = $2, date_of_birth = $3
                WHERE student_id = $4
                RETURNING student_id, first_name, last_name, date_of_birth;
            `;
            const studentResult = await client.query(updateStudentQuery, [
                updateData.firstName,
                updateData.lastName,
                updateData.dateOfBirth,
                userId
            ]);
            
            await client.query('COMMIT');
            
            // Return combined user data
            return {
                ...userResult.rows[0],
                ...studentResult.rows[0]
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        throw error;
    }
};

// Get profile information
const getProfile = async (userId) => {
    try {
        const query = `
            SELECT 
                u.user_id, u.username, u.email, u.role,
                s.student_id, s.first_name, s.last_name, s.date_of_birth, c.class_name
            FROM users u
            JOIN students s ON u.user_id = s.student_id
            JOIN classes c ON s.class_id = c.class_id
            WHERE u.user_id = $1 AND u.role = 'student';
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Update profile
const updateProfile = async (userId, updateData) => {
    try {
        // Start a transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Update users table
            let updateUserQuery = `
                UPDATE users 
                SET email = $1
            `;
            let userParams = [updateData.email];
            let paramIndex = 2;
            
            // Add password update if provided
            if (updateData.newPassword) {
                updateUserQuery += `, password_hash = $${paramIndex}`;
                userParams.push(updateData.newPassword);
                paramIndex++;
            }
            
            updateUserQuery += ` WHERE user_id = $${paramIndex} RETURNING user_id, username, email, role;`;
            userParams.push(userId);
            
            const userResult = await client.query(updateUserQuery, userParams);
            
            // Update students table
            const updateStudentQuery = `
                UPDATE students 
                SET first_name = $1, last_name = $2, date_of_birth = $3
                WHERE student_id = $4
                RETURNING student_id, first_name, last_name, date_of_birth;
            `;
            const studentResult = await client.query(updateStudentQuery, [
                updateData.firstName,
                updateData.lastName,
                updateData.dateOfBirth,
                userId
            ]);
            
            await client.query('COMMIT');
            
            // Return combined user data
            return {
                ...userResult.rows[0],
                ...studentResult.rows[0]
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        throw error;
    }
};

// Get all teachers for a student
const getStudentTeachers = async (studentId) => {
    try {
        const query = `
            SELECT users.user_id, users.username, users.email, subjects.subject_name
            FROM class_teacher_subject
            JOIN subjects ON subjects.subject_id = class_teacher_subject.subject_id
            JOIN students ON students.class_id = class_teacher_subject.class_id
            JOIN users ON users.user_id = class_teacher_subject.teacher_id
            WHERE students.student_id = $1;
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows;
    } catch (error) {
        throw error;
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