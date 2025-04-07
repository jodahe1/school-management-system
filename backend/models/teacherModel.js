// backend/models/teacherModel.js
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
const getTeacherProfile = async (teacher_id) => {
    const query = `
        SELECT t.first_name, t.last_name, u.email, t.subject_teaches
        FROM teachers t
        JOIN users u ON t.teacher_id = u.user_id
        WHERE t.teacher_id = $1 AND u.role = 'teacher';
    `;
    const result = await pool.query(query, [teacher_id]);
    return result.rows[0];
};

// Get Teacher Schedule
const getTeacherSchedule = async (teacher_id) => {
    const query = `
        SELECT c.class_name, s.subject_name, sch.day_of_week, sch.period_number, sch.start_time, sch.end_time
        FROM schedules sch
        JOIN classes c ON sch.class_id = c.class_id
        JOIN subjects s ON sch.subject_id = s.subject_id
        JOIN semesters sm ON sch.semester_id = sm.semester_id
        WHERE sch.teacher_id = $1 AND sm.is_active = TRUE;
    `;
    const result = await pool.query(query, [teacher_id]);
    return result.rows;
};

// Record Attendance
const recordAttendance = async (teacher_id, class_id, subject_id, semester_id, date, period_number, attendance) => {
    const query = `
        INSERT INTO attendance (student_id, class_id, teacher_id, subject_id, semester_id, date, period_number, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
    for (const record of attendance) {
        await pool.query(query, [
            record.student_id,
            class_id,
            teacher_id,
            subject_id,
            semester_id,
            date,
            period_number,
            record.status,
        ]);
    }
    return attendance;
};

// Assign Grade
const assignGrade = async (teacher_id, student_id, subject_id, semester_id, grade, comments) => {
    const query = `
        INSERT INTO grades (student_id, teacher_id, subject_id, semester_id, grade, comments)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const result = await pool.query(query, [student_id, teacher_id, subject_id, semester_id, grade, comments]);
    return result.rows[0];
};

// Upload Material
const uploadMaterial = async (teacher_id, class_id, subject_id, semester_id, title, file_path) => {
    const query = `
        INSERT INTO materials (teacher_id, class_id, subject_id, semester_id, title, file_path)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const result = await pool.query(query, [teacher_id, class_id, subject_id, semester_id, title, file_path]);
    return result.rows[0];
};

// Create Assignment
const createAssignment = async (teacher_id, class_id, subject_id, semester_id, title, description, due_date, file_path) => {
    const query = `
        INSERT INTO assignments (teacher_id, class_id, subject_id, semester_id, title, description, due_date, file_path)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const result = await pool.query(query, [teacher_id, class_id, subject_id, semester_id, title, description, due_date, file_path]);
    return result.rows[0];
};

// Get Teacher Submissions
const getTeacherSubmissions = async (teacher_id, class_id, subject_id) => {
    let query = `
        SELECT st.first_name || ' ' || st.last_name AS student_name, a.title AS assignment_title, s.subject_name,
               sb.submitted_file_path, sb.submission_date, sb.grade, sb.feedback
        FROM submissions sb
        JOIN assignments a ON sb.assignment_id = a.assignment_id
        JOIN students st ON sb.student_id = st.student_id
        JOIN subjects s ON a.subject_id = s.subject_id
        WHERE a.teacher_id = $1
    `;
    const params = [teacher_id];

    if (class_id) {
        query += ` AND a.class_id = $${params.length + 1}`;
        params.push(class_id);
    }
    if (subject_id) {
        query += ` AND a.subject_id = $${params.length + 1}`;
        params.push(subject_id);
    }

    const result = await pool.query(query, params);
    return result.rows;
};

// NEW MODEL METHODS

// Get Classes for Teacher
const getTeacherClasses = async (teacher_id) => {
    const query = `
        SELECT DISTINCT c.class_id, c.class_name
        FROM schedules sch
        JOIN classes c ON sch.class_id = c.class_id
        WHERE sch.teacher_id = $1;
    `;
    const result = await pool.query(query, [teacher_id]);
    return result.rows;
};

// Get Students in Class
const getClassStudents = async (class_id) => {
    const query = `
        SELECT s.student_id, s.first_name, s.last_name, u.email
        FROM students s
        JOIN users u ON s.student_id = u.user_id
        WHERE s.class_id = $1;
    `;
    const result = await pool.query(query, [class_id]);
    return result.rows;
};

// Get Student Details
const getStudentDetails = async (student_id) => {
    const query = `
        SELECT s.student_id, s.first_name, s.last_name, u.email, 
               c.class_name, c.class_id
        FROM students s
        JOIN users u ON s.student_id = u.user_id
        JOIN classes c ON s.class_id = c.class_id
        WHERE s.student_id = $1;
    `;
    const result = await pool.query(query, [student_id]);
    return result.rows[0];
};

module.exports = {
    verifyTeacher,
    getTeacherProfile,
    getTeacherSchedule,
    recordAttendance,
    assignGrade,
    uploadMaterial,
    createAssignment,
    getTeacherSubmissions,
    // New exports
    getTeacherClasses,
    getClassStudents,
    getStudentDetails
};