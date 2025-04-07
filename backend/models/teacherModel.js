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
        SELECT c.class_name, s.subject_name, sch.day_of_week, sch.period_number, 
               sch.start_time, sch.end_time, sch.class_id, sch.subject_id
        FROM schedules sch
        JOIN classes c ON sch.class_id = c.class_id
        JOIN subjects s ON sch.subject_id = s.subject_id
        JOIN semesters sm ON sch.semester_id = sm.semester_id
        WHERE sch.teacher_id = $1 AND sm.is_active = TRUE;
    `;
    const result = await pool.query(query, [teacher_id]);
    return result.rows;
};

// Validate Teacher Access
const validateTeacherAccess = async (teacher_id, student_id, subject_id) => {
    const query = `
        SELECT 1 FROM class_teacher_subject cts
        JOIN students s ON cts.class_id = s.class_id
        WHERE cts.teacher_id = $1 AND s.student_id = $2 AND cts.subject_id = $3;
    `;
    const result = await pool.query(query, [teacher_id, student_id, subject_id]);
    return result.rowCount > 0;
};

// Validate Teacher Class-Subject
const validateTeacherClassSubject = async (teacher_id, class_id, subject_id) => {
    const query = `
        SELECT 1 FROM class_teacher_subject
        WHERE teacher_id = $1 AND class_id = $2 AND subject_id = $3;
    `;
    const result = await pool.query(query, [teacher_id, class_id, subject_id]);
    return result.rowCount > 0;
};

// Record Attendance
const recordAttendance = async (teacher_id, class_id, subject_id, semester_id, date, period_number, attendance) => {
    const query = `
        INSERT INTO attendance (student_id, class_id, teacher_id, subject_id, semester_id, date, period_number, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (student_id, date, period_number) 
        DO UPDATE SET status = EXCLUDED.status;
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
            record.status
        ]);
    }
    return attendance;
};

// Assign Grade
const assignGrade = async (teacher_id, student_id, subject_id, semester_id, grade, comments) => {
    const query = `
        INSERT INTO grades (student_id, teacher_id, subject_id, semester_id, grade, comments)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (student_id, subject_id, semester_id)
        DO UPDATE SET grade = EXCLUDED.grade, comments = EXCLUDED.comments
        RETURNING *;
    `;
    const result = await pool.query(query, [student_id, teacher_id, subject_id, semester_id, grade, comments]);
    return result.rows[0];
};

// Upload Material
const uploadMaterial = async (teacher_id, class_id, subject_id, semester_id, title, file_path) => {
    const effectiveSemesterId = semester_id || (await pool.query(
        'SELECT semester_id FROM semesters WHERE is_active = TRUE LIMIT 1'
    )).rows[0]?.semester_id;

    const query = `
        INSERT INTO materials (teacher_id, class_id, subject_id, semester_id, title, file_path)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const result = await pool.query(query, [teacher_id, class_id, subject_id, effectiveSemesterId, title, file_path]);
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
        SELECT 
            s.submission_id,
            st.student_id,
            st.first_name || ' ' || st.last_name AS student_name,
            a.assignment_id,
            a.title AS assignment_title,
            subj.subject_id,
            subj.subject_name,
            s.submitted_file_path,
            s.submission_date,
            s.grade,
            s.feedback
        FROM submissions s
        JOIN assignments a ON s.assignment_id = a.assignment_id
        JOIN students st ON s.student_id = st.student_id
        JOIN subjects subj ON a.subject_id = subj.subject_id
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

    query += ` ORDER BY s.submission_date DESC`;
    const result = await pool.query(query, params);
    return result.rows;
};

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
               c.class_id, c.class_name
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
    validateTeacherAccess,
    validateTeacherClassSubject,
    recordAttendance,
    assignGrade,
    uploadMaterial,
    createAssignment,
    getTeacherSubmissions,
    getTeacherClasses,
    getClassStudents,
    getStudentDetails
};