// backend/models/adminModel.js
const pool = require('../config/db');

// Create Admin Function
const createAdmin = async (username, password, email) => {
    try {
        // Insert into users table with role = 'admin'
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

// Create Student Function
const createStudent = async (username, password, email, firstName, lastName, dob, classId, parentId) => {
    try {
        // Insert into users table
        const userQuery = `
            INSERT INTO users (username, password_hash, email, role)
            VALUES ($1, $2, $3, 'student')
            RETURNING user_id;
        `;
        const userValues = [username, password, email];
        const userResult = await pool.query(userQuery, userValues);

        const userId = userResult.rows[0].user_id;

        // Insert into students table
        const studentQuery = `
            INSERT INTO students (student_id, class_id, parent_id, first_name, last_name, date_of_birth)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const studentValues = [userId, classId, parentId, firstName, lastName, dob];
        const studentResult = await pool.query(studentQuery, studentValues);

        return studentResult.rows[0];
    } catch (error) {
        throw error;
    }
};

// Create Teacher Function
const createTeacher = async (username, password, email, firstName, lastName, subjectTeaches) => {
    try {
        // Insert into users table
        const userQuery = `
            INSERT INTO users (username, password_hash, email, role)
            VALUES ($1, $2, $3, 'teacher')
            RETURNING user_id;
        `;
        const userValues = [username, password, email];
        const userResult = await pool.query(userQuery, userValues);

        const userId = userResult.rows[0].user_id;

        // Insert into teachers table
        const teacherQuery = `
            INSERT INTO teachers (teacher_id, first_name, last_name, subject_teaches)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const teacherValues = [userId, firstName, lastName, subjectTeaches];
        const teacherResult = await pool.query(teacherQuery, teacherValues);

        return teacherResult.rows[0];
    } catch (error) {
        throw error;
    }
};

// Create Parent Function
const createParent = async (username, password, email, firstName, lastName, phoneNumber) => {
    try {
        // Insert into users table
        const userQuery = `
            INSERT INTO users (username, password_hash, email, role)
            VALUES ($1, $2, $3, 'parent')
            RETURNING user_id;
        `;
        const userValues = [username, password, email];
        const userResult = await pool.query(userQuery, userValues);

        const userId = userResult.rows[0].user_id;

        // Insert into parents table
        const parentQuery = `
            INSERT INTO parents (parent_id, first_name, last_name, phone_number)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const parentValues = [userId, firstName, lastName, phoneNumber];
        const parentResult = await pool.query(parentQuery, parentValues);

        return parentResult.rows[0];
    } catch (error) {
        throw error;
    }
};

module.exports = { createAdmin, verifyAdmin, createStudent, createTeacher, createParent };