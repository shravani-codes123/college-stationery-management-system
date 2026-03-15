document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item[data-section]');
    const sections = document.querySelectorAll('.section');
    const sectionTitle = document.getElementById('section-title');

    // Section Switching Logic
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');
            
            // Update active menu item
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });

            // Update header title
            const name = item.querySelector('span').innerText;
            const sidebarLogo = document.querySelector('.sidebar-logo')?.innerText || '';
            
            if (name === 'Dashboard') {
                sectionTitle.innerText = sidebarLogo.includes('Manager') ? 'Manager Dashboard' : 'Student Dashboard';
            } else {
                sectionTitle.innerText = name;
            }
        });
    });

    // Mock Add to Cart
    const addButtons = document.querySelectorAll('.product-card .btn-primary');
    addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const productName = btn.closest('.product-details').querySelector('.product-name').innerText;
            alert(`${productName} added to cart!`);
        });
    });

    // Mock Form Submission for Print
    const printForm = document.querySelector('#print button');
    if (printForm) {
        printForm.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Print request submitted successfully! Tracking ID: PRNT-' + Math.floor(Math.random() * 10000));
        });
    }

    // Mock Search
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const products = document.querySelectorAll('.product-card');
            const tableRows = document.querySelectorAll('tbody tr');
            
            // Filter products cards
            products.forEach(product => {
                const name = product.querySelector('.product-name').innerText.toLowerCase();
                product.style.display = name.includes(query) ? 'block' : 'none';
            });

            // Filter table rows
            tableRows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }
});
