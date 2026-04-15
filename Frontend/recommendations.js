/**
 * 🤖 AI Recommendation System
 * Suggests products to students based on global popularity and categories.
 */

class RecommendationSystem {
    constructor() {
        this.userId = localStorage.getItem('userId') || 101; // Mock user ID
        this.container = document.getElementById('recommendation-list');

        if (this.container) {
            this.loadRecommendations();
        }
    }

    async loadRecommendations() {
        try {
            const response = await fetch(`http://localhost:8080/api/recommendations/${this.userId}`);
            const products = await response.json();
            this.renderProducts(products);
        } catch (error) {
            console.error("Failed to load recommendations:", error);
            this.container.innerHTML = '<p>No recommendations available at this time.</p>';
        }
    }

    renderProducts(products) {
        if (products.length === 0) {
            this.container.innerHTML = '<p>No recommendations available at this time.</p>';
            return;
        }

        this.container.innerHTML = products.map(p => {
            const ratingId = `rec-rating-${p.id}`;
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
                    <div class="product-stock">Popular choice for students!</div>
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
    new RecommendationSystem();
});
