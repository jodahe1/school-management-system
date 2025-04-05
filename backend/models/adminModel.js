// backend/models/adminModel.js
const pool = require('../config/db');

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

module.exports = { createAdmin };