// frontend/js/addAdmin.js
document.getElementById('adminForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get form data
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validate input
    if (!name || !email || !password) {
        document.getElementById('message').textContent = 'All fields are required';
        document.getElementById('message').style.color = 'red';
        return;
    }

    try {
        // Send POST request to backend
        const response = await fetch('http://localhost:5000/api/admin/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Success message
            document.getElementById('message').textContent = 'Administrator added successfully!';
            document.getElementById('message').style.color = 'green';
            document.getElementById('adminForm').reset();
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