document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item[data-section]');
    const sections = document.querySelectorAll('.section');
    const sectionTitle = document.getElementById('section-title');

    // 👤 User Profile Logic: Display Initials from localStorage
    const profileImg = document.querySelector('.profile-img');
    const storedName = localStorage.getItem('userName');
    console.log("Current User in Dashboard:", storedName); // 👈 Helpful debug log

    if (profileImg && storedName && storedName !== "undefined") {
        const nameParts = storedName.split(' ').filter(part => part.length > 0);
        let initials = "";
        if (nameParts.length >= 2) {
            initials = nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
        } else if (nameParts.length === 1) {
            initials = nameParts[0].substring(0, 2);
        }
        profileImg.textContent = initials.toUpperCase();
    }

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

    // 📦 Dynamic Product Loading
    const productList = document.getElementById('product-list');
    if (productList) {
        loadBackendProducts();
    }

    async function loadBackendProducts() {
        try {
            const response = await fetch('http://localhost:8080/api/products');
            const products = await response.json();
            
            // 👤 Update Dashboard Stats
            const totalProductsEl = document.getElementById('total-products-count');
            const discountOffersEl = document.getElementById('discount-offers-count');

            if (products && products.length > 0) {
                if (totalProductsEl) totalProductsEl.textContent = products.length;
                const discounts = products.filter(p => p.discount > 0).length;
                if (discountOffersEl) discountOffersEl.textContent = discounts;
                
                productList.innerHTML = ''; // ONLY clear if we have database data
                products.forEach(product => {
                    // ... (rest of dynamic product row logic)
                    const discountHtml = product.discount > 0 ? `<span class="discount-tag">${product.discount}% OFF</span>` : '';
                    const card = `
                        <div class="product-card">
                            <div class="product-img">
                                <img src="${product.imageUrl || 'notebook.jpeg'}" alt="${product.name}" onerror="this.src='https://placehold.co/200x200?text=Stationary'">
                            </div>
                            ${discountHtml}
                            <div class="product-details">
                                <div class="product-name">${product.name}</div>
                                <div class="product-price">₹${product.price}</div>
                                <div class="product-stock">Stock: ${product.quantity} available</div>
                                <button class="btn btn-primary" onclick="addToCart('${product.name}', ${product.price})" style="width: 100%; margin-top: 1rem; padding: 0.5rem;">Add to Cart</button>
                            </div>
                        </div>`;
                    productList.innerHTML += card;
                });
            } else {
                // 👤 FALLBACK STATS (For hardcoded HTML products)
                if (totalProductsEl) totalProductsEl.textContent = 4;
                if (discountOffersEl) discountOffersEl.textContent = 2;
            }
        } catch (error) {
            console.error("Error loading products (Backend might be starting):", error);
            // Fallback stats on Error
            if (totalProductsEl) totalProductsEl.textContent = 4;
            if (discountOffersEl) discountOffersEl.textContent = 2;
        }
    }

    // 👤 Update Cart Counter on Dashboard (Live Stat - Fetch from DB)
    async function updateCartCounter() {
        // Handled within updateCartDisplay for efficiency
        updateCartDisplay();
    }

    // Helper: Material-style Snack Message
    function showCartMessage(message) {
        const toast = document.createElement("div");
        toast.innerText = message;
        toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; 
            background: #2563eb; color: white; padding: 12px 24px; 
            border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); 
            z-index: 9999; font-weight: 500; animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = '0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 2500);
    }

    // 🛒 DATABASE-DRIVEN Cart Logic (Globally Accessible)
    window.addToCart = async (name, price) => {
        try {
            const response = await fetch('http://localhost:8080/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price: parseFloat(price), quantity: 1 })
            });

            if (response.ok) {
                showCartMessage(`Database Updated: ${name}`);
                updateCartDisplay(); // Refresh UI
            } else {
                console.error("Failed to add to database cart");
            }
        } catch (e) {
            console.error("Add to cart DB error:", e);
        }
    };

    window.updateCartDisplay = async function() {
        const cartTable = document.querySelector('#purchase tbody');
        const cartTotalDisplay = document.getElementById('cart-total');
        const countDisplay = document.getElementById('cart-count-display');
        
        try {
            const response = await fetch('http://localhost:8080/api/cart');
            const cartItems = await response.json();
            
            let grandTotal = 0;
            let totalItemsCount = 0;

            if (cartTable) {
                cartTable.innerHTML = '';
                if (cartItems.length === 0) {
                    cartTable.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #6b7280;">Your cart is empty</td></tr>';
                } else {
                    cartItems.forEach(item => {
                        let rowTotal = item.price * item.quantity;
                        grandTotal += rowTotal;
                        totalItemsCount += item.quantity;

                        cartTable.innerHTML += `
                            <tr>
                                <td>${item.name}</td>
                                <td>₹${item.price}</td>
                                <td>${item.quantity}</td>
                                <td>₹${rowTotal}</td>
                                <td><button class="btn" onclick="removeFromCart(${item.id})" style="color: #ef4444; background: none; border: none; cursor: pointer;"><i class="fas fa-trash"></i></button></td>
                            </tr>`;
                    });
                }
            } else {
                // If we're not on the purchase page, still calculate total for the count display
                cartItems.forEach(item => totalItemsCount += item.quantity);
            }

            if (cartTotalDisplay) cartTotalDisplay.innerText = "Total: ₹" + grandTotal;
            if (countDisplay) countDisplay.textContent = totalItemsCount;

        } catch (e) {
            console.error("Cart retrieval error:", e);
        }
    };
    
    window.removeFromCart = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/cart/${id}`, { method: 'DELETE' });
            updateCartDisplay();
        } catch (e) {
            console.error("Remove from cart DB error:", e);
        }
    };

    window.checkout = async () => {
        const cartTotalDisplay = document.getElementById('cart-total');
        const totalPrice = parseFloat(cartTotalDisplay?.innerText.replace('Total: ₹', '') || '0');

        if (totalPrice === 0) {
            alert("Your cart is empty!");
            return;
        }

        const orderData = { totalPrice, items: "Cart Order" }; // 👈 Fixed missing orderData

        try {
            const response = await fetch('http://localhost:8080/api/orders/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Order Success! Order ID: #ORD-${data.id}`);
                
                // Clear Database Cart
                await fetch('http://localhost:8080/api/cart/clear', { method: 'DELETE' });
                
                updateCartDisplay();
                loadOrderHistory(); // 👈 Refresh the history table
                document.querySelector('[data-section="orders"]')?.click();
            } else {
                alert("Server error during checkout.");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("CANNOT REACH BACKEND. Please make sure your Spring Boot server is running!");
        }
    };

    // 📦 LOAD ORDER HISTORY (Fetch from DB)
    async function loadOrderHistory() {
        const orderTable = document.querySelector('#orders tbody');
        if (!orderTable) return;

        try {
            const response = await fetch('http://localhost:8080/api/orders');
            const orders = await response.json();
            
            // 👤 Update Dashboard Stat Card
            const activeOrderCountDisplay = document.getElementById('active-orders-count');
            if (activeOrderCountDisplay) {
                activeOrderCountDisplay.textContent = orders.length;
            }

            if (orders && orders.length > 0) {
                orderTable.innerHTML = ''; // Clear hardcoded examples
                orders.forEach(order => {
                    // Format date (e.g., 2026-04-02)
                    const dateObj = new Date(order.orderDate);
                    const formattedDate = dateObj.toLocaleDateString();

                    orderTable.innerHTML += `
                        <tr>
                            <td>#ORD-${order.id}</td>
                            <td>Stationery Items</td>
                            <td>₹${order.totalPrice}</td>
                            <td>${formattedDate}</td>
                            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                        </tr>`;
                });
            }
        } catch (e) {
            console.error("Order history retrieval error:", e);
        }
    }

    // Initial Display Load
    updateCartCounter();
    updateCartDisplay();
    loadOrderHistory(); // 👈 Load real orders on page start

    // 📑 Real Print Request Submission
    const submitPrintBtn = document.getElementById('submitPrintBtn');
    if (submitPrintBtn) {
        submitPrintBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const docName = document.getElementById('pr-docName').value;
            const pages = document.getElementById('pr-pages').value;
            const type = document.getElementById('pr-type').value;
            const copies = document.getElementById('pr-copies').value;

            if (!docName) {
                alert("Please enter a document name.");
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/print-requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ docName, pages, type, copies })
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(`Print request submitted! ID: PRNT-${data.id}`);
                    document.getElementById('pr-docName').value = ''; // Clear form
                } else {
                    alert("Failed to submit request.");
                }
            } catch (error) {
                console.error("Print submission error:", error);
                alert("Backend server connection failed.");
            }
        });
    }

    // 💰 Print Price Calculator Logic
    const calculatePrintPrice = () => {
        const pages = parseInt(document.getElementById('pr-pages')?.value || 0);
        const copies = parseInt(document.getElementById('pr-copies')?.value || 0);
        const type = document.getElementById('pr-type')?.value;
        const priceDisplay = document.getElementById('pr-estimated-price');

        if (!priceDisplay) return;

        const rate = type === "Color" ? 5 : 2; // ₹5 for Color, ₹2 for B&W
        const total = pages * copies * rate;
        priceDisplay.textContent = total;
    };

    ['pr-pages', 'pr-copies', 'pr-type'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calculatePrintPrice);
        document.getElementById(id)?.addEventListener('change', calculatePrintPrice);
    });

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
    // 🏎️ QUICK ACTION NAVIGATION
    document.getElementById('quick-new-print')?.addEventListener('click', () => {
        document.querySelector('[data-section="print"]')?.click();
    });
    
    document.getElementById('quick-view-history')?.addEventListener('click', () => {
        document.querySelector('[data-section="orders"]')?.click();
    });

    // 🔔 SMART NOTIFICATIONS
    window.updateNotificationBadge = (count) => {
        const badge = document.getElementById('notification-badge');
        if (!badge) return;

        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    };

    window.updateCommentBadge = (count) => {
        const badge = document.getElementById('comment-badge');
        if (!badge) return;

        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    };

    updateNotificationBadge(0);
    updateCommentBadge(0);
    }
});
