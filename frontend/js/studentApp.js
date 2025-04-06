// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('student', JSON.stringify(data.student));
        window.location.href = 'studentDashboard.html';
      } else {
        document.getElementById('errorMessage').textContent = 'Invalid credentials';
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  });
  
  // Additional functionality omitted for brevity