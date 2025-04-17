const ParentModel = require('../models/parentModel');
const db = require('../config/db');

// Parent Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const parent = await ParentModel.findParentByUsername(username);

        if (!parent || parent.password_hash !== password) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Fetch user data from users table
        const userQuery = `
            SELECT user_id, username, email
            FROM users
            WHERE user_id = $1
        `;
        const userResult = await db.query(userQuery, [parent.parent_id]);
        const user = userResult.rows[0];

        res.status(200).json({
            message: 'Login successful',
            parent: {
                user_id: user.user_id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// View Children's Profiles
exports.getChildrenProfiles = async (req, res) => {
    try {
        const { parent_id } = req.query;
        const profiles = await ParentModel.getChildrenProfiles(parent_id);
        res.status(200).json(profiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// View Children's Grades
exports.getChildrenGrades = async (req, res) => {
    try {
        const { parent_id } = req.query;
        const grades = await ParentModel.getChildrenGrades(parent_id);
        res.status(200).json(grades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// View Children's Attendance
exports.getChildrenAttendance = async (req, res) => {
    try {
        const { parent_id } = req.query;
        const attendance = await ParentModel.getChildrenAttendance(parent_id);
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// View Materials for Children's Classes
exports.getChildrenMaterials = async (req, res) => {
    try {
        const { parent_id } = req.query;
        const materials = await ParentModel.getChildrenMaterials(parent_id);
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// View Children's Assignments
exports.getChildrenAssignments = async (req, res) => {
    try {
        const { parent_id } = req.query;
        const assignments = await ParentModel.getChildrenAssignments(parent_id);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// View Children's Submissions
exports.getChildrenSubmissions = async (req, res) => {
    try {
        const { parent_id } = req.query;
        const submissions = await ParentModel.getChildrenSubmissions(parent_id);
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};