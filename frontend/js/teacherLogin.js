document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store the token and redirect to dashboard
            localStorage.setItem('teacherToken', data.token);
            localStorage.setItem('teacherId', data.userId);
            window.location.href = 'teacherDashboard.html';
        } else {
            errorElement.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        errorElement.textContent = 'Network error. Please try again.';
        console.error('Login error:', error);
    }
});