const dbQueries = require('../models/dbQueries');

// Post a Message
const postMessage = async (req, res) => {
    try {
        const { sender_id, student_id, recipient_role, message_text } = req.body;

        // Validate sender role and permissions
        const sender = await dbQueries.getUserRole(sender_id);
        if (!sender || !['student', 'teacher', 'parent'].includes(sender.role)) {
            return res.status(400).json({ message: 'Invalid sender role' });
        }

        // Validate student_id exists in students table
        const student = await dbQueries.getStudent(student_id);
        if (!student) {
            return res.status(404).json({ message: 'Invalid student ID' });
        }

        // Additional validation based on sender role
        if (sender.role === 'student') {
            if (recipient_role === 'teacher') {
                const isValidTeacher = await dbQueries.validateTeacherForStudent(student_id, sender_id);
                if (!isValidTeacher) {
                    return res.status(400).json({ message: 'Invalid teacher for this student' });
                }
            }
        } else if (sender.role === 'teacher') {
            const isValidStudent = await dbQueries.validateStudentForTeacher(student_id, sender_id);
            if (!isValidStudent) {
                return res.status(400).json({ 
                    message: 'Invalid student for this teacher',
                    details: {
                        student_id,
                        teacher_user_id: sender_id
                    }
                });
            }
        } else if (sender.role === 'parent') {
            if (student.parent_id !== sender.parent_id) {
                return res.status(400).json({ message: 'Student does not belong to this parent' });
            }
        }

        // Insert the message into the database
        const newMessage = await dbQueries.postMessage(sender_id, student_id, recipient_role, message_text);
        res.status(201).json({ message: 'Message posted successfully', data: newMessage });
    } catch (error) {
        console.error('Error posting message:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// View Messages
const getMessages = async (req, res) => {
    try {
        const { user_id, role } = req.query;

        // Validate user_id and role
        const user = await dbQueries.getUserRole(user_id);
        if (!user || user.role !== role) {
            return res.status(400).json({ message: 'Invalid user or role' });
        }

        let messages;
        if (role === 'parent') {
            messages = await dbQueries.getParentMessages(user.parent_id);
        } else if (role === 'student') {
            messages = await dbQueries.getStudentMessages(user_id);
        } else if (role === 'teacher') {
            messages = await dbQueries.getTeacherMessages(user_id);
        }

        if (!messages || messages.length === 0) {
            return res.status(200).json({ message: 'No messages found', messages: [] });
        }

        res.status(200).json({ message: 'Messages fetched successfully', messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

module.exports = {
    postMessage,
    getMessages,
};