// models/teacherModel.js
const pool = require('../config/db');

const teacherModel = {
  // Get teacher profile
  getTeacherProfile: async (teacherId) => {
    const query = `
      SELECT u.user_id, u.email, t.first_name, t.last_name, t.subject_teaches
      FROM users u
      JOIN teachers t ON u.user_id = t.teacher_id
      WHERE u.user_id = $1 AND u.role = 'teacher'
    `;
    const result = await pool.query(query, [teacherId]);
    return result.rows[0];
  },

  // Get teacher's schedules
  getSchedules: async (teacherId) => {
    const query = `
      SELECT s.schedule_id, c.class_name, sub.subject_name, sem.semester_name,
             s.day_of_week, s.period_number, s.start_time, s.end_time
      FROM schedules s
      JOIN classes c ON s.class_id = c.class_id
      JOIN subjects sub ON s.subject_id = sub.subject_id
      JOIN semesters sem ON s.semester_id = sem.semester_id
      WHERE s.teacher_id = $1 AND sem.is_active = true
      ORDER BY s.day_of_week, s.period_number
    `;
    const result = await pool.query(query, [teacherId]);
    return result.rows;
  },

  // Get attendance records
  getAttendanceRecords: async (teacherId, classId, subjectId, date) => {
    let query = `
      SELECT a.attendance_id, s.student_id, s.first_name, s.last_name,
             c.class_name, sub.subject_name, a.date, a.period_number, a.status
      FROM attendance a
      JOIN students s ON a.student_id = s.student_id
      JOIN classes c ON a.class_id = c.class_id
      JOIN subjects sub ON a.subject_id = sub.subject_id
      WHERE a.teacher_id = $1
    `;
    const params = [teacherId];
    
    if (classId) {
      query += ` AND a.class_id = $${params.length + 1}`;
      params.push(classId);
    }
    if (subjectId) {
      query += ` AND a.subject_id = $${params.length + 1}`;
      params.push(subjectId);
    }
    if (date) {
      query += ` AND a.date = $${params.length + 1}`;
      params.push(date);
    }
    
    query += ' ORDER BY a.date DESC, a.period_number, s.last_name';
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Record attendance
  recordAttendance: async (teacherId, classId, subjectId, semesterId, date, periodNumber, attendanceData) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // First delete existing attendance for this class/period/date
      await client.query(
        `DELETE FROM attendance 
         WHERE teacher_id = $1 AND class_id = $2 AND subject_id = $3 
         AND semester_id = $4 AND date = $5 AND period_number = $6`,
        [teacherId, classId, subjectId, semesterId, date, periodNumber]
      );
      
      // Insert new attendance records
      for (const record of attendanceData) {
        await client.query(
          `INSERT INTO attendance 
           (student_id, class_id, teacher_id, subject_id, semester_id, date, period_number, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [record.studentId, classId, teacherId, subjectId, semesterId, date, periodNumber, record.status]
        );
      }
      
      await client.query('COMMIT');
      return { success: true, recordsUpdated: attendanceData.length };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Get grades
  getGrades: async (teacherId, classId, subjectId, semesterId) => {
    let query = `
      SELECT g.grade_id, s.student_id, s.first_name, s.last_name, c.class_name,
             sub.subject_name, sem.semester_name, g.grade, g.comments
      FROM grades g
      JOIN students s ON g.student_id = s.student_id
      JOIN classes c ON s.class_id = c.class_id
      JOIN subjects sub ON g.subject_id = sub.subject_id
      JOIN semesters sem ON g.semester_id = sem.semester_id
      WHERE g.teacher_id = $1
    `;
    const params = [teacherId];
    
    if (classId) {
      query += ` AND s.class_id = $${params.length + 1}`;
      params.push(classId);
    }
    if (subjectId) {
      query += ` AND g.subject_id = $${params.length + 1}`;
      params.push(subjectId);
    }
    if (semesterId) {
      query += ` AND g.semester_id = $${params.length + 1}`;
      params.push(semesterId);
    }
    
    query += ' ORDER BY s.last_name, s.first_name';
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Assign grade
  assignGrade: async (teacherId, studentId, subjectId, semesterId, grade, comments) => {
    // Check if grade exists for this student/subject/semester
    const checkQuery = `
      SELECT grade_id FROM grades 
      WHERE student_id = $1 AND subject_id = $2 AND semester_id = $3 AND teacher_id = $4
    `;
    const checkResult = await pool.query(checkQuery, [studentId, subjectId, semesterId, teacherId]);
    
    if (checkResult.rows.length > 0) {
      // Update existing grade
      const updateQuery = `
        UPDATE grades 
        SET grade = $1, comments = $2 
        WHERE grade_id = $3
        RETURNING *
      `;
      const result = await pool.query(updateQuery, [grade, comments, checkResult.rows[0].grade_id]);
      return result.rows[0];
    } else {
      // Insert new grade
      const insertQuery = `
        INSERT INTO grades 
        (student_id, teacher_id, subject_id, semester_id, grade, comments)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const result = await pool.query(insertQuery, 
        [studentId, teacherId, subjectId, semesterId, grade, comments]);
      return result.rows[0];
    }
  },

  // Get materials
  getMaterials: async (teacherId, classId, subjectId, semesterId) => {
    let query = `
      SELECT m.material_id, c.class_name, sub.subject_name, sem.semester_name,
             m.title, m.file_path, m.uploaded_at
      FROM materials m
      JOIN classes c ON m.class_id = c.class_id
      JOIN subjects sub ON m.subject_id = sub.subject_id
      JOIN semesters sem ON m.semester_id = sem.semester_id
      WHERE m.teacher_id = $1
    `;
    const params = [teacherId];
    
    if (classId) {
      query += ` AND m.class_id = $${params.length + 1}`;
      params.push(classId);
    }
    if (subjectId) {
      query += ` AND m.subject_id = $${params.length + 1}`;
      params.push(subjectId);
    }
    if (semesterId) {
      query += ` AND m.semester_id = $${params.length + 1}`;
      params.push(semesterId);
    }
    
    query += ' ORDER BY m.uploaded_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Upload material
  uploadMaterial: async (teacherId, classId, subjectId, semesterId, title, filePath) => {
    const query = `
      INSERT INTO materials 
      (teacher_id, class_id, subject_id, semester_id, title, file_path)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, 
      [teacherId, classId, subjectId, semesterId, title, filePath]);
    return result.rows[0];
  },

  // Get assignments
  getAssignments: async (teacherId, classId, subjectId, semesterId) => {
    let query = `
      SELECT a.assignment_id, c.class_name, sub.subject_name, sem.semester_name,
             a.title, a.description, a.due_date, a.file_path, a.created_at,
             (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.assignment_id) as submission_count
      FROM assignments a
      JOIN classes c ON a.class_id = c.class_id
      JOIN subjects sub ON a.subject_id = sub.subject_id
      JOIN semesters sem ON a.semester_id = sem.semester_id
      WHERE a.teacher_id = $1
    `;
    const params = [teacherId];
    
    if (classId) {
      query += ` AND a.class_id = $${params.length + 1}`;
      params.push(classId);
    }
    if (subjectId) {
      query += ` AND a.subject_id = $${params.length + 1}`;
      params.push(subjectId);
    }
    if (semesterId) {
      query += ` AND a.semester_id = $${params.length + 1}`;
      params.push(semesterId);
    }
    
    query += ' ORDER BY a.due_date DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Create assignment
  createAssignment: async (teacherId, classId, subjectId, semesterId, title, description, dueDate, filePath) => {
    const query = `
      INSERT INTO assignments 
      (teacher_id, class_id, subject_id, semester_id, title, description, due_date, file_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, 
      [teacherId, classId, subjectId, semesterId, title, description, dueDate, filePath]);
    return result.rows[0];
  },

  // Get submissions
  getSubmissions: async (teacherId, assignmentId) => {
    const query = `
      SELECT s.submission_id, st.student_id, st.first_name, st.last_name, 
             a.title as assignment_title, s.submitted_file_path, 
             s.submission_date, s.grade, s.feedback
      FROM submissions s
      JOIN students st ON s.student_id = st.student_id
      JOIN assignments a ON s.assignment_id = a.assignment_id
      WHERE a.teacher_id = $1 AND s.assignment_id = $2
      ORDER BY s.submission_date DESC
    `;
    const result = await pool.query(query, [teacherId, assignmentId]);
    return result.rows;
  },

  // Grade submission
  gradeSubmission: async (submissionId, grade, feedback) => {
    const query = `
      UPDATE submissions 
      SET grade = $1, feedback = $2 
      WHERE submission_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [grade, feedback, submissionId]);
    return result.rows[0];
  },

  // Get chat messages
  getChatMessages: async (teacherId, studentId) => {
    let query = `
      SELECT cm.message_id, cm.sender_id, cm.receiver_id, cm.student_id,
             cm.message_text, cm.sent_at, cm.is_read,
             sender.first_name as sender_first_name, sender.last_name as sender_last_name,
             receiver.first_name as receiver_first_name, receiver.last_name as receiver_last_name,
             s.first_name as student_first_name, s.last_name as student_last_name
      FROM chat_messages cm
      JOIN users sender ON cm.sender_id = sender.user_id
      JOIN users receiver ON cm.receiver_id = receiver.user_id
      JOIN students s ON cm.student_id = s.student_id
      WHERE cm.student_id = $1 AND (cm.sender_id = $2 OR cm.receiver_id = $2)
      ORDER BY cm.sent_at DESC
    `;
    const result = await pool.query(query, [studentId, teacherId]);
    return result.rows;
  },

  // Send chat message
  sendChatMessage: async (senderId, receiverId, studentId, messageText) => {
    const query = `
      INSERT INTO chat_messages 
      (sender_id, receiver_id, student_id, message_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [senderId, receiverId, studentId, messageText]);
    return result.rows[0];
  }
};

module.exports = teacherModel;