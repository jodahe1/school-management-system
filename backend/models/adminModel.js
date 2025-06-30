// backend/models/adminModel.js

const pool = require('../config/db');

// Create Admin Function
const createAdmin = async (username, password, email) => {
    try {
        const query = `
            INSERT INTO users (username, password_hash, email, role)
            VALUES ($1, $2, $3, 'admin')
            RETURNING *;
        `;
        const values = [username, password, email];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Verify Admin Credentials
const verifyAdmin = async (email, password) => {
    try {
        const query = `
            SELECT * FROM users
            WHERE email = $1 AND password_hash = $2 AND role = 'admin';
        `;
        const values = [email, password];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Fetch All Classes
const getAllClasses = async () => {
    try {
        const query = 'SELECT * FROM classes';
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Fetch Students in a Specific Class
const getStudentsByClass = async (classId) => {
    try {
        const query = `
            SELECT s.student_id, u.username, u.email, s.first_name, s.last_name, s.date_of_birth
            FROM students s
            JOIN users u ON s.student_id = u.user_id
            WHERE s.class_id = $1 AND u.deleted_at IS NULL;
        `;
        const result = await pool.query(query, [classId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Fetch Student and Parent Details
const getStudentDetails = async (studentId) => {
    try {
        const query = `
            SELECT 
                s.student_id, u.username AS student_username, u.email AS student_email,
                s.first_name AS student_first_name, s.last_name AS student_last_name,
                s.date_of_birth, p.parent_id, pu.username AS parent_username,
                pu.email AS parent_email, p.first_name AS parent_first_name,
                p.last_name AS parent_last_name, p.phone_number
            FROM students s
            JOIN users u ON s.student_id = u.user_id
            LEFT JOIN parents p ON s.parent_id = p.parent_id
            LEFT JOIN users pu ON p.parent_id = pu.user_id
            WHERE s.student_id = $1;
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Update Student Information
const updateStudent = async (studentId, firstName, lastName, dob) => {
    try {
        const query = `
            UPDATE students
            SET first_name = $1, last_name = $2, date_of_birth = $3
            WHERE student_id = $4
            RETURNING *;
        `;
        const result = await pool.query(query, [firstName, lastName, dob, studentId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Update Parent Information
const updateParent = async (parentId, firstName, lastName, phoneNumber) => {
    try {
        const query = `
            UPDATE parents
            SET first_name = $1, last_name = $2, phone_number = $3
            WHERE parent_id = $4
            RETURNING *;
        `;
        const result = await pool.query(query, [firstName, lastName, phoneNumber, parentId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Delete Student
const deleteStudent = async (studentId) => {
    try {
        // Soft delete in users table only
        const userQuery = `
            UPDATE users
            SET deleted_at = NOW()
            WHERE user_id = $1;
        `;
        await pool.query(userQuery, [studentId]);
    } catch (error) {
        throw error;
    }
};

// Delete Teacher
const deleteTeacher = async (teacherId) => {
    try {
        const teacherQuery = `
            DELETE FROM teachers
            WHERE teacher_id = $1;
        `;
        await pool.query(teacherQuery, [teacherId]);

        const userQuery = `
            DELETE FROM users
            WHERE user_id = $1;
        `;
        await pool.query(userQuery, [teacherId]);
    } catch (error) {
        throw error;
    }
};

// Delete Parent
const deleteParent = async (parentId) => {
    try {
        const parentQuery = `
            DELETE FROM parents
            WHERE parent_id = $1;
        `;
        await pool.query(parentQuery, [parentId]);

        const userQuery = `
            DELETE FROM users
            WHERE user_id = $1;
        `;
        await pool.query(userQuery, [parentId]);
    } catch (error) {
        throw error;
    }
};

// Update Teacher Information
const updateTeacher = async (teacherId, firstName, lastName, subjectTeaches) => {
    try {
        const query = `
            UPDATE teachers
            SET first_name = $1, last_name = $2, subject_teaches = $3
            WHERE teacher_id = $4
            RETURNING *;
        `;
        const result = await pool.query(query, [firstName, lastName, subjectTeaches, teacherId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Fetch All Teachers
const getAllTeachers = async () => {
    try {
        const query = `
            SELECT 
                t.teacher_id, u.username, u.email, t.first_name, t.last_name, t.subject_teaches
            FROM teachers t
            JOIN users u ON t.teacher_id = u.user_id;
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Fetch All Schedules
const getAllSchedules = async () => {
    try {
        const query = `
            SELECT 
                s.schedule_id, c.class_name, u.username AS teacher_name, sb.subject_name, 
                sm.semester_name, s.day_of_week, s.period_number, s.start_time, s.end_time
            FROM schedules s
            JOIN classes c ON s.class_id = c.class_id
            JOIN users u ON s.teacher_id = u.user_id
            JOIN subjects sb ON s.subject_id = sb.subject_id
            JOIN semesters sm ON s.semester_id = sm.semester_id;
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Add Schedule
const addSchedule = async (classId, teacherId, subjectId, semesterId, dayOfWeek, periodNumber, startTime, endTime, createdBy) => {
    try {
        // Ensure class-teacher-subject relationship exists
        const checkQuery = `
            SELECT 1 FROM class_teacher_subject
            WHERE class_id = $1 AND teacher_id = $2 AND subject_id = $3
        `;
        const checkRes = await pool.query(checkQuery, [classId, teacherId, subjectId]);
        if (checkRes.rowCount === 0) {
            const insertRelationQuery = `
                INSERT INTO class_teacher_subject (class_id, teacher_id, subject_id)
                VALUES ($1, $2, $3)
            `;
            await pool.query(insertRelationQuery, [classId, teacherId, subjectId]);
        }

        // Add schedule
        const scheduleQuery = `
            INSERT INTO schedules (class_id, teacher_id, subject_id, semester_id, day_of_week, period_number, start_time, end_time, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [classId, teacherId, subjectId, semesterId, dayOfWeek, periodNumber, startTime, endTime, createdBy];
        const result = await pool.query(scheduleQuery, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Update Schedule
const updateSchedule = async (scheduleId, classId, teacherId, subjectId, semesterId, dayOfWeek, periodNumber, startTime, endTime) => {
    try {
        const query = `
            UPDATE schedules
            SET class_id = $1, teacher_id = $2, subject_id = $3, semester_id = $4, 
                day_of_week = $5, period_number = $6, start_time = $7, end_time = $8
            WHERE schedule_id = $9
            RETURNING *;
        `;
        const values = [classId, teacherId, subjectId, semesterId, dayOfWeek, periodNumber, startTime, endTime, scheduleId];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Delete Schedule
const deleteSchedule = async (scheduleId) => {
    try {
        const query = `
            DELETE FROM schedules
            WHERE schedule_id = $1;
        `;
        await pool.query(query, [scheduleId]);
    } catch (error) {
        throw error;
    }
};

// Fetch Schedules for a Specific Class
const getSchedulesByClass = async (classId) => {
    try {
        const query = `
            SELECT 
                s.schedule_id, c.class_name, u.username AS teacher_name, sb.subject_name, 
                sm.semester_name, s.day_of_week, s.period_number, s.start_time, s.end_time
            FROM schedules s
            JOIN classes c ON s.class_id = c.class_id
            JOIN users u ON s.teacher_id = u.user_id
            JOIN subjects sb ON s.subject_id = sb.subject_id
            JOIN semesters sm ON s.semester_id = sm.semester_id
            WHERE s.class_id = $1;
        `;
        const result = await pool.query(query, [classId]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Fetch All Teachers for Dropdown
const getAllTeachersForDropdown = async () => {
    try {
        const query = `
            SELECT teacher_id, first_name, last_name
            FROM teachers;
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Fetch All Subjects for Dropdown
const getAllSubjectsForDropdown = async () => {
    try {
        const query = `
            SELECT subject_id, subject_name
            FROM subjects;
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Fetch All Semesters for Dropdown
const getAllSemestersForDropdown = async () => {
    try {
        const query = `
            SELECT semester_id, semester_name
            FROM semesters;
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Get Single Schedule by ID
const getScheduleById = async (scheduleId) => {
    try {
        const query = `
            SELECT 
                s.schedule_id, s.class_id, s.teacher_id, s.subject_id, s.semester_id,
                s.day_of_week, s.period_number, s.start_time, s.end_time,
                t.first_name AS teacher_first_name, t.last_name AS teacher_last_name,
                sb.subject_name, sm.semester_name
            FROM schedules s
            JOIN teachers t ON s.teacher_id = t.teacher_id
            JOIN subjects sb ON s.subject_id = sb.subject_id
            JOIN semesters sm ON s.semester_id = sm.semester_id
            WHERE s.schedule_id = $1;
        `;
        const result = await pool.query(query, [scheduleId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Create Student
const createStudent = async (username, password, email, firstName, lastName, dob, classId, parentId) => {
    try {
        const userQuery = `
            INSERT INTO users (username, password_hash, email, role)
            VALUES ($1, $2, $3, 'student')
            RETURNING user_id;
        `;
        const userRes = await pool.query(userQuery, [username, password, email]);
        const studentId = userRes.rows[0].user_id;

        const studentQuery = `
            INSERT INTO students (student_id, first_name, last_name, date_of_birth, class_id, parent_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [studentId, firstName, lastName, dob, classId, parentId];
        const result = await pool.query(studentQuery, values);

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Create Teacher
const createTeacher = async (username, password, email, firstName, lastName, subjectTeaches) => {
    try {
        const userQuery = `
            INSERT INTO users (username, password_hash, email, role)
            VALUES ($1, $2, $3, 'teacher')
            RETURNING user_id;
        `;
        const userRes = await pool.query(userQuery, [username, password, email]);
        const teacherId = userRes.rows[0].user_id;

        const teacherQuery = `
            INSERT INTO teachers (teacher_id, first_name, last_name, subject_teaches)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [teacherId, firstName, lastName, subjectTeaches];
        const result = await pool.query(teacherQuery, values);

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Create Parent
const createParent = async (username, password, email, firstName, lastName, phoneNumber) => {
    try {
        const userQuery = `
            INSERT INTO users (username, password_hash, email, role)
            VALUES ($1, $2, $3, 'parent')
            RETURNING user_id;
        `;
        const userRes = await pool.query(userQuery, [username, password, email]);
        const parentId = userRes.rows[0].user_id;

        const parentQuery = `
            INSERT INTO parents (parent_id, first_name, last_name, phone_number)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [parentId, firstName, lastName, phoneNumber];
        const result = await pool.query(parentQuery, values);

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Get All Parents
const getAllParents = async () => {
    try {
        const query = `
            SELECT 
                p.parent_id, u.username, u.email, p.first_name, p.last_name, p.phone_number
            FROM parents p
            JOIN users u ON p.parent_id = u.user_id;
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Fetch All Admins
const getAllUsers = async () => {
    try {
        const query = `
            SELECT 
                user_id, username, email, role
            FROM users
            WHERE deleted_at IS NULL
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// join teacher with class Subject
const ensureClassTeacherSubject = async (classId, teacherId, subjectId) => {
    const existsQuery = `
        SELECT 1 FROM class_teacher_subject
        WHERE class_id = $1 AND teacher_id = $2 AND subject_id = $3
    `;
    const insertQuery = `
        INSERT INTO class_teacher_subject (class_id, teacher_id, subject_id)
        VALUES ($1, $2, $3)
    `;
    const res = await pool.query(existsQuery, [classId, teacherId, subjectId]);
    if (res.rowCount === 0) {
        await pool.query(insertQuery, [classId, teacherId, subjectId]);
    }
};

// Semester Management Functions
const getAllSemesters = async () => {
    try {
        const query = `
            SELECT semester_id, semester_name, start_date, end_date, is_active
            FROM semesters
            ORDER BY start_date DESC;
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

const addSemester = async (semesterName, startDate, endDate, isActive) => {
    try {
        const query = `
            INSERT INTO semesters (semester_name, start_date, end_date, is_active)
            VALUES ($1, $2, $3, $4)
            RETURNING semester_id, semester_name, start_date, end_date, is_active;
        `;
        const result = await pool.query(query, [semesterName, startDate, endDate, isActive]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

const updateSemester = async (semesterId, semesterName, startDate, endDate, isActive) => {
    try {
        const query = `
            UPDATE semesters
            SET semester_name = $1, start_date = $2, end_date = $3, is_active = $4
            WHERE semester_id = $5
            RETURNING semester_id, semester_name, start_date, end_date, is_active;
        `;
        const result = await pool.query(query, [semesterName, startDate, endDate, isActive, semesterId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

const deleteSemester = async (semesterId) => {
    try {
        // First check if semester is being used in any schedules
        const checkQuery = `
            SELECT COUNT(*) FROM schedules WHERE semester_id = $1;
        `;
        const checkResult = await pool.query(checkQuery, [semesterId]);
        
        if (checkResult.rows[0].count > 0) {
            throw new Error('Cannot delete semester as it is being used in schedules');
        }

        const query = `
            DELETE FROM semesters
            WHERE semester_id = $1
            RETURNING semester_id;
        `;
        const result = await pool.query(query, [semesterId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Class Management Functions
const addClass = async (className) => {
    try {
        const query = `
            INSERT INTO classes (class_name)
            VALUES ($1)
            RETURNING class_id, class_name;
        `;
        const result = await pool.query(query, [className]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

const updateClass = async (classId, className) => {
    try {
        const query = `
            UPDATE classes
            SET class_name = $1
            WHERE class_id = $2
            RETURNING class_id, class_name;
        `;
        const result = await pool.query(query, [className, classId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

const deleteClass = async (classId) => {
    try {
        // First check if class is being used in any schedules or has students
        const checkQuery = `
            SELECT 
                (SELECT COUNT(*) FROM schedules WHERE class_id = $1) as schedule_count,
                (SELECT COUNT(*) FROM students WHERE class_id = $1) as student_count;
        `;
        const checkResult = await pool.query(checkQuery, [classId]);
        
        if (checkResult.rows[0].schedule_count > 0 || checkResult.rows[0].student_count > 0) {
            throw new Error('Cannot delete class as it has associated schedules or students');
        }

        const query = `
            DELETE FROM classes
            WHERE class_id = $1
            RETURNING class_id;
        `;
        const result = await pool.query(query, [classId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createAdmin,
    verifyAdmin,
    getAllUsers,
    createStudent,
    createTeacher,
    createParent,
    getAllParents,
    getAllClasses,
    getStudentsByClass,
    getStudentDetails,
    updateStudent,
    updateParent,
    deleteStudent,
    deleteTeacher,
    deleteParent,
    updateTeacher,
    getAllTeachers,
    getAllSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByClass,
    getAllTeachersForDropdown,
    getAllSubjectsForDropdown,
    getAllSemestersForDropdown,
    getScheduleById,
    ensureClassTeacherSubject,
    getAllSemesters,
    addSemester,
    updateSemester,
    deleteSemester,
    addClass,
    updateClass,
    deleteClass
};