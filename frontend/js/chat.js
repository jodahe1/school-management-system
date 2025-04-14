document.addEventListener('DOMContentLoaded', async () => {
    // Get student data from localStorage (same as dashboard)
    const student = JSON.parse(localStorage.getItem('student'));
    if (!student) {
        window.location.href = 'studentLogin.html';
        return;
    }

    // Add student name display to chat header (same as dashboard)
    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';
    chatHeader.innerHTML = `
        <h2>Messages for <span id="chatStudentName">${student.username || 'Student'}</span></h2>
    `;
    document.querySelector('.chat-container').prepend(chatHeader);

    // Rest of your chat implementation...
    const messagesContainer = document.getElementById('messagesContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const teacherSelect = document.getElementById('teacherSelect');
    const API_BASE_URL = 'http://localhost:5000/api';

    async function loadTeachers() {
        try {
            const response = await fetch(`${API_BASE_URL}/student/${student.user_id}/info`);
            if (!response.ok) throw new Error('Failed to load student info');
            
            const studentInfo = await response.json();
            
            if (!studentInfo.class_id) {
                messagesContainer.innerHTML = `
                    <div class="no-class">
                        <p>You are not assigned to any class</p>
                    </div>
                `;
                return;
            }

            const teachersResponse = await fetch(`${API_BASE_URL}/message-board/teachers?class_id=${studentInfo.class_id}`);
            if (!teachersResponse.ok) throw new Error('Failed to load teachers');
            
            const teachers = await teachersResponse.json();
            
            teacherSelect.innerHTML = '<option value="" disabled selected>Select teacher...</option>';
            teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.teacher_id;
                option.textContent = teacher.username || `Teacher ${teacher.teacher_id}`;
                teacherSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error:', error);
            messagesContainer.innerHTML = `
                <div class="error">
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    // ... rest of your chat.js implementation ...

    // Initialize
    loadTeachers();
});