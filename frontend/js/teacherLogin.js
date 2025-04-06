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
            localStorage.setItem('teacher', JSON.stringify(data.teacher)); // Store teacher info
            window.location.href = 'teacherDashboard.html'; // Redirect to dashboard
        } else {
            const errorData = await response.json();
            document.getElementById('error-message').textContent = errorData.message || 'Login failed';
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('error-message').textContent = 'An error occurred. Please try again.';
    }
});