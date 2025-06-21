const pool = require('../config/db');

// Verify Teacher Credentials
const verifyTeacher = async (username, password) => {
    const query = `
        SELECT u.user_id, u.username, u.email, u.role, u.password_reset_required, t.teacher_id, t.first_name, t.last_name, t.subject_teaches
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

// Validate Teacher Class
const validateTeacherClass = async (teacher_id, class_id) => {
    const query = `
        SELECT 1 FROM class_teacher_subject
        WHERE teacher_id = $1 AND class_id = $2;
    `;
    const result = await pool.query(query, [teacher_id, class_id]);
    return result.rowCount > 0;
};

// Record Attendance
const recordAttendance = async (teacher_id, class_id, subject_id, semester_id, date, period_number, attendance) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const query = `
            INSERT INTO attendance (student_id, class_id, teacher_id, subject_id, semester_id, date, period_number, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (student_id, date, period_number) 
            DO UPDATE SET status = EXCLUDED.status;
        `;
        
        for (const record of attendance) {
            await client.query(query, [
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
        
        await client.query('COMMIT');
        return attendance;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
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

// Get Student Grades
const getStudentGrades = async (student_id) => {
    const query = `
        SELECT g.grade_id, g.grade, g.comments, g.created_at,
               s.subject_name, sem.semester_name
        FROM grades g
        JOIN subjects s ON g.subject_id = s.subject_id
        JOIN semesters sem ON g.semester_id = sem.semester_id
        WHERE g.student_id = $1
        ORDER BY g.created_at DESC;
    `;
    const result = await pool.query(query, [student_id]);
    return result.rows;
};

// Get Teacher Materials
const getTeacherMaterials = async (teacher_id) => {
    const query = `
        SELECT m.material_id, m.title, m.file_path, m.uploaded_at,
               c.class_name, s.subject_name
        FROM materials m
        JOIN classes c ON m.class_id = c.class_id
        JOIN subjects s ON m.subject_id = s.subject_id
        WHERE m.teacher_id = $1
        ORDER BY m.uploaded_at DESC;
    `;
    const result = await pool.query(query, [teacher_id]);
    return result.rows;
};

// Get Teacher Assignments
const getTeacherAssignments = async (teacher_id) => {
    const query = `
        SELECT a.assignment_id, a.title, a.description, a.due_date, a.file_path, a.created_at,
               c.class_name, s.subject_name
        FROM assignments a
        JOIN classes c ON a.class_id = c.class_id
        JOIN subjects s ON a.subject_id = s.subject_id
        WHERE a.teacher_id = $1
        ORDER BY a.created_at DESC;
    `;
    const result = await pool.query(query, [teacher_id]);
    return result.rows;
};

const getStudentsForContext = async (teacher_id, class_id, subject_id, semester_id) => {
    const isValid = await validateTeacherClassSubject(teacher_id, class_id, subject_id);
    if (!isValid) return null;

    const query = `
        SELECT s.student_id, s.first_name, s.last_name, u.email
        FROM students s
        JOIN users u ON s.student_id = u.user_id
        WHERE s.class_id = $1
    `;
    const result = await pool.query(query, [class_id]);
    return result.rows;
};

// Create Announcement
const createAnnouncement = async (teacher_id, class_id, subject_id, semester_id, title, content, file_path, is_important = false) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create announcement
        const announcementQuery = `
            INSERT INTO announcements 
            (teacher_id, class_id, subject_id, semester_id, title, content, file_path, is_important)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING announcement_id;
        `;
        const announcementResult = await client.query(announcementQuery, [
            teacher_id, 
            class_id, 
            subject_id, 
            semester_id, 
            title, 
            content, 
            file_path,
            is_important
        ]);

        // Link to students
        const linkQuery = `
            INSERT INTO student_announcements 
            (announcement_id, student_id, is_read)
            SELECT $1, student_id, FALSE
            FROM students 
            WHERE class_id = $2
            RETURNING student_id;
        `;
        const linkResult = await client.query(linkQuery, [
            announcementResult.rows[0].announcement_id, 
            class_id
        ]);

        if (linkResult.rows.length === 0) {
            throw new Error('No students found in this class');
        }

        await client.query('COMMIT');
        return { 
            announcement_id: announcementResult.rows[0].announcement_id,
            students_notified: linkResult.rowCount
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Get Class Announcements
const getClassAnnouncements = async (class_id, semester_id) => {
    const query = `
        SELECT 
            a.*, 
            t.first_name || ' ' || t.last_name AS teacher_name,
            s.subject_name,
            c.class_name
        FROM announcements a
        JOIN teachers t ON a.teacher_id = t.teacher_id
        LEFT JOIN subjects s ON a.subject_id = s.subject_id
        LEFT JOIN classes c ON a.class_id = c.class_id
        WHERE a.class_id = $1
        AND (a.semester_id = $2 OR $2 IS NULL)
        ORDER BY a.created_at DESC;
    `;
    const result = await pool.query(query, [class_id, semester_id]);
    return result.rows;
};

// Get first-time login information
const getFirstTimeInfo = async (userId) => {
    try {
        const query = `
            SELECT 
                u.user_id, u.username, u.email, u.role, u.created_at, u.password_reset_required,
                t.teacher_id, t.first_name, t.last_name, t.subject_teaches
            FROM users u
            JOIN teachers t ON u.user_id = t.teacher_id
            WHERE u.user_id = $1 AND u.role = 'teacher';
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
            
            // Update teachers table
            const updateTeacherQuery = `
                UPDATE teachers 
                SET first_name = $1, last_name = $2
                WHERE teacher_id = $3
                RETURNING teacher_id, first_name, last_name, subject_teaches;
            `;
            const teacherResult = await client.query(updateTeacherQuery, [
                updateData.firstName,
                updateData.lastName,
                userId
            ]);
            
            await client.query('COMMIT');
            
            // Return combined user data
            return {
                ...userResult.rows[0],
                ...teacherResult.rows[0]
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

module.exports = {
    verifyTeacher,
    getTeacherProfile,
    getTeacherSchedule,
    validateTeacherAccess,
    validateTeacherClassSubject,
    validateTeacherClass,
    recordAttendance,
    assignGrade,
    uploadMaterial,
    createAssignment,
    getTeacherSubmissions,
    getTeacherClasses,
    getClassStudents,
    getStudentDetails,
    getStudentsForContext,
    createAnnouncement,
    getClassAnnouncements,
    getFirstTimeInfo,
    completeSetup,
    getStudentGrades,
    getTeacherMaterials,
    getTeacherAssignments
};