const pool = require('../config/db');

// Post a message
const postMessage = async (req, res) => {
  const { sender_id, student_id, recipient_id, recipient_role, message_text } = req.body;

  // Validate input
  if (!sender_id || !recipient_role || !message_text) {
    return res.status(400).json({ message: 'sender_id, recipient_role, and message_text are required' });
  }

  if (!['student', 'teacher', 'parent'].includes(recipient_role)) {
    return res.status(400).json({ message: 'Invalid recipient_role' });
  }

  if (recipient_role === 'teacher' && !recipient_id) {
    return res.status(400).json({ message: 'recipient_id is required for teacher messages' });
  }

  if (recipient_role !== 'teacher' && !student_id) {
    return res.status(400).json({ message: 'student_id is required for student or parent messages' });
  }

  try {
    // Verify sender exists and get their role
    const senderCheck = await pool.query(
      'SELECT role FROM users WHERE user_id = $1',
      [sender_id]
    );
    if (senderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Sender not found' });
    }
    const senderRole = senderCheck.rows[0].role;

    let class_id, parent_id;
    if (student_id) {
      // Verify student exists
      const studentCheck = await pool.query(
        'SELECT class_id, parent_id FROM students WHERE student_id = $1',
        [student_id]
      );
      if (studentCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }
      ({ class_id, parent_id } = studentCheck.rows[0]);
    }

    // Verify recipient_id for teacher messages
    if (recipient_id) {
      const recipientCheck = await pool.query(
        'SELECT role FROM users WHERE user_id = $1 AND role = $2',
        [recipient_id, 'teacher']
      );
      if (recipientCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Recipient teacher not found' });
      }
    }

    // Role-based validations
    if (senderRole === 'student') {
      if (!student_id || sender_id !== student_id) {
        return res.status(403).json({ message: 'Students can only send messages about themselves' });
      }
      if (recipient_role === 'teacher' && recipient_id) {
        const teacherCheck = await pool.query(
          'SELECT 1 FROM class_teacher_subject WHERE class_id = $1 AND teacher_id = $2',
          [class_id, recipient_id]
        );
        if (teacherCheck.rows.length === 0) {
          return res.status(403).json({ message: 'Teacher does not teach this student’s class' });
        }
      }
      if (recipient_role === 'parent' && parent_id !== sender_id) {
        return res.status(403).json({ message: 'Invalid parent recipient' });
      }
    } else if (senderRole === 'teacher') {
      if (student_id) {
        const classCheck = await pool.query(
          'SELECT 1 FROM class_teacher_subject WHERE teacher_id = $1 AND class_id = $2',
          [sender_id, class_id]
        );
        if (classCheck.rows.length === 0) {
          return res.status(403).json({ message: 'Teacher does not teach this student’s class' });
        }
      }
      if (recipient_role === 'parent' && student_id && parent_id === null) {
        return res.status(403).json({ message: 'No parent associated with this student' });
      }
    } else if (senderRole === 'parent') {
      if (student_id && parent_id !== sender_id) {
        return res.status(403).json({ message: 'Parent can only send messages about their own child' });
      }
      if (recipient_role === 'teacher' && recipient_id && student_id) {
        const teacherCheck = await pool.query(
          'SELECT 1 FROM class_teacher_subject WHERE class_id = $1 AND teacher_id = $2',
          [class_id, recipient_id]
        );
        if (teacherCheck.rows.length === 0) {
          return res.status(403).json({ message: 'Teacher does not teach this student’s class' });
        }
      }
    } else {
      return res.status(403).json({ message: 'Invalid sender role' });
    }

    // Insert message
    const result = await pool.query(
      `
      INSERT INTO message_board (sender_id, student_id, recipient_id, recipient_role, message_text)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING message_id, sender_id, student_id, recipient_id, recipient_role, message_text, posted_at
      `,
      [sender_id, student_id || null, recipient_id || null, recipient_role, message_text]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch messages
const getMessages = async (req, res) => {
  const { user_id, role } = req.query;

  if (!user_id || !role) {
    return res.status(400).json({ message: 'user_id and role are required' });
  }

  if (!['student', 'teacher', 'parent'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    // Verify user exists and role matches
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE user_id = $1',
      [user_id]
    );
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== role) {
      return res.status(403).json({ message: 'Invalid user or role' });
    }

    let query;
    const queryParams = [user_id];

    if (role === 'parent') {
      query = `
        SELECT 
          mb.message_id,
          u.first_name || ' ' || u.last_name AS sender_name,
          mb.student_id,
          s.first_name AS student_first_name,
          s.last_name AS student_last_name,
          mb.recipient_role,
          mb.recipient_id,
          mb.message_text,
          mb.posted_at
        FROM message_board mb
        JOIN users u ON mb.sender_id = u.user_id
        JOIN students s ON mb.student_id = s.student_id
        WHERE mb.student_id IN (SELECT student_id FROM students WHERE parent_id = $1)
        ORDER BY mb.posted_at DESC
      `;
    } else if (role === 'teacher') {
      query = `
        SELECT 
          mb.message_id,
          u.first_name || ' ' || u.last_name AS sender_name,
          mb.student_id,
          s.first_name AS student_first_name,
          s.last_name AS student_last_name,
          mb.recipient_role,
          mb.recipient_id,
          mb.message_text,
          mb.posted_at
        FROM message_board mb
        JOIN users u ON mb.sender_id = u.user_id
        JOIN students s ON mb.student_id = s.student_id
        JOIN class_teacher_subject cts ON s.class_id = cts.class_id
        WHERE (mb.recipient_role = 'teacher' AND cts.teacher_id = $1)
           OR (mb.sender_id = $1)
        ORDER BY mb.posted_at DESC
      `;
    } else if (role === 'student') {
      query = `
        SELECT 
          mb.message_id,
          u.first_name || ' ' || u.last_name AS sender_name,
          mb.student_id,
          s.first_name AS student_first_name,
          s.last_name AS student_last_name,
          mb.recipient_role,
          mb.recipient_id,
          mb.message_text,
          mb.posted_at
        FROM message_board mb
        JOIN users u ON mb.sender_id = u.user_id
        JOIN students s ON mb.student_id = s.student_id
        WHERE (mb.recipient_role = 'student' AND mb.student_id = $1)
           OR (mb.sender_id = $1)
        ORDER BY mb.posted_at DESC
      `;
    }

    const messages = await pool.query(query, queryParams);
    res.status(200).json(messages.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch classes for a teacher
const getClassesForTeacher = async (req, res) => {
  const { teacher_id } = req.query;

  if (!teacher_id) {
    return res.status(400).json({ message: 'teacher_id is required' });
  }

  try {
    // Verify teacher exists
    const teacherCheck = await pool.query(
      'SELECT role FROM users WHERE user_id = $1 AND role = $2',
      [teacher_id, 'teacher']
    );
    if (teacherCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Fetch classes taught by the teacher
    const classes = await pool.query(
      `
      SELECT DISTINCT
          c.class_id,
          c.class_name
      FROM class_teacher_subject cts
      JOIN classes c ON cts.class_id = c.class_id
      WHERE cts.teacher_id = $1
      ORDER BY c.class_name
      `,
      [teacher_id]
    );

    res.status(200).json(classes.rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch students in a class for a teacher
const getStudentsInClass = async (req, res) => {
  const { teacher_id, class_id } = req.query;

  if (!teacher_id || !class_id) {
    return res.status(400).json({ message: 'teacher_id and class_id are required' });
  }

  try {
    // Verify teacher exists
    const teacherCheck = await pool.query(
      'SELECT role FROM users WHERE user_id = $1 AND role = $2',
      [teacher_id, 'teacher']
    );
    if (teacherCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Verify teacher teaches the class
    const classCheck = await pool.query(
      'SELECT 1 FROM class_teacher_subject WHERE teacher_id = $1 AND class_id = $2',
      [teacher_id, class_id]
    );
    if (classCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Teacher does not teach this class' });
    }

    // Fetch students in the class
    const students = await pool.query(
      `
      SELECT
          s.student_id,
          s.first_name,
          s.last_name,
          u.username,
          u.email
      FROM students s
      JOIN users u ON s.student_id = u.user_id
      WHERE s.class_id = $1
      ORDER BY s.last_name, s.first_name
      `,
      [class_id]
    );

    res.status(200).json(students.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch teachers who taught a student
const getTeachersForStudent = async (req, res) => {
  const { student_id } = req.query;

  if (!student_id) {
    return res.status(400).json({ message: 'student_id is required' });
  }

  try {
    // Verify student exists
    const studentCheck = await pool.query(
      'SELECT student_id FROM students WHERE student_id = $1',
      [student_id]
    );
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch teachers who teach the student's class
    const teachers = await pool.query(
      `
      SELECT DISTINCT
          t.teacher_id,
          t.first_name,
          t.last_name,
          t.subject_teaches,
          u.username,
          u.email
      FROM students s
      JOIN class_teacher_subject cts ON s.class_id = cts.class_id
      JOIN teachers t ON cts.teacher_id = t.teacher_id
      JOIN users u ON t.teacher_id = u.user_id
      WHERE s.student_id = $1
      ORDER BY t.last_name, t.first_name
      `,
      [student_id]
    );

    if (teachers.rows.length === 0) {
      return res.status(200).json({ message: 'No teachers found for this student', teachers: [] });
    }

    res.status(200).json(teachers.rows);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch teachers for a parent
const getTeachersForParent = async (req, res) => {
  const { parent_id } = req.query;

  if (!parent_id) {
    return res.status(400).json({ message: 'parent_id is required' });
  }

  try {
    // Verify parent exists
    const parentCheck = await pool.query(
      'SELECT role FROM users WHERE user_id = $1 AND role = $2',
      [parent_id, 'parent']
    );
    if (parentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Fetch teachers for all children of the parent
    const teachers = await pool.query(
      `
      SELECT DISTINCT
          t.teacher_id,
          u.first_name,
          u.last_name,
          sub.subject_name AS subject_teaches
      FROM students s
      JOIN class_teacher_subject cts ON s.class_id = cts.class_id
      JOIN teachers t ON cts.teacher_id = t.teacher_id
      JOIN users u ON t.teacher_id = u.user_id
      JOIN subjects sub ON cts.subject_id = sub.subject_id
      WHERE s.parent_id = $1
      ORDER BY u.last_name, u.first_name
      `,
      [parent_id]
    );

    res.status(200).json(teachers.rows);
  } catch (error) {
    console.error('Error fetching teachers for parent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  postMessage,
  getMessages,
  getClassesForTeacher,
  getStudentsInClass,
  getTeachersForStudent,
  getTeachersForParent
};