// frontend/js/delete-students.js

let selectedClassId = null;
let selectedStudentId = null;

// Fetch All Classes
const fetchClasses = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/classes');
        const classes = await response.json();

        if (classes.length === 0) {
            document.getElementById('classes-list').innerHTML = '<p>No classes found.</p>';
            return;
        }

        document.getElementById('classes-list').innerHTML = '';
        classes.forEach((cls) => {
            const button = document.createElement('button');
            button.textContent = cls.class_name;
            button.onclick = () => fetchStudents(cls.class_id, cls.class_name);
            document.getElementById('classes-list').appendChild(button);
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        document.getElementById('classes-list').innerHTML = '<p>Error loading classes. Please try again.</p>';
    }
};

// Fetch Students in a Specific Class
const fetchStudents = async (classId, className) => {
    try {
        selectedClassId = classId;
        document.getElementById('selected-class-name').textContent = className;
        document.getElementById('students-section').style.display = 'block';

        const response = await fetch(`http://localhost:5000/api/admin/classes/${classId}/students`);
        const students = await response.json();

        if (students.length === 0) {
            document.getElementById('students-list').innerHTML = '<p>No students found in this class.</p>';
            return;
        }

        document.getElementById('students-list').innerHTML = '';
        students.forEach((student) => {
            const button = document.createElement('button');
            button.textContent = `${student.first_name} ${student.last_name}`;
            button.onclick = () => confirmDelete(student.student_id, `${student.first_name} ${student.last_name}`);
            document.getElementById('students-list').appendChild(button);
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        document.getElementById('students-list').innerHTML = '<p>Error loading students. Please try again.</p>';
    }
};

// Confirm Deletion
const confirmDelete = (studentId, studentName) => {
    selectedStudentId = studentId;
    document.getElementById('student-to-delete').textContent = studentName;
    document.getElementById('delete-confirmation-section').style.display = 'block';
};

// Handle Delete Confirmation
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    try {
        await fetch(`http://localhost:5000/api/admin/students/${selectedStudentId}/delete`, {
            method: 'DELETE',
        });

        document.getElementById('delete-message').textContent = 'Student deleted successfully!';
        document.getElementById('delete-message').style.color = 'green';

        // Reset the UI
        document.getElementById('delete-confirmation-section').style.display = 'none';
        fetchStudents(selectedClassId, document.getElementById('selected-class-name').textContent);
    } catch (error) {
        console.error('Error deleting student:', error);
        document.getElementById('delete-message').textContent = 'An error occurred while deleting the student.';
        document.getElementById('delete-message').style.color = 'red';
    }
});

// Handle Cancel Deletion
document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    document.getElementById('delete-confirmation-section').style.display = 'none';
});

// Initialize the Page
fetchClasses();