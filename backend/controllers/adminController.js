// backend/controllers/adminController.js

const adminModel = require('../models/adminModel');

// Add Admin
const addAdmin = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const newAdmin = await adminModel.createAdmin(username, password, email);
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Login Admin
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await adminModel.verifyAdmin(email, password);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json({ message: 'Login successful', admin });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Analytics
const getAnalytics = async (req, res) => {
    try {
        const allUsers = await adminModel.getAllUsers();

        console.log(allUsers); // ⬅️ ADD THIS LINE

        const analytics = {
            total_students: allUsers.filter(user => user.role === 'student').length,
            total_teachers: allUsers.filter(user => user.role === 'teacher').length,
            total_parents: allUsers.filter(user => user.role === 'parent').length,
            total_admins: allUsers.filter(user => user.role === 'admin').length
        };

        res.status(200).json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};



// Add Student
const addStudent = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName, dob, classId, parentId } = req.body;
        const newStudent = await adminModel.createStudent(
            username,
            password,
            email,
            firstName,
            lastName,
            dob,
            classId,
            parentId
        );
        res.status(201).json(newStudent);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Add Teacher
const addTeacher = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName, subjectTeaches } = req.body;
        const newTeacher = await adminModel.createTeacher(
            username,
            password,
            email,
            firstName,
            lastName,
            subjectTeaches
        );
        res.status(201).json(newTeacher);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Add Parent
const addParent = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName, phoneNumber } = req.body;
        const newParent = await adminModel.createParent(
            username,
            password,
            email,
            firstName,
            lastName,
            phoneNumber
        );
        res.status(201).json(newParent);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Classes
