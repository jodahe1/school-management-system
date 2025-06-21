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
            SELECT user_id, username, email, role, password_reset_required
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
                email: user.email,
                role: user.role,
                password_reset_required: user.password_reset_required
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

// Get first-time login info
exports.getFirstTimeInfo = async (req, res) => {
    try {
        const { user_id } = req.query;
        const info = await ParentModel.getFirstTimeInfo(user_id);
        if (!info) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Complete profile setup
exports.completeSetup = async (req, res) => {
    try {
        const { user_id, currentPassword, newPassword, firstName, lastName, email, phoneNumber } = req.body;
        
        // Validate current password by checking against the user's current password
        const validatePasswordQuery = `
            SELECT password_hash FROM users WHERE user_id = $1 AND role = 'parent';
        `;
        const passwordResult = await db.query(validatePasswordQuery, [user_id]);
        
        if (passwordResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (passwordResult.rows[0].password_hash !== currentPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        // Update user information
        const updatedUser = await ParentModel.completeSetup(user_id, {
            newPassword,
            firstName,
            lastName,
            email,
            phoneNumber
        });
        
        res.status(200).json({ 
            message: 'Profile setup completed successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Complete setup error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get profile information
exports.getProfile = async (req, res) => {
    try {
        const { user_id } = req.query;
        const profile = await ParentModel.getProfile(user_id);
        if (!profile) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { user_id, currentPassword, newPassword, firstName, lastName, email, phoneNumber } = req.body;
        
        // If password change is requested, validate current password
        if (currentPassword && newPassword) {
            const validatePasswordQuery = `
                SELECT password_hash FROM users WHERE user_id = $1 AND role = 'parent';
            `;
            const passwordResult = await db.query(validatePasswordQuery, [user_id]);
            
            if (passwordResult.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            if (passwordResult.rows[0].password_hash !== currentPassword) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
        }
        
        // Update user information
        const updatedUser = await ParentModel.updateProfile(user_id, {
            newPassword,
            firstName,
            lastName,
            email,
            phoneNumber
        });
        
        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: error.message });
    }
};