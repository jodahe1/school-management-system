const pool = require('../config/db');

// Create a new chat message
const createMessage = async (sender_id, sender_type, receiver_id, receiver_type, message_content, message_type = 'text') => {
    const query = `
        INSERT INTO chat_messages (sender_id, sender_type, receiver_id, receiver_type, message_content, message_type, sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *;
    `;
    const result = await pool.query(query, [sender_id, sender_type, receiver_id, receiver_type, message_content, message_type]);
    return result.rows[0];
};

// Get chat messages between two users
const getChatMessages = async (user1_id, user1_type, user2_id, user2_type, limit = 50, offset = 0) => {
    const query = `
        SELECT 
            cm.*,
            CASE 
                WHEN cm.sender_type = 'teacher' THEN t.first_name || ' ' || t.last_name
                WHEN cm.sender_type = 'student' THEN s.first_name || ' ' || s.last_name
                WHEN cm.sender_type = 'parent' THEN p.first_name || ' ' || p.last_name
            END as sender_name,
            CASE 
                WHEN cm.sender_type = 'teacher' THEN 'Teacher'
                WHEN cm.sender_type = 'student' THEN 'Student'
                WHEN cm.sender_type = 'parent' THEN 'Parent'
            END as sender_role
        FROM chat_messages cm
        LEFT JOIN teachers t ON cm.sender_id = t.teacher_id AND cm.sender_type = 'teacher'
        LEFT JOIN students s ON cm.sender_id = s.student_id AND cm.sender_type = 'student'
        LEFT JOIN parents p ON cm.sender_id = p.parent_id AND cm.sender_type = 'parent'
        WHERE (cm.sender_id = $1 AND cm.sender_type = $2 AND cm.receiver_id = $3 AND cm.receiver_type = $4)
           OR (cm.sender_id = $3 AND cm.sender_type = $4 AND cm.receiver_id = $1 AND cm.receiver_type = $2)
        ORDER BY cm.sent_at ASC
        LIMIT $5 OFFSET $6;
    `;
    const result = await pool.query(query, [user1_id, user1_type, user2_id, user2_type, limit, offset]);
    return result.rows;
};

// Get all chat conversations for a user
const getUserConversations = async (user_id, user_type) => {
    const query = `
        SELECT DISTINCT
            CASE 
                WHEN cm.sender_id = $1 AND cm.sender_type = $2 THEN cm.receiver_id
                ELSE cm.sender_id
            END as other_user_id,
            CASE 
                WHEN cm.sender_id = $1 AND cm.sender_type = $2 THEN cm.receiver_type
                ELSE cm.sender_type
            END as other_user_type,
            CASE 
                WHEN cm.sender_id = $1 AND cm.sender_type = $2 THEN 
                    CASE 
                        WHEN cm.receiver_type = 'teacher' THEN t.first_name || ' ' || t.last_name
                        WHEN cm.receiver_type = 'student' THEN s.first_name || ' ' || s.last_name
                        WHEN cm.receiver_type = 'parent' THEN p.first_name || ' ' || p.last_name
                    END
                ELSE 
                    CASE 
                        WHEN cm.sender_type = 'teacher' THEN t.first_name || ' ' || t.last_name
                        WHEN cm.sender_type = 'student' THEN s.first_name || ' ' || s.last_name
                        WHEN cm.sender_type = 'parent' THEN p.first_name || ' ' || p.last_name
                    END
            END as other_user_name,
            CASE 
                WHEN cm.sender_id = $1 AND cm.sender_type = $2 THEN cm.receiver_type
                ELSE cm.sender_type
            END as other_user_role,
            cm.message_content as last_message,
            cm.sent_at as last_message_time,
            cm.sender_id = $1 AND cm.sender_type = $2 as is_sent_by_me
        FROM chat_messages cm
        LEFT JOIN teachers t ON (cm.sender_id = t.teacher_id AND cm.sender_type = 'teacher') 
                            OR (cm.receiver_id = t.teacher_id AND cm.receiver_type = 'teacher')
        LEFT JOIN students s ON (cm.sender_id = s.student_id AND cm.sender_type = 'student') 
                             OR (cm.receiver_id = s.student_id AND cm.receiver_type = 'student')
        LEFT JOIN parents p ON (cm.sender_id = p.parent_id AND cm.sender_type = 'parent') 
                            OR (cm.receiver_id = p.parent_id AND cm.receiver_type = 'parent')
        WHERE (cm.sender_id = $1 AND cm.sender_type = $2) 
           OR (cm.receiver_id = $1 AND cm.receiver_type = $2)
        AND cm.sent_at = (
            SELECT MAX(sent_at) 
            FROM chat_messages 
            WHERE ((sender_id = $1 AND sender_type = $2 AND receiver_id = 
                    CASE WHEN cm.sender_id = $1 AND cm.sender_type = $2 THEN cm.receiver_id ELSE cm.sender_id END
                    AND receiver_type = 
                    CASE WHEN cm.sender_id = $1 AND cm.sender_type = $2 THEN cm.receiver_type ELSE cm.sender_type END)
                OR (receiver_id = $1 AND receiver_type = $2 AND sender_id = 
                    CASE WHEN cm.sender_id = $1 AND cm.sender_type = $2 THEN cm.receiver_id ELSE cm.sender_id END
                    AND sender_type = 
                    CASE WHEN cm.sender_id = $1 AND cm.sender_type = $2 THEN cm.receiver_type ELSE cm.sender_type END))
        )
        ORDER BY cm.sent_at DESC;
    `;
    const result = await pool.query(query, [user_id, user_type]);
    return result.rows;
};

