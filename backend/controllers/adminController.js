// backend/controllers/adminController.js
const pool = require('../config/db');
const { createAdmin, verifyAdmin, createStudent, createTeacher, createParent } = require('../models/adminModel');

// Add Admin Function
const addAdmin = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newAdmin = await createAdmin(username, password, email);
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
        const result = await pool.query(query);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Admin Login Function
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const admin = await verifyAdmin(email, password);

        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful', admin });
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

// Add Teacher Function
const addTeacher = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName, subjectTeaches } = req.body;
        if (!username || !password || !email || !firstName || !lastName || !subjectTeaches) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newTeacher = await createTeacher(username, password, email, firstName, lastName, subjectTeaches);
        res.status(201).json({ message: 'Teacher added successfully', teacher: newTeacher });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Add Parent Function
const addParent = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName, phoneNumber } = req.body;
        if (!username || !password || !email || !firstName || !lastName || !phoneNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newParent = await createParent(username, password, email, firstName, lastName, phoneNumber);
        res.status(201).json({ message: 'Parent added successfully', parent: newParent });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

module.exports = { addAdmin, getAnalytics, loginAdmin, addStudent, addTeacher, addParent };