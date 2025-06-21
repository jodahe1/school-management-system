// studentApp.js - Updated with proper error handling
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous error messages
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = '';
  errorMessage.style.display = 'none';

  // Get form values
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // Validate inputs
  if (!username || !password) {
    errorMessage.textContent = 'Please fill in all fields.';
    errorMessage.style.display = 'block';
    return;
  }

  // Validate username format (basic validation)
  if (username.length < 3) {
    errorMessage.textContent = 'Username must be at least 3 characters long.';
    errorMessage.style.display = 'block';
    return;
  }

  try {
    // Show loading state
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    // Send login request to the backend
    const response = await fetch('http://localhost:5000/api/student/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password }),
    });

    // Check if response is OK (status 200-299)
    if (!response.ok) {
      // Try to parse error response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      throw new Error(errorData.message || 'Login failed');
    }

    // Parse successful response
    const data = await response.json();

    // Handle successful login
    if (data.student) {
      localStorage.setItem('student', JSON.stringify(data.student));
      window.location.href = 'studentDashboard.html';
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error during login:', error);
    errorMessage.textContent = error.message || 'An unexpected error occurred. Please try again.';
    errorMessage.style.display = 'block';
  } finally {
    // Reset loading state
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  }
});