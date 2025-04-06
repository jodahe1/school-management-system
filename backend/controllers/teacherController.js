// controllers/teacherController.js
const teacherModel = require('../models/teacherModel');
const pool = require('../config/db');

const teacherController = {
  // Get teacher profile
  getTeacherProfile: async (req, res) => {
    try {
      const { teacherId } = req; // Assuming teacherId is set from auth middleware
      const profile = await teacherModel.getTeacherProfile(teacherId);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get teacher's schedules
  getSchedules: async (req, res) => {
    try {
      const { teacherId } = req;
      const schedules = await teacherModel.getSchedules(teacherId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get attendance records
  getAttendanceRecords: async (req, res) => {
    try {
      const { teacherId } = req;
      const { classId, subjectId, date } = req.query;
      const attendance = await teacherModel.getAttendanceRecords(teacherId, classId, subjectId, date);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Record attendance
  recordAttendance: async (req, res) => {
    try {
      const { teacherId } = req;
      const { classId, subjectId, semesterId, date, periodNumber, attendanceData } = req.body;
      
      const result = await teacherModel.recordAttendance(
        teacherId, 
        classId, 
        subjectId, 
        semesterId, 
        date, 
        periodNumber, 
        attendanceData
      );
      
      res.json({ message: 'Attendance recorded successfully', result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get grades
  getGrades: async (req, res) => {
    try {
      const { teacherId } = req;
      const { classId, subjectId, semesterId } = req.query;
      const grades = await teacherModel.getGrades(teacherId, classId, subjectId, semesterId);
      res.json(grades);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Assign grade
  assignGrade: async (req, res) => {
    try {
      const { teacherId } = req;
      const { studentId, subjectId, semesterId, grade, comments } = req.body;
      
      const result = await teacherModel.assignGrade(
        teacherId, 
        studentId, 
        subjectId, 
        semesterId, 
        grade, 
        comments
      );
      
      res.json({ message: 'Grade assigned successfully', result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get materials
  getMaterials: async (req, res) => {
    try {
      const { teacherId } = req;
      const { classId, subjectId, semesterId } = req.query;
      const materials = await teacherModel.getMaterials(teacherId, classId, subjectId, semesterId);
      res.json(materials);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Upload material
  uploadMaterial: async (req, res) => {
    try {
      const { teacherId } = req;
      const { classId, subjectId, semesterId, title, filePath } = req.body;
      
      const result = await teacherModel.uploadMaterial(
        teacherId, 
        classId, 
        subjectId, 
        semesterId, 
        title, 
        filePath
      );
      
      res.json({ message: 'Material uploaded successfully', result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get assignments
  getAssignments: async (req, res) => {
    try {
      const { teacherId } = req;
      const { classId, subjectId, semesterId } = req.query;
      const assignments = await teacherModel.getAssignments(teacherId, classId, subjectId, semesterId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create assignment
  createAssignment: async (req, res) => {
    try {
      const { teacherId } = req;
      const { classId, subjectId, semesterId, title, description, dueDate, filePath } = req.body;
      
      const result = await teacherModel.createAssignment(
        teacherId, 
        classId, 
        subjectId, 
        semesterId, 
        title, 
        description, 
        dueDate, 
        filePath
      );
      
      res.json({ message: 'Assignment created successfully', result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get submissions
  getSubmissions: async (req, res) => {
    try {
      const { teacherId } = req;
      const { assignmentId } = req.query;
      const submissions = await teacherModel.getSubmissions(teacherId, assignmentId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Grade submission
  gradeSubmission: async (req, res) => {
    try {
      const { submissionId } = req.params;
      const { grade, feedback } = req.body;
      
      const result = await teacherModel.gradeSubmission(submissionId, grade, feedback);
      res.json({ message: 'Submission graded successfully', result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get chat messages
  getChatMessages: async (req, res) => {
    try {
      const { teacherId } = req;
      const { studentId } = req.query;
      const messages = await teacherModel.getChatMessages(teacherId, studentId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Send chat message
  sendChatMessage: async (req, res) => {
    try {
      const { teacherId } = req;
      const { receiverId, studentId, messageText } = req.body;
      
      const result = await teacherModel.sendChatMessage(
        teacherId, 
        receiverId, 
        studentId, 
        messageText
      );
      
      res.json({ message: 'Message sent successfully', result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = teacherController;