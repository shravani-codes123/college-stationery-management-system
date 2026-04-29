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

    // 🚪 Logout Logic
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to logout?")) {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        });
    });

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
                    const ratingId = `rating-${product.id}`;
                    const card = `
                        <div class="product-card">
                            <div class="product-img">
                                <img src="${product.imageUrl || 'notebook.jpeg'}" alt="${product.name}" onerror="this.src='https://placehold.co/200x200?text=Stationary'">
                            </div>
                            ${discountHtml}
                            <div class="product-details">
                                <div class="product-name">${product.name}</div>
                                <div id="${ratingId}"></div> <!-- Dynamic Rating Display -->
                                <div class="product-price">₹${product.price}</div>
                                <div class="product-stock">Stock: ${product.quantity} available</div>
                                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                                    <button class="btn btn-primary" onclick="addToCart('${product.name}', ${product.price}, ${product.quantity})" style="flex: 2; padding: 0.5rem;">Add to Cart</button>
                                    <button class="btn" onclick="openFeedbackModal(${product.id})" style="flex: 1; padding: 0.5rem; background: #f8fafc; border: 1px solid var(--border-color);"><i class="far fa-comment"></i></button>
                                </div>
                            </div>
                        </div>`;
                    productList.innerHTML += card;
                    // Trigger rating load asynchronously
                    if (window.loadProductRatings) window.loadProductRatings(product.id, ratingId);
                });

                // 🔔 Dynamic Stock Alerts (For Manager)
                const stockAlertsList = document.querySelector('#stock-alerts .grid');
                if (stockAlertsList) {
                    const lowStockProducts = products.filter(p => p.quantity < 5);
                    if (lowStockProducts.length > 0) {
                        stockAlertsList.innerHTML = lowStockProducts.map(prod => `
                            <div class="card" style="border-left: 5px solid #ef4444; padding: 1.5rem;">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div>
                                        <h4 style="margin-bottom: 0.5rem;">${prod.name}</h4>
                                        <p style="font-size: 0.875rem; color: var(--text-muted);">Current: ${prod.quantity} | Min Req: 5</p>
                                        <p style="color: #ef4444; font-weight: 600; margin-top: 0.5rem; font-size: 0.9rem;">Restock Required</p>
                                    </div>
                                    <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="document.querySelector('[data-section=\'inventory\']').click()">Restock</button>
                                </div>
                            </div>
                        `).join('');
                    } else {
                        stockAlertsList.innerHTML = '<div class="card" style="padding: 1.5rem; color: #10b981; font-weight: 600;"><i class="fas fa-check-circle"></i> All items are well-stocked!</div>';
                    }
                }
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

        // 🚛 Collect & Validate Address
        const fullName = document.getElementById('dev-fullname').value;
        const phone = document.getElementById('dev-phone').value;
        const address = document.getElementById('dev-address').value;
        const city = document.getElementById('dev-city').value;
        const pincode = document.getElementById('dev-pincode').value;

        if (!fullName || !phone || !address || !city || !pincode) {
            alert("Please fill in all delivery address details.");
            document.getElementById('dev-fullname').focus();
            return;
        }

        if (phone.length < 10) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        const addressData = { fullName, phoneNumber: phone, addressLine: address, city, pincode };

        await window.startPaymentFlow(totalPrice, async () => {
            await window.finalizeOrder(totalPrice, addressData);
        });
    };

    window.finalizeOrder = async (totalPrice, addressData) => {
        const orderData = { 
            totalPrice, 
            userId: localStorage.getItem('userId') || 1,
            ...addressData 
        }; 

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
                toast.innerHTML = `
                    <i class="fas fa-check-circle" style="font-size: 1.5rem;"></i> 
                    <div style="flex: 1;">
                        Order Placed Successfully!<br>
                        <span style="font-size: 0.8rem; font-weight: 400;">Order ID: #ORD-${data.id}</span>
                    </div>
                    <button class="btn" onclick="downloadInvoice(${data.id})" style="background: white; color: #22c55e; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.75rem; cursor: pointer; margin-left: 1rem;">
                        <i class="fas fa-download"></i> Invoice
                    </button>`;
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
                
                // Clear address form
                document.getElementById('dev-fullname').value = '';
                document.getElementById('dev-phone').value = '';
                document.getElementById('dev-address').value = '';
                document.getElementById('dev-city').value = '';
                document.getElementById('dev-pincode').value = '';

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
            const userId = localStorage.getItem('userId') || 1;
            const response = await fetch(`http://localhost:8080/api/orders/user/${userId}`);
            const orders = await response.json();
            
            // 👤 Update Dashboard Stat Card (Only Pending/Active Orders)
            const activeOrderCountDisplay = document.getElementById('active-orders-count');
            if (activeOrderCountDisplay) {
                const activeOrders = orders.filter(o => o.status === 'PENDING');
                activeOrderCountDisplay.textContent = activeOrders.length;
            }

            if (orders && orders.length > 0) {
                orderTable.innerHTML = ''; // Clear hardcoded examples
                orders.forEach(order => {
                    // Format date (e.g., 2026-04-02)
                    const dateObj = new Date(order.orderDate);
                    const formattedDate = dateObj.toLocaleDateString();
                    
                    // 🚚 Delivery Status Mapping
                    const trackingMap = {
                        'PENDING': 'Placed ✔',
                        'PACKED': 'Packed ✔',
                        'OUT_FOR_DELIVERY': 'Out for Delivery 🚚',
                        'DELIVERED': 'Delivered ✅'
                    };
                    const trackingText = trackingMap[order.deliveryStatus] || 'Placed ✔';

                    orderTable.innerHTML += `
                        <tr>
                            <td>#ORD-${order.id}</td>
                            <td>${order.items || 'Stationery Items'}</td>
                            <td>₹${order.totalPrice}</td>
                            <td>${formattedDate}</td>
                            <td><span class="status-badge" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">PAID</span></td>
                            <td><span class="status-badge status-${order.deliveryStatus.toLowerCase() === 'delivered' ? 'completed' : 'pending'}">${trackingText}</span></td>
                            <td>
                                <button class="btn btn-primary" onclick="downloadInvoice(${order.id})" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                                    <i class="fas fa-file-pdf"></i> Bill
                                </button>
                            </td>
                        </tr>`;
                });
            }
        } catch (e) {
            console.error("Order history retrieval error:", e);
        }
    }

    window.downloadInvoice = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/orders/${orderId}/invoice`);
            if (!response.ok) throw new Error("Invoice generation failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice_ORD_${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error("Error downloading invoice:", error);
            alert("Could not download invoice. Please try again later.");
        }
    };

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

            if (!docName) {
                alert("Please enter a document name.");
                return;
            }

            const fileInput = document.getElementById('pr-file');
            const file = fileInput.files[0];

            if (!file) {
                alert("Please select a file to upload.");
                return;
            }

            if (file.type !== "application/pdf") {
                alert("Please upload a PDF file only.");
                return;
            }

            const sets = parseInt(document.getElementById('pr-sets').value || 1);
            const estimatedPrice = parseInt(document.getElementById('pr-estimated-price')?.textContent || '0');
            const userId = localStorage.getItem('userId') || 101; // Fallback

            await window.startPaymentFlow(estimatedPrice, async () => {
                try {
                    const formData = new FormData();
                    const printRequest = {
                        docName: docName,
                        pages: parseInt(pages),
                        type: type,
                        copies: sets,
                        userId: parseInt(userId)
                    };
                    
                    // Collect Address if > 100
                    if (estimatedPrice > 100) {
                        printRequest.fullName = document.getElementById('pr-dev-fullname').value;
                        printRequest.phoneNumber = document.getElementById('pr-dev-phone').value;
                        printRequest.addressLine = document.getElementById('pr-dev-address').value;
                        printRequest.city = document.getElementById('pr-dev-city').value;
                        printRequest.pincode = document.getElementById('pr-dev-pincode').value;
                    }
                    
                    // Add the print request as a JSON blob
                    formData.append('request', new Blob([JSON.stringify(printRequest)], {
                        type: 'application/json'
                    }));
                    
                    // Add the file
                    formData.append('file', file);

                    const response = await fetch('http://localhost:8080/api/print-requests', {
                        method: 'POST',
                        body: formData // Fetch automatically sets multipart boundary
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
                        document.getElementById('pr-pages').value = '1';
                        document.getElementById('pr-sets').value = '1';
                        document.getElementById('pr-estimated-price').innerText = '0';
                        document.getElementById('pr-address-section').style.display = 'none';
                    } else {
                        const errorMsg = await response.text();
                        alert("Failed to submit request: " + errorMsg);
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
        const pages = Math.max(0, parseInt(document.getElementById('pr-pages')?.value || 0));
        const sets = Math.max(1, parseInt(document.getElementById('pr-sets')?.value || 1));
        const type = document.getElementById('pr-type')?.value;
        const priceDisplay = document.getElementById('pr-estimated-price');
        const addressSection = document.getElementById('pr-address-section');

        if (!priceDisplay) return;

        const rate = type === "Color" ? 5 : 2; // ₹5 for Color, ₹2 for B&W
        const total = Math.max(0, pages * sets * rate);
        priceDisplay.textContent = total;

        // 🚛 Delivery Logic: Only for orders > ₹100
        if (addressSection) {
            addressSection.style.display = total > 100 ? 'block' : 'none';
        }
    };

    ['pr-pages', 'pr-type', 'pr-sets'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calculatePrintPrice);
        document.getElementById(id)?.addEventListener('change', calculatePrintPrice);
    });


    // 🏎️ QUICK ACTION NAVIGATION
    document.getElementById('quick-new-print')?.addEventListener('click', () => {
        document.querySelector('[data-section="print"]')?.click();
    });
    
    document.getElementById('quick-view-history')?.addEventListener('click', () => {
        document.querySelector('[data-section="orders"]')?.click();
    });

    window.updatePrintQueueStatus = async () => {
        const userId = localStorage.getItem('userId') || 101;
        const queueDiv = document.getElementById('print-queue-info');
        if (!queueDiv) return;

        try {
            const response = await fetch(`http://localhost:8080/api/print-requests/queue-status/${userId}`);
            const data = await response.json();

            if (data.active) {
                queueDiv.style.display = 'block';
                document.getElementById('queue-pos').innerText = data.position;
                document.getElementById('queue-time').innerText = data.estimatedTimeMinutes;
            } else {
                queueDiv.style.display = 'none';
            }
        } catch (e) { console.error("Queue status error:", e); }
    };

    setInterval(window.updatePrintQueueStatus, 15000);
    window.updatePrintQueueStatus();

    // --- New: Load Smart Sections ---
    async function loadTrendingProducts() {
        const list = document.getElementById('trending-products-list');
        if (!list) return;
        try {
            const res = await fetch('http://localhost:8080/api/products');
            const products = await res.json();
            const trending = products.sort((a,b) => b.salesCount - a.salesCount).slice(0, 3);
            list.innerHTML = trending.map(p => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid #f1f5f9;">
                    <span style="font-size: 0.9rem;">${p.name}</span>
                    <span class="badge badge-info" style="font-size: 0.75rem;">${p.salesCount} sold</span>
                </div>
            `).join('');
        } catch(e) {}
    }

    async function loadSemesterPacks() {
        const list = document.getElementById('semester-packs-list');
        if (!list) return;
        try {
            const res = await fetch('http://localhost:8080/api/combos');
            const combos = await res.json();
            list.innerHTML = combos.slice(0, 2).map(c => `
                <div style="padding: 0.75rem; background: #f0fdf4; border-radius: 8px; margin-bottom: 0.5rem;">
                    <h4 style="font-size: 0.9rem; color: #166534;">${c.name}</h4>
                    <p style="font-size: 0.8rem; color: #15803d; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.items}</p>
                    <button class="btn btn-primary btn-sm-custom" onclick="addComboToCart('${c.name}', ${c.price})" style="margin-top: 0.5rem; width: 100%;">Get for ₹${c.price}</button>
                </div>
            `).join('');
        } catch(e) {}
    }

    async function updateLoyaltyPoints() {
        const pointsDisplay = document.getElementById('reward-points-display');
        const userId = localStorage.getItem('userId') || 1;
        if (!pointsDisplay) return;

        try {
            const res = await fetch(`http://localhost:8080/api/users/${userId}`);
            const user = await res.json();
            pointsDisplay.textContent = user.rewardPoints || 0;
            
            // Add a badge for tier
            const tierBadge = document.createElement('span');
            tierBadge.className = 'badge';
            tierBadge.style.cssText = `
                margin-left: 0.5rem; font-size: 0.7rem; padding: 0.2rem 0.5rem; 
                background: ${user.loyaltyTier === 'GOLD' ? '#ffd700' : (user.loyaltyTier === 'SILVER' ? '#c0c0c0' : '#cd7f32')};
                color: white; border-radius: 4px;
            `;
            tierBadge.innerText = user.loyaltyTier || 'BRONZE';
            pointsDisplay.appendChild(tierBadge);
        } catch(e) { console.error("Loyalty Fetch Error:", e); }
    }

    updateLoyaltyPoints();
    loadTrendingProducts();
    loadSemesterPacks();
    updateCommentBadge(0);
});
