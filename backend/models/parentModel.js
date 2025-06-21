// models/parentModel.js

const db = require('../config/db');

// Find Parent by Username
exports.findParentByUsername = async (username) => {
    const query = `
        SELECT p.parent_id, u.password_hash
        FROM parents p
        JOIN users u ON p.parent_id = u.user_id
        WHERE u.username = $1 AND u.role = 'parent'
    `;
    const result = await db.query(query, [username]);
    return result.rows[0];
};

// View Children's Profiles
exports.getChildrenProfiles = async (parent_id) => {
    const query = `
        SELECT s.student_id, s.first_name, s.last_name, c.class_name, s.date_of_birth
        FROM students s
        JOIN classes c ON s.class_id = c.class_id
        WHERE s.parent_id = $1
    `;
    const result = await db.query(query, [parent_id]);
    return result.rows;
};

// View Children's Grades
exports.getChildrenGrades = async (parent_id) => {
    const query = `
        SELECT CONCAT(s.first_name, ' ', s.last_name) AS student_name,
               sub.subject_name, sem.semester_name, g.grade, g.comments
        FROM grades g
        JOIN students s ON g.student_id = s.student_id
        JOIN subjects sub ON g.subject_id = sub.subject_id
        JOIN semesters sem ON g.semester_id = sem.semester_id
        WHERE s.parent_id = $1
    `;
    const result = await db.query(query, [parent_id]);
    return result.rows;
};

// View Children's Attendance
exports.getChildrenAttendance = async (parent_id) => {
    const query = `
        SELECT CONCAT(s.first_name, ' ', s.last_name) AS student_name,
               sub.subject_name, sem.semester_name, a.date, a.period_number, a.status
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        JOIN subjects sub ON a.subject_id = sub.subject_id
        JOIN semesters sem ON a.semester_id = sem.semester_id
        WHERE s.parent_id = $1
    `;
    const result = await db.query(query, [parent_id]);
    return result.rows;
};

// View Materials for Children's Classes
exports.getChildrenMaterials = async (parent_id) => {
    const query = `
        SELECT c.class_name, sub.subject_name, sem.semester_name, m.title, m.file_path
        FROM materials m
        JOIN classes c ON m.class_id = c.class_id
        JOIN subjects sub ON m.subject_id = sub.subject_id
        JOIN semesters sem ON m.semester_id = sem.semester_id
        WHERE c.class_id IN (
            SELECT class_id FROM students WHERE parent_id = $1
        )
    `;
    const result = await db.query(query, [parent_id]);
    return result.rows;
};

// View Children's Assignments
exports.getChildrenAssignments = async (parent_id) => {
    const query = `
        SELECT a.assignment_id, c.class_name, sub.subject_name, sem.semester_name, a.title, a.description, a.due_date, a.file_path
        FROM assignments a
        JOIN classes c ON a.class_id = c.class_id
        JOIN subjects sub ON a.subject_id = sub.subject_id
        JOIN semesters sem ON a.semester_id = sem.semester_id
        WHERE c.class_id IN (
            SELECT class_id FROM students WHERE parent_id = $1
        )
    `;
    const result = await db.query(query, [parent_id]);
    return result.rows;
};

// View Children's Submissions
exports.getChildrenSubmissions = async (parent_id) => {
    const query = `
        SELECT sb.assignment_id, CONCAT(s.first_name, ' ', s.last_name) AS student_name,
               a.title AS assignment_title, sub.subject_name,
               sb.submitted_file_path, sb.submission_date, sb.grade, sb.feedback
        FROM submissions sb
        JOIN students s ON sb.student_id = s.student_id
        JOIN assignments a ON sb.assignment_id = a.assignment_id
        JOIN subjects sub ON a.subject_id = sub.subject_id
        WHERE s.parent_id = $1
    `;
    const result = await db.query(query, [parent_id]);
    return result.rows;
};

// Get first-time login information
exports.getFirstTimeInfo = async (userId) => {
    try {
        const query = `
            SELECT 
                u.user_id, u.username, u.email, u.role, u.created_at, u.password_reset_required,
                p.parent_id, p.first_name, p.last_name, p.phone_number
            FROM users u
            JOIN parents p ON u.user_id = p.parent_id
            WHERE u.user_id = $1 AND u.role = 'parent';
        `;
        const result = await db.query(query, [userId]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Complete profile setup
exports.completeSetup = async (userId, updateData) => {
    try {
        // Start a transaction
        const client = await db.connect();
        
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
                updateData.newPassword, 
                updateData.email, 
                userId
            ]);
            
            // Update parents table
            const updateParentQuery = `
                UPDATE parents 
                SET first_name = $1, last_name = $2, phone_number = $3
                WHERE parent_id = $4
                RETURNING parent_id, first_name, last_name, phone_number;
            `;
            const parentResult = await client.query(updateParentQuery, [
                updateData.firstName,
                updateData.lastName,
                updateData.phoneNumber,
                userId
            ]);
            
            await client.query('COMMIT');
            
            // Return combined user data
            return {
                ...userResult.rows[0],
                ...parentResult.rows[0]
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        throw error;
    }
};