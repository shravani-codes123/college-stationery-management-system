/**
 * Signup Logic for College Stationery Management System
 * Connects with http://localhost:8080/api/auth/signup
 */

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const messageDiv = document.getElementById('signup-message');

    if (!signupForm) return;

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get Input Values
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('signupRole').value;

        // Reset UI State
        messageDiv.style.display = 'none';
        
        // Input Validation
        if (!fullName || !email || !password || !role) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match!', 'error');
            return;
        }

        // Show Loading State
        setLoading(true);

        try {
            // POST request to backend signup endpoint
            const response = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    fullName, 
                    email, 
                    password, 
                    role: role.toUpperCase() // Convert 'student' to 'STUDENT'
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Show message and redirect to login
                showMessage('Account created successfully! Redirecting to login...', 'success');
                signupForm.reset();
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2500);
            } else {
                // Fail: Show error message from backend
                showMessage(data.message || 'Signup failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
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
            signupBtn.disabled = true;
            signupBtn.dataset.originalText = signupBtn.textContent;
            signupBtn.textContent = 'Creating Account...';
        } else {
            signupBtn.disabled = false;
            signupBtn.textContent = signupBtn.dataset.originalText || 'Create Profile';
        }
    }
});
