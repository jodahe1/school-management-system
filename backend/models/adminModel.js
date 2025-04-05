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
        return result.rows[0]; // Returns the admin record if found, otherwise null
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
            WHERE s.class_id = $1;
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
        const studentQuery = `
            DELETE FROM students
            WHERE student_id = $1;
        `;
        await pool.query(studentQuery, [studentId]);

        const userQuery = `
            DELETE FROM users
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

module.exports = {
    createAdmin,
    verifyAdmin,
    getAllClasses,
    getStudentsByClass,
    getStudentDetails,
    updateStudent,
    updateParent,
    deleteStudent,
    deleteTeacher,
    deleteParent,
    updateTeacher,
    getAllTeachers, // Add this line
};