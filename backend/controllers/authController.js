// backend/controllers/authController.js
const pool = require('../config/db');

// Unified Login Function using RBAC
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        console.log('Login attempt:', { username, password: '***' });
        
        // Query the users table to find the user
        const query = `
            SELECT 
                user_id, 
                username, 
                password_hash, 
                email, 
                role, 
                created_at, 
                password_reset_required, 
                deleted_at
            FROM users 
            WHERE username = $1 AND deleted_at IS NULL
        `;
        
        const result = await pool.query(query, [username]);
        
        if (result.rows.length === 0) {
            console.log('Login failed: No user found with username:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        // Check if password matches
        if (user.password_hash !== password) {
            console.log('Login failed: Password mismatch for user:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        console.log('Login successful for user:', { username: user.username, role: user.role });
        
        // Return user data based on role
        const responseData = {
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role,
                password_reset_required: user.password_reset_required,
                created_at: user.created_at
            }
        };
        
        // Add role-specific data if needed
        if (user.role === 'student') {
            responseData.student = responseData.user;
        } else if (user.role === 'teacher') {
            responseData.teacher = responseData.user;
        } else if (user.role === 'parent') {
            responseData.parent = responseData.user;
        } else if (user.role === 'admin') {
            responseData.admin = responseData.user;
        }
        
        res.status(200).json(responseData);
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get user profile information based on role
const getUserProfile = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        // Get user basic info
        const userQuery = `
            SELECT user_id, username, email, role, created_at, password_reset_required
            FROM users 
            WHERE user_id = $1 AND deleted_at IS NULL
        `;
        
        const userResult = await pool.query(userQuery, [user_id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const user = userResult.rows[0];
        let profileData = { ...user };
        
        // Get role-specific information
        switch (user.role) {
            case 'student':
                const studentQuery = `
                    SELECT s.student_id, s.first_name, s.last_name, s.date_of_birth, 
                           c.class_name, c.class_id
                    FROM students s
                    LEFT JOIN classes c ON s.class_id = c.class_id
                    WHERE s.student_id = $1
                `;
                const studentResult = await pool.query(studentQuery, [user_id]);
                if (studentResult.rows.length > 0) {
                    profileData = { ...profileData, ...studentResult.rows[0] };
                }
                break;
                
            case 'teacher':
                const teacherQuery = `
                    SELECT t.teacher_id, t.first_name, t.last_name, t.subject_teaches
                    FROM teachers t
                    WHERE t.teacher_id = $1
                `;
                const teacherResult = await pool.query(teacherQuery, [user_id]);
                if (teacherResult.rows.length > 0) {
                    profileData = { ...profileData, ...teacherResult.rows[0] };
                }
                break;
                
            case 'parent':
                const parentQuery = `
                    SELECT p.parent_id, p.first_name, p.last_name, p.phone_number
                    FROM parents p
                    WHERE p.parent_id = $1
                `;
                const parentResult = await pool.query(parentQuery, [user_id]);
                if (parentResult.rows.length > 0) {
                    profileData = { ...profileData, ...parentResult.rows[0] };
                }
                break;
                
            case 'admin':
                // Admin doesn't have additional profile info
                break;
        }
        
        res.status(200).json(profileData);
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { user_id } = req.params;
        const updateData = req.body;
        
        // Start a transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Update users table
            let updateUserQuery = `
                UPDATE users 
                SET email = $1
            `;
            let userParams = [updateData.email];
            let paramIndex = 2;
            
            // Add password update if provided
            if (updateData.newPassword) {
                updateUserQuery += `, password_hash = $${paramIndex}`;
                userParams.push(updateData.newPassword);
                paramIndex++;
            }
            
            updateUserQuery += ` WHERE user_id = $${paramIndex} RETURNING user_id, username, email, role;`;
            userParams.push(user_id);
            
            const userResult = await client.query(updateUserQuery, userParams);
            
            if (userResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'User not found' });
            }
            
            let profileResult = null;
            
            // Update role-specific table
            switch (userResult.rows[0].role) {
                case 'student':
                    const updateStudentQuery = `
                        UPDATE students 
                        SET first_name = $1, last_name = $2, date_of_birth = $3
                        WHERE student_id = $4
                        RETURNING student_id, first_name, last_name, date_of_birth;
                    `;
                    profileResult = await client.query(updateStudentQuery, [
                        updateData.firstName,
                        updateData.lastName,
                        updateData.dateOfBirth,
                        user_id
                    ]);
                    break;
                    
                case 'teacher':
                    const updateTeacherQuery = `
                        UPDATE teachers 
                        SET first_name = $1, last_name = $2
                        WHERE teacher_id = $3
                        RETURNING teacher_id, first_name, last_name, subject_teaches;
                    `;
                    profileResult = await client.query(updateTeacherQuery, [
                        updateData.firstName,
                        updateData.lastName,
                        user_id
                    ]);
                    break;
                    
                case 'parent':
                    const updateParentQuery = `
                        UPDATE parents 
                        SET first_name = $1, last_name = $2, phone_number = $3
                        WHERE parent_id = $4
                        RETURNING parent_id, first_name, last_name, phone_number;
                    `;
                    profileResult = await client.query(updateParentQuery, [
                        updateData.firstName,
                        updateData.lastName,
                        updateData.phoneNumber,
                        user_id
                    ]);
                    break;
            }
            
            await client.query('COMMIT');
            
            // Return combined user data
            const responseData = { ...userResult.rows[0] };
            if (profileResult && profileResult.rows.length > 0) {
                Object.assign(responseData, profileResult.rows[0]);
            }
            
            res.status(200).json(responseData);
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Complete first-time setup
const completeSetup = async (req, res) => {
    try {
        const { user_id } = req.params;
        const setupData = req.body;
        
        // Start a transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Update users table
            const updateUserQuery = `
                UPDATE users 
                SET password_hash = $1, email = $2, password_reset_required = FALSE
                WHERE user_id = $3
                RETURNING user_id, username, email, role;
            `;
            const userResult = await client.query(updateUserQuery, [
                setupData.newPassword, 
                setupData.email, 
                user_id
            ]);
            
            if (userResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'User not found' });
            }
            
            let profileResult = null;
            
            // Update role-specific table
            switch (userResult.rows[0].role) {
                case 'student':
                    const updateStudentQuery = `
                        UPDATE students 
                        SET first_name = $1, last_name = $2, date_of_birth = $3
                        WHERE student_id = $4
                        RETURNING student_id, first_name, last_name, date_of_birth;
                    `;
                    profileResult = await client.query(updateStudentQuery, [
                        setupData.firstName,
                        setupData.lastName,
                        setupData.dateOfBirth,
                        user_id
                    ]);
                    break;
                    
                case 'teacher':
                    const updateTeacherQuery = `
                        UPDATE teachers 
                        SET first_name = $1, last_name = $2
                        WHERE teacher_id = $3
                        RETURNING teacher_id, first_name, last_name, subject_teaches;
                    `;
                    profileResult = await client.query(updateTeacherQuery, [
                        setupData.firstName,
                        setupData.lastName,
                        user_id
                    ]);
                    break;
                    
                case 'parent':
                    const updateParentQuery = `
                        UPDATE parents 
                        SET first_name = $1, last_name = $2, phone_number = $3
                        WHERE parent_id = $4
                        RETURNING parent_id, first_name, last_name, phone_number;
                    `;
                    profileResult = await client.query(updateParentQuery, [
                        setupData.firstName,
                        setupData.lastName,
                        setupData.phoneNumber,
                        user_id
                    ]);
                    break;
            }
            
            await client.query('COMMIT');
            
            // Return combined user data
            const responseData = { ...userResult.rows[0] };
            if (profileResult && profileResult.rows.length > 0) {
                Object.assign(responseData, profileResult.rows[0]);
            }
            
            res.status(200).json(responseData);
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('Complete setup error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get first-time login information
const getFirstTimeInfo = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        // Get user basic info
        const userQuery = `
            SELECT user_id, username, email, role, created_at, password_reset_required
            FROM users 
            WHERE user_id = $1 AND deleted_at IS NULL
        `;
        
        const userResult = await pool.query(userQuery, [user_id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const user = userResult.rows[0];
        let profileData = { ...user };
        
        // Get role-specific information
        switch (user.role) {
            case 'student':
                const studentQuery = `
                    SELECT s.student_id, s.first_name, s.last_name, s.date_of_birth, c.class_name
                    FROM students s
                    LEFT JOIN classes c ON s.class_id = c.class_id
                    WHERE s.student_id = $1
                `;
                const studentResult = await pool.query(studentQuery, [user_id]);
                if (studentResult.rows.length > 0) {
                    profileData = { ...profileData, ...studentResult.rows[0] };
                }
                break;
                
            case 'teacher':
                const teacherQuery = `
                    SELECT t.teacher_id, t.first_name, t.last_name, t.subject_teaches
                    FROM teachers t
                    WHERE t.teacher_id = $1
                `;
                const teacherResult = await pool.query(teacherQuery, [user_id]);
                if (teacherResult.rows.length > 0) {
                    profileData = { ...profileData, ...teacherResult.rows[0] };
                }
                break;
                
            case 'parent':
                const parentQuery = `
                    SELECT p.parent_id, p.first_name, p.last_name, p.phone_number
                    FROM parents p
                    WHERE p.parent_id = $1
                `;
                const parentResult = await pool.query(parentQuery, [user_id]);
                if (parentResult.rows.length > 0) {
                    profileData = { ...profileData, ...parentResult.rows[0] };
                }
                break;
        }
        
        res.status(200).json(profileData);
        
    } catch (error) {
        console.error('Get first-time info error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

module.exports = {
    login,
    getUserProfile,
    updateUserProfile,
    completeSetup,
    getFirstTimeInfo
}; 