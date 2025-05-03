const teacherModel = require('../models/teacherModel');

// Teacher Login
const loginTeacher = async (req, res) => {
    try {
        const { username, password } = req.body;
        const teacher = await teacherModel.verifyTeacher(username, password);
        if (!teacher) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json({ message: 'Login successful', teacher });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// View Profile
const getProfile = async (req, res) => {
    try {
        const { teacher_id } = req.query;
        const profile = await teacherModel.getTeacherProfile(teacher_id);
        if (!profile) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// View Schedule
const getSchedule = async (req, res) => {
    try {
        const { teacher_id } = req.query;
        const schedule = await teacherModel.getTeacherSchedule(teacher_id);
        if (schedule.length === 0) {
            return res.status(200).json({ message: 'No schedules found', schedule: [] });
        }
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Record Attendance
const recordAttendance = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, semester_id, date, period_number, attendance } = req.body;
        
        // Validate teacher access
        const isValid = await teacherModel.validateTeacherClassSubject(teacher_id, class_id, subject_id);
        if (!isValid) {
            return res.status(403).json({ message: 'Unauthorized for this class/subject' });
        }

        const result = await teacherModel.recordAttendance(teacher_id, class_id, subject_id, semester_id, date, period_number, attendance);
        res.status(201).json({ message: 'Attendance recorded', attendance: result });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Assign Grades (Updated with validation)
const assignGrades = async (req, res) => {
    try {
        const { teacher_id, student_id, subject_id, semester_id, grade, comments } = req.body;
        
        const isValid = await teacherModel.validateTeacherAccess(teacher_id, student_id, subject_id);
        if (!isValid) {
            return res.status(403).json({ message: 'Unauthorized to grade this student' });
        }

        const newGrade = await teacherModel.assignGrade(teacher_id, student_id, subject_id, semester_id, grade, comments);
        res.status(201).json({ message: 'Grade assigned', grade: newGrade });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Upload Materials (Updated with validation)
const uploadMaterials = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, semester_id, title, file_path } = req.body;
        
        const isValid = await teacherModel.validateTeacherClassSubject(teacher_id, class_id, subject_id);
        if (!isValid) {
            return res.status(403).json({ message: 'Unauthorized for this class/subject' });
        }

        const material = await teacherModel.uploadMaterial(teacher_id, class_id, subject_id, semester_id, title, file_path);
        res.status(201).json({ message: 'Material uploaded', material });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Create Assignment (Updated with validation)
const createAssignment = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, semester_id, title, description, due_date, file_path } = req.body;
        
        const isValid = await teacherModel.validateTeacherClassSubject(teacher_id, class_id, subject_id);
        if (!isValid) {
            return res.status(403).json({ message: 'Unauthorized for this class/subject' });
        }

        const assignment = await teacherModel.createAssignment(teacher_id, class_id, subject_id, semester_id, title, description, due_date, file_path);
        res.status(201).json({ message: 'Assignment created', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// View Submissions (Updated with validation)
const getSubmissions = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id } = req.query;
        
        if (!teacher_id) {
            return res.status(400).json({ message: 'Teacher ID required' });
        }

        const submissions = await teacherModel.getTeacherSubmissions(teacher_id, class_id, subject_id);
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get Classes for Teacher
const getTeacherClasses = async (req, res) => {
    try {
        const { teacher_id } = req.query;
        const classes = await teacherModel.getTeacherClasses(teacher_id);
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get Students in Class
const getClassStudents = async (req, res) => {
    try {
        const { class_id } = req.query;
        const students = await teacherModel.getClassStudents(class_id);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Get Student Details
const getStudentDetails = async (req, res) => {
    try {
        const { student_id } = req.query;
        const student = await teacherModel.getStudentDetails(student_id);
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};
const getStudentsForContext = async (req, res) => {
    const { teacher_id, class_id, subject_id, semester_id } = req.query;
    const students = await teacherModel.getStudentsForContext(teacher_id, class_id, subject_id, semester_id);
    
    if (!students) {
        return res.status(403).json({ message: 'Unauthorized or invalid context' });
    }

    res.status(200).json(students);
};
// Create announcement
const createAnnouncement = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, semester_id, title, content } = req.body;
        const file_path = req.file?.path;

        // Validate teacher access
        const isValidClass = await teacherModel.validateTeacherClass(teacher_id, class_id);
        if (!isValidClass) {
            return res.status(403).json({ message: 'Unauthorized for this class' });
        }

        // Create announcement
        const announcement = await teacherModel.createAnnouncement(
            teacher_id, class_id, subject_id, semester_id, title, content, file_path
        );
        
        res.status(201).json({ message: 'Announcement created', announcement });
    } catch (error) {
        res.status(500).json({ 
            message: 'Database error', 
            error: error.message 
        });
    }
};

// Get class announcements
const getClassAnnouncements = async (req, res) => {
    try {
        const { class_id, semester_id } = req.query;
        
        if (!class_id) {
            return res.status(400).json({ message: 'Class ID required' });
        }

        const announcements = await teacherModel.getClassAnnouncements(class_id, semester_id);
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ 
            message: 'Database error', 
            error: error.message 
        });
    }
};
module.exports = {
    loginTeacher,
    getProfile,
    getSchedule,
    recordAttendance,
    assignGrades,
    uploadMaterials,
    createAssignment,
    getSubmissions,
    getTeacherClasses,
    getClassStudents,
    getStudentDetails,
    getStudentsForContext,
    createAnnouncement,
    getClassAnnouncements
};