const pool = require('../config/db');

// Get User Role with all necessary IDs
const getUserRole = async (user_id) => {
    const query = `
        SELECT 
            u.user_id, 
            u.role,
            CASE 
                WHEN u.role = 'teacher' THEN t.teacher_id
                WHEN u.role = 'parent' THEN p.parent_id
                ELSE NULL
            END AS role_id
        FROM users u
        LEFT JOIN teachers t ON u.user_id = t.teacher_id
        LEFT JOIN parents p ON u.user_id = p.parent_id
        WHERE u.user_id = $1;
    `;
    try {
        const result = await pool.query(query, [user_id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching user role:', error);
        throw error;
    }
};

// Get Student Details
const getStudent = async (student_id) => {
    const query = `
        SELECT student_id, parent_id, class_id
        FROM students
        WHERE student_id = $1;
    `;
    try {
        const result = await pool.query(query, [student_id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching student details:', error);
        throw error;
    }
};

// Validate Teacher for Student
const validateTeacherForStudent = async (student_id, teacher_id) => {
    const query = `
        SELECT 1
        FROM class_teacher_subject cts
        JOIN students s ON cts.class_id = s.class_id
        WHERE s.student_id = $1 AND cts.teacher_id = $2;
    `;
    try {
        const result = await pool.query(query, [student_id, teacher_id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error validating teacher for student:', error);
        throw error;
    }
};

// Validate Student for Teacher
const validateStudentForTeacher = async (student_id, teacher_id) => {
    const query = `
        SELECT 1
        FROM class_teacher_subject cts
        JOIN students s ON cts.class_id = s.class_id
        WHERE s.student_id = $1 AND cts.teacher_id = $2;
    `;
    try {
        const result = await pool.query(query, [student_id, teacher_id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error validating student for teacher:', error);
        throw error;
    }
};

// Post a Message
const postMessage = async (sender_id, student_id, recipient_role, message_text) => {
    const query = `
        INSERT INTO message_board (sender_id, student_id, recipient_role, message_text)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    try {
        const result = await pool.query(query, [sender_id, student_id, recipient_role, message_text]);
        return result.rows[0];
    } catch (error) {
        console.error('Error posting message:', error);
        throw error;
    }
};

// Get Parent Messages
const getParentMessages = async (parent_id) => {
    const query = `
        SELECT 
            mb.message_id, 
            u.username AS sender_name, 
            mb.student_id, 
            mb.recipient_role, 
            mb.message_text, 
            mb.posted_at
        FROM message_board mb
        JOIN users u ON mb.sender_id = u.user_id
        JOIN students s ON mb.student_id = s.student_id
        WHERE s.parent_id = $1
        ORDER BY mb.posted_at DESC;
    `;
    try {
        const result = await pool.query(query, [parent_id]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching parent messages:', error);
        throw error;
    }
};

// Get Student Messages
const getStudentMessages = async (student_id) => {
    const query = `
        SELECT 
            mb.message_id, 
            u.username AS sender_name, 
            mb.student_id, 
            mb.recipient_role, 
            mb.message_text, 
            mb.posted_at
        FROM message_board mb
        JOIN users u ON mb.sender_id = u.user_id
        WHERE mb.student_id = $1
        ORDER BY mb.posted_at DESC;
    `;
    try {
        const result = await pool.query(query, [student_id]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching student messages:', error);
        throw error;
    }
};

// Get Teacher Messages
const getTeacherMessages = async (teacher_id) => {
    const query = `
        SELECT 
            mb.message_id, 
            u.username AS sender_name, 
            mb.student_id, 
            mb.recipient_role, 
            mb.message_text, 
            mb.posted_at
        FROM message_board mb
        JOIN users u ON mb.sender_id = u.user_id
        JOIN students s ON mb.student_id = s.student_id
        JOIN class_teacher_subject cts ON s.class_id = cts.class_id
        WHERE cts.teacher_id = $1
        ORDER BY mb.posted_at DESC;
    `;
    try {
        const result = await pool.query(query, [teacher_id]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching teacher messages:', error);
        throw error;
    }
};

module.exports = {
    getUserRole,
    getStudent,
    validateTeacherForStudent,
    validateStudentForTeacher,
    postMessage,
    getParentMessages,
    getStudentMessages,
    getTeacherMessages,
};