// Mark messages as read
const markMessagesAsRead = async (receiver_id, receiver_type, sender_id, sender_type) => {
    const query = `
        UPDATE chat_messages 
        SET is_read = TRUE 
        WHERE receiver_id = $1 AND receiver_type = $2 
          AND sender_id = $3 AND sender_type = $4 
          AND is_read = FALSE;
    `;
    const result = await pool.query(query, [receiver_id, receiver_type, sender_id, sender_type]);
    return result.rowCount;
};

// Get unread message count for a user
const getUnreadCount = async (user_id, user_type) => {
    const query = `
        SELECT COUNT(*) as unread_count
        FROM chat_messages 
        WHERE receiver_id = $1 AND receiver_type = $2 AND is_read = FALSE;
    `;
    const result = await pool.query(query, [user_id, user_type]);
    return parseInt(result.rows[0].unread_count);
};

// Get user details for chat
const getUserDetails = async (user_id, user_type) => {
    let query = '';
    let params = [user_id];
    
    switch (user_type) {
        case 'teacher':
            query = `
                SELECT teacher_id as user_id, first_name, last_name, 'teacher' as user_type, subject_teaches
                FROM teachers 
                WHERE teacher_id = $1;
            `;
            break;
        case 'student':
            query = `
                SELECT s.student_id as user_id, s.first_name, s.last_name, 'student' as user_type, c.class_name
                FROM students s
                LEFT JOIN classes c ON s.class_id = c.class_id
                WHERE s.student_id = $1;
            `;
            break;
        case 'parent':
            query = `
                SELECT parent_id as user_id, first_name, last_name, 'parent' as user_type
                FROM parents 
                WHERE parent_id = $1;
            `;
            break;
        default:
            throw new Error('Invalid user type');
    }
    
    const result = await pool.query(query, params);
    return result.rows[0];
};

// Get related users for a student (their teachers and parents)
const getRelatedUsers = async (student_id) => {
    const query = `
        SELECT DISTINCT
            t.teacher_id as user_id,
            t.first_name,
            t.last_name,
            'teacher' as user_type,
            t.subject_teaches
        FROM teachers t
        JOIN schedules s ON t.teacher_id = s.teacher_id
        JOIN students st ON s.class_id = st.class_id
        WHERE st.student_id = $1
        
        UNION
        
        SELECT DISTINCT
            p.parent_id as user_id,
            p.first_name,
            p.last_name,
            'parent' as user_type,
            NULL as subject_teaches
        FROM parents p
        JOIN students st ON p.parent_id = st.parent_id
        WHERE st.student_id = $1;
    `;
    const result = await pool.query(query, [student_id]);
    return result.rows;
};

module.exports = {
    createMessage,
    getChatMessages,
    getUserConversations,
    markMessagesAsRead,
    getUnreadCount,
    getUserDetails,
    getRelatedUsers
}; 