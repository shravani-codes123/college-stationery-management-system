/**
 * Login Logic for College Stationery Management System
 * Integrates with Spring Boot backend using JWT Authentication
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorDiv = document.getElementById('login-error');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get Input Values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value; // 👈 Get role from dropdown

        // Reset UI State
        errorDiv.style.display = 'none';

        // Input Validation
        if (!email || !password || !role) {
            showError('Please fill in all fields (Email, Password, and Role)');
            return;
        }

        // Show Loading State
        setLoading(true);

        try {
            // 1. Connect Login with Backend API (Send role for verification)
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }) // 👈 Sending role to backend
            });

            const data = await response.json();

            // 2. Handle Response
            if (response.ok) {
                // Success: Store JWT token, name, and role
                localStorage.setItem("token", data.token);
                localStorage.setItem("userName", data.fullName);
                localStorage.setItem("userRole", data.role);
                localStorage.setItem("userId", data.userId); // 👈 For notifications logic

                // 3. Perfect Redirection
                const userRole = data.role.toUpperCase(); // Ensure we match "STUDENT" or "MANAGER"

                if (userRole === 'STUDENT') {
                    window.location.href = 'student_dashboard.html';
                } else if (userRole === 'MANAGER') {
                    window.location.href = 'manager_dashboard.html';
                }
            } else {
                // Fail: Role error or Password error
                const errorMessage = data.message || 'Invalid login details';
                showError(errorMessage); // 👈 This will now show the backend's "Role Mismatch" message!
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error: Could not reach server.');
        } finally {
            // Reset Loading State
            setLoading(false);
        }
    });

    /**
     * Helper to show error message
     */
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    /**
     * Helper to set loading state on button
     */
    function setLoading(isLoading) {
        if (isLoading) {
            loginBtn.disabled = true;
            loginBtn.dataset.originalText = loginBtn.textContent;
            loginBtn.textContent = 'Logging in...';
        } else {
            loginBtn.disabled = false;
            loginBtn.textContent = loginBtn.dataset.originalText || 'Login';
        }
    }
});
