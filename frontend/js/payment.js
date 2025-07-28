

//cssdocument.getElementById('paymentForm').addEventListener('submit', async (event) => {
  event.preventDefault();
   console.log('Login form submitted'); // Add this line for debugging

  // Get form data
  const parent_id = document.getElementById('parent_id').value.trim();
  const student_id = document.getElementById('student_id').value.trim();
  const amount = parseFloat(document.getElementById('amount').value.trim());
  const currency = document.getElementById('currency').value.trim();
  const payment_method = document.getElementById('payment_method').value.trim();

  // Validate input
  if (!parent_id || !student_id || isNaN(amount) || !currency || !payment_method) {
    showError('All fields are required.');
    return;
  }

  // Disable button during processing
  const submitButton = document.getElementById('submitButton');
  submitButton.disabled = true;
  submitButton.textContent = 'Processing...';

  try {
    // Send POST request to backend
    const response = await fetch('http://localhost:5000/api/parent/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent_id,
        student_id,
        amount,
        currency,
        payment_method,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! Status: ${response.status}`);
    }

    // Display success message
    showMessage(`Payment successful! Transaction ID: ${data.payment.transaction_id}`, 'success');
  } catch (error) {
    // Display error message
    showError(error.message || 'An unexpected error occurred.');
  } finally {
    // Re-enable button
    submitButton.disabled = false;
    submitButton.textContent = 'Pay Now';
  }


function showMessage(message, type) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = message;
  messageElement.className = type; // 'success' or 'error'
}

function showError(message) {
  showMessage(message, 'error');
}
