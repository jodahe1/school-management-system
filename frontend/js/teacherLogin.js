// frontend/js/teacherLogin.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/teacher/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            
            // Check if this is a first-time login
            if (data.teacher.password_reset_required) {
                // Store temporary data for first-time login
                localStorage.setItem('tempUserData', JSON.stringify({
                    user_id: data.teacher.user_id,
                    username: data.teacher.username,
                    password: password, // Store password temporarily for verification
                    role: 'teacher'
                }));
                window.location.href = 'firstTimeLogin.html';
            } else {
                // Normal login - store teacher data and redirect to dashboard
                localStorage.setItem('teacher', JSON.stringify(data.teacher));
                window.location.href = 'teacherDashboard.html';
            }
        } else {
            const errorData = await response.json();
            document.getElementById('error-message').textContent = errorData.message || 'Login failed';
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('error-message').textContent = 'An error occurred. Please try again.';
    }
});