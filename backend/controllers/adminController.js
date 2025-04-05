// backend/controllers/adminController.js

// Import Admin Model
const adminModel = require('../models/adminModel');

// Add Admin
const addAdmin = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const newAdmin = await adminModel.createAdmin(username, password, email);
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Login Admin
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await adminModel.verifyAdmin(email, password);

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful', admin });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Analytics
const getAnalytics = async (req, res) => {
    try {
        const analytics = {
            total_students: 0,
            total_teachers: 0,
            total_parents: 0,
            total_admins: 0,
        };

        // Example: Query counts from the database
        const studentCount = await adminModel.getStudentsByClass();
        const teacherCount = await adminModel.getAllClasses(); // Replace with actual query
        const parentCount = await adminModel.getAllClasses(); // Replace with actual query
        const adminCount = await adminModel.getAllClasses(); // Replace with actual query

        analytics.total_students = studentCount.length;
        analytics.total_teachers = teacherCount.length;
        analytics.total_parents = parentCount.length;
        analytics.total_admins = adminCount.length;

        res.status(200).json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Add Student
const addStudent = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName, dob, classId, parentId } = req.body;
        const newStudent = await adminModel.createStudent(
            username,
            password,
            email,
            firstName,
            lastName,
            dob,
            classId,
            parentId
        );
        res.status(201).json(newStudent);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Add Teacher
const addTeacher = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName, subjectTeaches } = req.body;
        const newTeacher = await adminModel.createTeacher(
            username,
            password,
            email,
            firstName,
            lastName,
            subjectTeaches
        );
        res.status(201).json(newTeacher);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Add Parent
const addParent = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName, phoneNumber } = req.body;
        const newParent = await adminModel.createParent(
            username,
            password,
            email,
            firstName,
            lastName,
            phoneNumber
        );
        res.status(201).json(newParent);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Classes
const fetchClasses = async (req, res) => {
    try {
        const classes = await adminModel.getAllClasses();
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Students in a Class
const fetchStudentsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const students = await adminModel.getStudentsByClass(classId);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Student Details
const fetchStudentDetails = async (req, res) => {
    try {
        const { studentId } = req.params;
        const details = await adminModel.getStudentDetails(studentId);
        res.status(200).json(details);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Edit Student
const editStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { firstName, lastName, dob } = req.body;
        const updatedStudent = await adminModel.updateStudent(studentId, firstName, lastName, dob);
        res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Edit Parent
const editParent = async (req, res) => {
    try {
        const { parentId } = req.params;
        const { firstName, lastName, phoneNumber } = req.body;
        const updatedParent = await adminModel.updateParent(parentId, firstName, lastName, phoneNumber);
        res.status(200).json({ message: 'Parent updated successfully', parent: updatedParent });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Delete Student
const removeStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        await adminModel.deleteStudent(studentId);
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Delete Teacher
const removeTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        await adminModel.deleteTeacher(teacherId);
        res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Delete Parent
const removeParent = async (req, res) => {
    try {
        const { parentId } = req.params;
        await adminModel.deleteParent(parentId);
        res.status(200).json({ message: 'Parent deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Edit Teacher
const editTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { firstName, lastName, subjectTeaches } = req.body;
        const updatedTeacher = await adminModel.updateTeacher(teacherId, firstName, lastName, subjectTeaches);
        res.status(200).json({ message: 'Teacher updated successfully', teacher: updatedTeacher });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

module.exports = {
    addAdmin,
    loginAdmin,
    getAnalytics,
    addStudent,
    addTeacher,
    addParent,
    fetchClasses,
    fetchStudentsByClass,
    fetchStudentDetails,
    editStudent,
    editParent,
    removeStudent,
    removeTeacher,
    removeParent,
    editTeacher,
};