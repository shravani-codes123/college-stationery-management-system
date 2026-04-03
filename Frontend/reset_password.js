/**
 * Reset Password Logic
 * Connects with http://localhost:8080/api/auth/reset-password
 * Extracts reset token from URL parameters
 */

document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const resetBtn = document.getElementById('resetBtn');
    const messageDiv = document.getElementById('reset-message');

    // 1. Get token from URL: reset_password.html?token=abc123
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!resetPasswordForm) return;

    resetPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // 2. Form values
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Reset UI State
        messageDiv.style.display = 'none';
        
        // Input Validation
        if (!token) {
            showMessage('Invalid or missing reset token. Please check your email link.', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showMessage('New password must be at least 6 characters long.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('Passwords do not match!', 'error');
            return;
        }

        // Show Loading State
        setLoading(true);

        try {
            // 3. Send POST request to Spring Boot backend
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    token: token,
                    newPassword: newPassword 
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                showMessage('Your password has been successfully updated! Redirecting to login...', 'success');
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                // Fail
                showMessage(data.message || 'Token expired or invalid request. Please request a new reset link.', 'error');
            }
        } catch (error) {
            console.error('Reset password error:', error);
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
            messageDiv.style.background = '#f0fdf4';
            messageDiv.style.border = '1px solid #bbf7d0';
        } else {
            messageDiv.style.color = '#dc2626'; // Red
            messageDiv.style.background = '#fef2f2';
            messageDiv.style.border = '1px solid #fecaca';
        }
    }

    /**
     * Handle button loading state
     */
    function setLoading(isLoading) {
        if (isLoading) {
            resetBtn.disabled = true;
            resetBtn.dataset.originalText = resetBtn.textContent;
            resetBtn.textContent = 'Updating password...';
        } else {
            resetBtn.disabled = false;
            resetBtn.textContent = resetBtn.dataset.originalText || 'Update Password';
        }
    }
});
