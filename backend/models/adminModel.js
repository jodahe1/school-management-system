// backend/models/adminModel.js
const pool = require('../config/db');

// Create Admin Function
const createAdmin = async (name, email, password) => {
    try {
        const query = 'INSERT INTO administrators (name, email, password) VALUES ($1, $2, $3) RETURNING *';
        const values = [name, email, password];
        const result = await pool.query(query, values);
        return result.rows[0];
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

module.exports = { createAdmin, createStudent };