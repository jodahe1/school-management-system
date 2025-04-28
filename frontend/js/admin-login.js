// frontend/js/admin-login.js
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get form data
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validate input
    if (!email || !password) {
        document.getElementById('message').textContent = 'All fields are required';
        document.getElementById('message').style.color = 'red';
        return;
    }

    try {  
        // Send POST request to backend
        const response = await fetch('http://localhost:5000/api/admin/admins/login', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Redirect to admin dashboard on successful login
            window.location.href = 'admin-dashboard.html';
        } else {
            // Error message
            document.getElementById('message').textContent = result.message || 'An error occurred';
            document.getElementById('message').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('message').textContent = 'Network error. Please try again.';
        document.getElementById('message').style.color = 'red';
    }
});