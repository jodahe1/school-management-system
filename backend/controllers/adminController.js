// backend/controllers/adminController.js
const pool = require('../config/db'); // Import the pool object
const { createAdmin, createStudent } = require('../models/adminModel');

// Add Admin Function
const addAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newAdmin = await createAdmin(name, email, password);
        res.status(201).json({ message: 'Administrator added successfully', admin: newAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Analytics Function
const getAnalytics = async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(CASE WHEN role = 'student' THEN 1 END) AS total_students,
                COUNT(CASE WHEN role = 'teacher' THEN 1 END) AS total_teachers,
                COUNT(CASE WHEN role = 'parent' THEN 1 END) AS total_parents,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) AS total_admins
            FROM users;
        `;
        const result = await pool.query(query); // Use the pool object here
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Add Student Function
const addStudent = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName, dob, classId, parentId } = req.body;
        if (!username || !password || !email || !firstName || !lastName || !dob || !classId || !parentId) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newStudent = await createStudent(username, password, email, firstName, lastName, dob, classId, parentId);
        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

module.exports = { addAdmin, getAnalytics, addStudent };