// models/teacherModel.js
const pool = require('../config/db');

// Verify Teacher Credentials
const verifyTeacher = async (username, password) => {
    const query = `
        SELECT u.user_id, u.username, u.email, t.first_name, t.last_name, t.subject_teaches
        FROM users u
        JOIN teachers t ON u.user_id = t.teacher_id
        WHERE u.username = $1 AND u.password_hash = $2 AND u.role = 'teacher';
    `;
    const result = await pool.query(query, [username, password]);
    return result.rows[0];
};

// Get Teacher Profile
const getTeacherProfile = async (teacherId) => {
    const query = `
        SELECT u.username, u.email, t.first_name, t.last_name, t.subject_teaches
        FROM users u
        JOIN teachers t ON u.user_id = t.teacher_id
        WHERE u.user_id = $1;
    `;
    const result = await pool.query(query, [teacherId]);
    return result.rows[0];
};

// Get Schedules for Teacher
const getSchedulesByTeacher = async (teacherId) => {
    const query = `
        SELECT s.schedule_id, c.class_name, sb.subject_name, sm.semester_name, s.day_of_week, s.period_number, s.start_time, s.end_time
        FROM schedules s
        JOIN classes c ON s.class_id = c.class_id
        JOIN subjects sb ON s.subject_id = sb.subject_id
        JOIN semesters sm ON s.semester_id = sm.semester_id
        WHERE s.teacher_id = $1;
    `;
    const result = await pool.query(query, [teacherId]);
    return result.rows;
};

// Record Attendance
const recordAttendance = async (teacherId, attendanceRecords) => {
    const query = `
        INSERT INTO attendance (student_id, class_id, teacher_id, subject_id, semester_id, date, period_number, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
    for (const record of attendanceRecords) {
        await pool.query(query, [
            record.student_id,
            record.class_id,
            teacherId,
            record.subject_id,
            record.semester_id,
            record.date,
            record.period_number,
            record.status,
        ]);
    }
};

// Assign Grade
const assignGrade = async (teacherId, studentId, subjectId, semesterId, grade, comments) => {
    const query = `
        INSERT INTO grades (student_id, teacher_id, subject_id, semester_id, grade, comments)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const result = await pool.query(query, [studentId, teacherId, subjectId, semesterId, grade, comments]);
    return result.rows[0];
};

// Upload Material
const uploadMaterial = async (teacherId, classId, subjectId, semesterId, title, filePath) => {
    const query = `
        INSERT INTO materials (teacher_id, class_id, subject_id, semester_id, title, file_path)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const result = await pool.query(query, [teacherId, classId, subjectId, semesterId, title, filePath]);
    return result.rows[0];
};

// Create Assignment
const createAssignment = async (teacherId, classId, subjectId, semesterId, title, description, dueDate, filePath) => {
    const query = `
        INSERT INTO assignments (teacher_id, class_id, subject_id, semester_id, title, description, due_date, file_path)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const result = await pool.query(query, [teacherId, classId, subjectId, semesterId, title, description, dueDate, filePath]);
    return result.rows[0];
};

// Grade Submission
const gradeSubmission = async (submissionId, grade, feedback) => {
    const query = `
        UPDATE submissions
        SET grade = $1, feedback = $2
        WHERE submission_id = $3
        RETURNING *;
    `;
    const result = await pool.query(query, [grade, feedback, submissionId]);
    return result.rows[0];
};

// Send Chat Message
const sendChatMessage = async (senderId, receiverId, studentId, messageText) => {
    const query = `
        INSERT INTO chat_messages (sender_id, receiver_id, student_id, message_text, sent_at, is_read)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, FALSE)
        RETURNING *;
    `;
    const result = await pool.query(query, [senderId, receiverId, studentId, messageText]);
    return result.rows[0];
};

module.exports = {
    verifyTeacher,
    getTeacherProfile,
    getSchedulesByTeacher,
    recordAttendance,
    assignGrade,
    uploadMaterial,
    createAssignment,
    gradeSubmission,
    sendChatMessage,
};