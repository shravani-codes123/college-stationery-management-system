// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        
        // Skip if target is just '#' or empty
        if (targetId === '#' || !targetId) return;

        try {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        } catch (error) {
            // Handle invalid selectors like [href="#some-invalid-id"]
            console.warn("Invalid scroll target:", targetId);
        }
    });
});

// Simple form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const roleElement = document.getElementById('role');
        if (roleElement) {
            const role = roleElement.value;
            if (role === 'student') {
                window.location.href = 'student_dashboard.html';
            } else if (role === 'manager') {
                window.location.href = 'manager_dashboard.html';
            } else {
                alert(`Successfully logged in as ${role}!`);
            }
        }
    });
}

// Signup Logic
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('signupRole').value;
        const name = document.getElementById('fullName').value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        alert(`Account created successfully for ${name} as a ${role}! Redirecting to dashboard...`);
        
        // Redirect based on role
        if (role === 'student') {
            window.location.href = 'student_dashboard.html';
        } else if (role === 'manager') {
            window.location.href = 'manager_dashboard.html';
        }
    });
}

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    }
});

// Adding intersection observer for reveal animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.card, .role-box, .tech-card, .objective-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});
