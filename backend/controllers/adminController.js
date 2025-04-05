// backend/controllers/adminController.js
const pool = require('../config/db');
const { createAdmin, verifyAdmin, createStudent, createTeacher, createParent, getAllClasses, getStudentsByClass, getStudentDetails, updateStudent, updateParent } = require('../models/adminModel');

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

// Fetch All Classes
const fetchClasses = async (req, res) => {
    try {
        const classes = await getAllClasses();
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Students in a Specific Class
const fetchStudentsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        if (!classId) {
            return res.status(400).json({ message: 'Class ID is required' });
        }

        const students = await getStudentsByClass(classId);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Student and Parent Details
const fetchStudentDetails = async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        const studentDetails = await getStudentDetails(studentId);
        if (!studentDetails) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(studentDetails);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Update Student Information
const editStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { firstName, lastName, dob } = req.body;
        if (!studentId || !firstName || !lastName || !dob) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const updatedStudent = await updateStudent(studentId, firstName, lastName, dob);
        res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Update Parent Information
const editParent = async (req, res) => {
    try {
        const { parentId } = req.params;
        const { firstName, lastName, phoneNumber } = req.body;
        if (!parentId || !firstName || !lastName || !phoneNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const updatedParent = await updateParent(parentId, firstName, lastName, phoneNumber);
        res.status(200).json({ message: 'Parent updated successfully', parent: updatedParent });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

module.exports = { addAdmin, getAnalytics, loginAdmin, addStudent, addTeacher, addParent, fetchClasses, fetchStudentsByClass, fetchStudentDetails, editStudent, editParent };