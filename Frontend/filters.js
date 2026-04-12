/**
 * 🔍 Smart Search & Filter System
 * Updates product list dynamically based on category, price, and discounts.
 */

class ProductFilters {
    constructor() {
        this.searchInp = document.getElementById('search-name');
        this.categorySel = document.getElementById('filter-category');
        this.priceRng = document.getElementById('filter-price');
        this.priceVal = document.getElementById('price-val');
        this.discountChk = document.getElementById('filter-discount');
        this.applyBtn = document.getElementById('apply-filters');
        this.productList = document.getElementById('product-list');

        if (this.applyBtn) {
            this.init();
        }
    }

    init() {
        // Update price display label as slider moves
        this.priceRng.addEventListener('input', () => {
            this.priceVal.innerText = this.priceRng.value;
        });

        // Search on Enter key
        this.searchInp.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.applyFilters();
        });

        // Apply filters on button click
        this.applyBtn.addEventListener('click', () => this.applyFilters());

        // Optional: Apply filters on input change for real-time experience
        this.categorySel.addEventListener('change', () => this.applyFilters());
        this.discountChk.addEventListener('change', () => this.applyFilters());
    }

    async applyFilters() {
        const name = this.searchInp.value;
        const category = this.categorySel.value;
        const price = this.priceRng.value;
        const discount = this.discountChk.checked;

        let url = `http://localhost:8080/api/products?maxPrice=${price}&discount=${discount}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;
        if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;

        try {
            this.productList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">Searching...</p>';
            const response = await fetch(url);
            const products = await response.json();
            this.renderProducts(products);
        } catch (error) {
            console.error("Filter Error:", error);
            this.productList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Error fetching products.</p>';
        }
    }

    renderProducts(products) {
        if (products.length === 0) {
            this.productList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No products match your criteria. Try adjusting filters.</p>';
            return;
        }

        this.productList.innerHTML = products.map(p => {
            const ratingId = `filter-rating-${p.id}`;
            setTimeout(() => { if(window.loadProductRatings) window.loadProductRatings(p.id, ratingId); }, 0);
            return `
            <div class="product-card">
                <div class="product-img">
                    <img src="${p.imageUrl || 'notebook.jpeg'}" alt="${p.name}">
                </div>
                ${p.discount > 0 ? `<span class="discount-tag">${p.discount}% OFF</span>` : ''}
                <div class="product-details">
                    <div class="product-name">${p.name}</div>
                    <div id="${ratingId}"></div>
                    <div class="product-price">₹${p.price}</div>
                    <div class="product-stock">Stock: ${p.quantity} available</div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="addToCart('${p.name}', ${p.price}, ${p.quantity})" style="flex: 2; padding: 0.5rem;">Add to Cart</button>
                        <button class="btn" onclick="openFeedbackModal(${p.id})" style="flex: 1; padding: 0.5rem; background: #f8fafc; border: 1px solid var(--border-color);"><i class="far fa-comment"></i></button>
                    </div>
                </div>
            </div>`;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProductFilters();
});
