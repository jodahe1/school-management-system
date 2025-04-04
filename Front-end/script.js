document.getElementById('adminForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('message');

    try {
        const response = await fetch('http://localhost:3000/api/admin/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        messageElement.textContent = result.message || 'Administrator registered successfully!';
        messageElement.style.color = 'green';
    } catch (error) {
        console.error('Error:', error);
        messageElement.textContent = 'Failed to connect to the server. Please try again later.';
        messageElement.style.color = 'red';
    }
});