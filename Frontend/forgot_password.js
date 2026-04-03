/**
 * Forgot Password Logic
 * Connects with http://localhost:8080/api/auth/forgot-password
 */

document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const forgotBtn = document.getElementById('forgotBtn');
    const messageDiv = document.getElementById('forgot-message');

    if (!forgotPasswordForm) return;

    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();

        // Reset UI State
        messageDiv.style.display = 'none';
        
        // Input Validation
        if (!email) {
            showMessage('Please enter your email', 'error');
            return;
        }

        // Show Loading State
        setLoading(true);

        try {
            // POST request
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Show message: "Reset link sent to your email"
                showMessage('Reset link sent to your email!', 'success');
                forgotPasswordForm.reset();
            } else {
                // Fail: Handle errors from backend
                showMessage(data.message || 'Error processing request', 'error');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            showMessage('Server connection failed. Could not reach backend.', 'error');
        } finally {
            // Reset Loading State
            setLoading(false);
        }
    });

    /**
     * Show success or error status below form
     */
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        if (type === 'success') {
            messageDiv.style.color = '#15803d'; // Green
            messageDiv.style.backgroundColor = '#f0fdf4'; // Light green bg
            messageDiv.style.border = '1px solid #bbf7d0';
        } else {
            messageDiv.style.color = '#dc2626'; // Red
            messageDiv.style.backgroundColor = '#fef2f2'; // Light red bg
            messageDiv.style.border = '1px solid #fecaca';
        }
    }

    /**
     * Handle button loading state
     */
    function setLoading(isLoading) {
        if (isLoading) {
            forgotBtn.disabled = true;
            forgotBtn.dataset.originalText = forgotBtn.textContent;
            forgotBtn.textContent = 'Sending link...';
        } else {
            forgotBtn.disabled = false;
            forgotBtn.textContent = forgotBtn.dataset.originalText || 'Send Reset Link';
        }
    }
});