const fetchClasses = async (req, res) => {
    try {
        const classes = await adminModel.getAllClasses();
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Students in a Class
const fetchStudentsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const students = await adminModel.getStudentsByClass(classId);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Student Details
const fetchStudentDetails = async (req, res) => {
    try {
        const { studentId } = req.params;
        const details = await adminModel.getStudentDetails(studentId);
        res.status(200).json(details);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Edit Student
const editStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { firstName, lastName, dob } = req.body;
        const updatedStudent = await adminModel.updateStudent(studentId, firstName, lastName, dob);
        res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Edit Parent
const editParent = async (req, res) => {
    try {
        const { parentId } = req.params;
        const { firstName, lastName, phoneNumber } = req.body;
        const updatedParent = await adminModel.updateParent(parentId, firstName, lastName, phoneNumber);
        res.status(200).json({ message: 'Parent updated successfully', parent: updatedParent });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Delete Student
const removeStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        await adminModel.deleteStudent(studentId);
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Delete Teacher
const removeTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        await adminModel.deleteTeacher(teacherId);
        res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Delete Parent
const removeParent = async (req, res) => {
    try {
        const { parentId } = req.params;
        await adminModel.deleteParent(parentId);
        res.status(200).json({ message: 'Parent deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Edit Teacher
const editTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { firstName, lastName, subjectTeaches } = req.body;
        const updatedTeacher = await adminModel.updateTeacher(teacherId, firstName, lastName, subjectTeaches);
        res.status(200).json({ message: 'Teacher updated successfully', teacher: updatedTeacher });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch All Teachers
const fetchTeachers = async (req, res) => {
    try {
        const teachers = await adminModel.getAllTeachers();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch All Schedules
const fetchSchedules = async (req, res) => {
    try {
        const schedules = await adminModel.getAllSchedules();
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Add Schedule
const addSchedule = async (req, res) => {
    try {
        const { classId, teacherId, subjectId, semesterId, dayOfWeek, periodNumber, startTime, endTime, createdBy } = req.body;
        const newSchedule = await adminModel.addSchedule(
            classId,
            teacherId,
            subjectId,
            semesterId,
            dayOfWeek,
            periodNumber,
            startTime,
            endTime,
            createdBy
        );
        res.status(201).json(newSchedule);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};


// Update Schedule
const updateSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { classId, teacherId, subjectId, semesterId, dayOfWeek, periodNumber, startTime, endTime } = req.body;
        const updatedSchedule = await adminModel.updateSchedule(
            scheduleId,
            classId,
            teacherId,
            subjectId,
            semesterId,
            dayOfWeek,
            periodNumber,
            startTime,
            endTime
        );
        res.status(200).json({ message: 'Schedule updated successfully', schedule: updatedSchedule });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Delete Schedule
const deleteSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        await adminModel.deleteSchedule(scheduleId);
        res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Schedules for a Specific Class
const fetchSchedulesForClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const schedules = await adminModel.getSchedulesByClass(classId);
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error fetching schedules for class:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch All Teachers (For Dropdown)
const fetchAllTeachers = async (req, res) => {
    try {
        const teachers = await adminModel.getAllTeachersForDropdown();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch All Subjects (For Dropdown)
const fetchAllSubjects = async (req, res) => {
    try {
        const subjects = await adminModel.getAllSubjectsForDropdown();
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch All Semesters (For Dropdown)
const fetchAllSemesters = async (req, res) => {
    try {
        const semesters = await adminModel.getAllSemestersForDropdown();
        res.status(200).json(semesters);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch Single Schedule by ID
const fetchScheduleById = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const schedule = await adminModel.getScheduleById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Semester Management Controllers
const manageSemesters = async (req, res) => {
    try {
        const semesters = await adminModel.getAllSemesters();
        res.status(200).json(semesters);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

const createSemester = async (req, res) => {
    try {
        const { semesterName, startDate, endDate, isActive } = req.body;
        
        // Validate required fields
        if (!semesterName || !startDate || !endDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: 'Start date must be before end date' });
        }

        const newSemester = await adminModel.addSemester(
            semesterName,
            startDate,
            endDate,
            isActive || false
        );
        res.status(201).json(newSemester);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

const editSemester = async (req, res) => {
    try {
        const { semesterId } = req.params;
        const { semesterName, startDate, endDate, isActive } = req.body;

        // Validate required fields
        if (!semesterName || !startDate || !endDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: 'Start date must be before end date' });
        }

        const updatedSemester = await adminModel.updateSemester(
            semesterId,
            semesterName,
            startDate,
            endDate,
            isActive
        );

        if (!updatedSemester) {
            return res.status(404).json({ message: 'Semester not found' });
        }

        res.status(200).json(updatedSemester);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

const removeSemester = async (req, res) => {
    try {
        const { semesterId } = req.params;
        const deletedSemester = await adminModel.deleteSemester(semesterId);

        if (!deletedSemester) {
            return res.status(404).json({ message: 'Semester not found' });
        }

        res.status(200).json({ message: 'Semester deleted successfully' });
    } catch (error) {
        if (error.message.includes('Cannot delete semester')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Class Management Controllers
const manageClasses = async (req, res) => {
    try {
        const classes = await adminModel.getAllClasses();
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

const createClass = async (req, res) => {
    try {
        const { className } = req.body;

        if (!className) {
            return res.status(400).json({ message: 'Class name is required' });
        }

        const newClass = await adminModel.addClass(className);
        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

const editClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { className } = req.body;

        if (!className) {
            return res.status(400).json({ message: 'Class name is required' });
        }

        const updatedClass = await adminModel.updateClass(classId, className);

        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.status(200).json(updatedClass);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

const removeClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const deletedClass = await adminModel.deleteClass(classId);

        if (!deletedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        if (error.message.includes('Cannot delete class')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Add these controller functions:
const getTeachersByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const teachers = await adminModel.getTeachersByClass(classId);
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

const getSubjectsByClassAndTeacher = async (req, res) => {
    try {
        const { classId, teacherId } = req.params;
        const subjects = await adminModel.getSubjectsByClassAndTeacher(classId, teacherId);
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Fetch All Admins
const fetchAllAdmins = async (req, res) => {
    try {
        const admins = await adminModel.getAllAdmins();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

// Delete Admin
const removeAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;
        await adminModel.deleteAdmin(adminId);
        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

module.exports = {
    addAdmin,
    loginAdmin,
    getAnalytics,
    addStudent,
    addTeacher,
    addParent,
    fetchClasses,
    fetchStudentsByClass,
    fetchStudentDetails,
    editStudent,
    editParent,
    removeStudent,
    removeTeacher,
    removeParent,
    editTeacher,
    fetchTeachers,
    fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    fetchSchedulesForClass,
    fetchAllTeachers,
    fetchAllSubjects,
    fetchAllSemesters,
    fetchScheduleById,
    manageSemesters,
    createSemester,
    editSemester,
    removeSemester,
    manageClasses,
    createClass,
    editClass,
    removeClass,
    getTeachersByClass,
    getSubjectsByClassAndTeacher,
    fetchAllAdmins,
    removeAdmin
};