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
        const totalProductsEl = document.getElementById('total-products-count');
        const discountOffersEl = document.getElementById('discount-offers-count');

        try {
            const response = await fetch('http://localhost:8080/api/products');
            const products = await response.json();
            
            // 👤 Update Dashboard Stats
            if (products && products.length > 0) {
                if (totalProductsEl) totalProductsEl.textContent = products.length;
                const discounts = products.filter(p => p.discount > 0).length;
                if (discountOffersEl) discountOffersEl.textContent = discounts;
                
                productList.innerHTML = ''; // ONLY clear if we have database data
                products.forEach(product => {
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
                                <button class="btn btn-primary" onclick="addToCart('${product.name}', ${product.price}, ${product.quantity})" style="width: 100%; margin-top: 1rem; padding: 0.5rem;">Add to Cart</button>
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
    function showCartMessage(message, isError = false) {
        const toast = document.createElement("div");
        toast.innerText = message;
        toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; 
            background: ${isError ? '#ef4444' : '#2563eb'}; color: white; padding: 12px 24px; 
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
    window.addToCart = async (name, price, stock) => {
        if (stock <= 0) {
            showCartMessage(`Error: ${name} is currently unavailable!`, true);
            return;
        }

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
            // 🛡️ Added cache-busting to ensure we always get the latest DB state
            const response = await fetch(`http://localhost:8080/api/cart?t=${Date.now()}`);
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

    // 💳 REUSABLE PAYMENT FLOW (SIMULATED GATEWAY)
    window.startPaymentFlow = async (totalPrice, successCallback) => {
        const paymentModal = document.getElementById('payment-modal');
        const paymentTotalDisplay = document.getElementById('payment-total-display');
        const confirmBtn = document.getElementById('confirm-payment-btn');
        
        if (!paymentModal || !paymentTotalDisplay || !confirmBtn) return;

        paymentTotalDisplay.textContent = `₹${totalPrice}`;
        paymentModal.style.display = 'block';

        confirmBtn.onclick = async () => {
            confirmBtn.disabled = true;
            const originalText = confirmBtn.innerText;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initializing Gateway...';
            
            // ⏳ Simulate Real Payment Processing
            setTimeout(async () => {
                confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Securing Transaction...';
                
                setTimeout(async () => {
                    const selectedMethod = document.querySelector('.payment-method.selected');
                    const isCash = selectedMethod && selectedMethod.getAttribute('data-method') === 'cash';
                    
                    if (isCash) {
                        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Order Confirmed!';
                    } else {
                        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Payment Successful!';
                    }
                    confirmBtn.style.background = '#22c55e';
                    
                    setTimeout(async () => {
                        await successCallback(); // 🚀 EXECUTE THE BACKEND REQUEST
                        
                        paymentModal.style.display = 'none';
                        confirmBtn.disabled = false;
                        confirmBtn.innerText = originalText;
                        confirmBtn.style.background = ''; // Reset color
                    }, 1000);
                }, 1500);
            }, 1500);
        };
    };

    window.checkout = async () => {
        const cartTotalDisplay = document.getElementById('cart-total');
        const totalPrice = parseFloat(cartTotalDisplay?.innerText.replace('Total: ₹', '') || '0');

        if (totalPrice === 0) {
            alert("Your cart is empty!");
            return;
        }

        await window.startPaymentFlow(totalPrice, async () => {
            await window.finalizeOrder(totalPrice);
        });
    };

    window.finalizeOrder = async (totalPrice) => {
        const orderData = { totalPrice, items: "Cart Order" }; 

        try {
            const response = await fetch('http://localhost:8080/api/orders/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const data = await response.json();
                
                // Show custom success screen or simple alert
                const toast = document.createElement("div");
                toast.style.cssText = `
                    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                    background: #22c55e; color: white; padding: 1.5rem 2rem;
                    border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
                    z-index: 10000; display: flex; align-items: center; gap: 1rem;
                    font-weight: 700; animation: slideDown 0.5s ease-out;
                `;
                toast.innerHTML = `<i class="fas fa-check-circle" style="font-size: 1.5rem;"></i> <div>Order Placed Successfully!<br><span style="font-size: 0.8rem; font-weight: 400;">Order ID: #ORD-${data.id}</span></div>`;
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.style.transform = 'translateX(-50%) translateY(-100px)';
                    toast.style.transition = '0.5s';
                    setTimeout(() => toast.remove(), 500);
                }, 4000);

                // 🧹 FORCE CLEAR UI IMMEDIATELY
                const cartTable = document.querySelector('#purchase tbody');
                if (cartTable) cartTable.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #6b7280;">Your cart is empty</td></tr>';
                
                const cartTotalDisplay = document.getElementById('cart-total');
                if (cartTotalDisplay) cartTotalDisplay.innerText = "Total: ₹0";
                
                const countDisplay = document.getElementById('cart-count-display');
                if (countDisplay) countDisplay.textContent = "0";

                updateCartDisplay(); // Sync with backend
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

    // 🎨 Payment Method Selection UI Logic
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => {
                m.classList.remove('selected');
                m.style.border = '2px solid var(--border-color)';
                m.style.background = 'white';
                const icon = m.querySelector('i');
                if (icon) icon.style.color = 'var(--text-muted)';
            });
            
            method.classList.add('selected');
            const methodType = method.getAttribute('data-method');
            const upiQrSection = document.getElementById('upi-qr-section');

            if (upiQrSection) {
                upiQrSection.style.display = methodType === 'upi' ? 'block' : 'none';
            }
            
            method.style.border = '2px solid var(--primary-color)';
            if (methodType === 'upi') {
                method.style.background = 'rgba(37, 99, 235, 0.05)';
            }
        });
    });

    const closePaymentModal = document.getElementById('close-payment-modal');
    if (closePaymentModal) {
        closePaymentModal.onclick = () => {
            document.getElementById('payment-modal').style.display = 'none';
        };
    }

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

            const estimatedPrice = parseInt(document.getElementById('pr-estimated-price')?.textContent || '0');

            await window.startPaymentFlow(estimatedPrice, async () => {
                try {
                    const response = await fetch('http://localhost:8080/api/print-requests', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ docName, pages, type, copies })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        
                        // Show success toast
                        const toast = document.createElement("div");
                        toast.style.cssText = `
                            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                            background: #2563eb; color: white; padding: 1.5rem 2rem;
                            border-radius: 12px; font-weight: 700; z-index: 10001; animation: slideDown 0.5s;
                        `;
                        toast.innerHTML = `<i class="fas fa-print"></i> Request Sent! ID: PRNT-${data.id}`;
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 4000);

                        document.getElementById('pr-docName').value = ''; // Clear form
                        document.getElementById('pr-estimated-price').innerText = '0';
                    } else {
                        alert("Failed to submit request.");
                    }
                } catch (error) {
                    console.error("Print submission error:", error);
                    alert("Backend server connection failed.");
                }
            });
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
    }

    // 🏎️ QUICK ACTION NAVIGATION
    document.getElementById('quick-new-print')?.addEventListener('click', () => {
        document.querySelector('[data-section="print"]')?.click();
    });
    
    document.getElementById('quick-view-history')?.addEventListener('click', () => {
        document.querySelector('[data-section="orders"]')?.click();
    });

    // 🔔 SMART NOTIFICATIONS (Periodically fetch from backend)
    const checkNotifications = async () => {
        const userId = localStorage.getItem('userId') || 1; // Simulation: Default to 1
        try {
            const response = await fetch(`http://localhost:8080/api/notifications/unread?userId=${userId}`);
            const notifications = await response.json();
            window.updateNotificationBadge(notifications.length);
        } catch (e) {
            console.error("Failed to fetch notifications:", e);
        }
    };

    // Mark as read when bell icon is clicked
    const bellBtn = document.querySelector('.fa-bell')?.parentElement;
    if (bellBtn) {
        bellBtn.addEventListener('click', async () => {
            const userId = localStorage.getItem('userId') || 1;
            try {
                await fetch(`http://localhost:8080/api/notifications/mark-read?userId=${userId}`, { method: 'PUT' });
                window.updateNotificationBadge(0);
            } catch (e) {
                console.error("Failed to mark notifications as read:", e);
            }
        });
    }

    // Run notification check every 10 seconds
    setInterval(checkNotifications, 10000);
    checkNotifications(); // Initial check

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
});
