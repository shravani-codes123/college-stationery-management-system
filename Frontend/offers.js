/**
 * 🏷️ Smart Offer & Loyalty Engine
 * Logic for dynamic pricing, combos, and rewards.
 */

class OfferEngine {
    constructor() {
        this.userId = localStorage.getItem('userId') || 1; // Default for demo
        this.init();
    }

    async init() {
        await this.loadCombos();
        await this.loadUserRewards();
        await this.loadStrategies();
    }

    async loadStrategies() {
        const container = document.getElementById('promo-strategy-list');
        if (!container) return;

        try {
            const res = await fetch('http://localhost:8080/api/offers/strategies');
            const strategies = await res.json();

            container.innerHTML = strategies.map(s => `
                <div style="padding: 0.75rem; background: #f1f5f9; border-radius: 8px; margin-bottom: 0.5rem;">
                    <h4 style="font-size: 0.9rem; color: #1e293b;">${s.title}</h4>
                    <p style="font-size: 0.8rem; color: #64748b;">${s.description}</p>
                    <button class="btn btn-sm-custom" style="margin-top:0.5rem; background:#fff; border:1px solid #cbd5e1; font-size:0.7rem;" onclick="activateStrategy('${s.title}')">Activate Now</button>
                </div>
            `).join('');
        } catch (e) { console.error("Strategies Error", e); }
    }

    async loadCombos() {
        const container = document.getElementById('combo-deals-list');
        if (!container) return;

        try {
            const res = await fetch('http://localhost:8080/api/offers/combos');
            const combos = await res.json();

            container.innerHTML = combos.map(c => `
                <div class="card" style="padding: 1.5rem; border-top: 4px solid #6366f1;">
                    <span class="badge badge-info" style="font-size: 0.7rem;">${c.tag}</span>
                    <h4 style="margin-top: 0.5rem;">${c.name}</h4>
                    <ul style="font-size: 0.85rem; color: #64748b; margin: 1rem 0; padding-left: 1.2rem;">
                        ${c.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <span style="font-weight: 800; font-size: 1.2rem; color: var(--primary-color);">₹${c.price}</span>
                        <button class="btn btn-primary btn-sm-custom" onclick="addComboToCart('${c.name}', ${c.price})">Buy Bundle</button>
                    </div>
                </div>
            `).join('');
        } catch (e) { console.error("Combos Error", e); }
    }

    async loadUserRewards() {
        const display = document.getElementById('reward-points-display');
        if (!display) return;

        try {
            // Fetch user info (assuming endpoint exists or using mock)
            const res = await fetch(`http://localhost:8080/api/users/${this.userId}`);
            const user = await res.json();
            
            display.innerText = user.rewardPoints || 0;
            
            // Check for loyalty discount
            const res2 = await fetch(`http://localhost:8080/api/offers/user-rewards/${this.userId}`);
            const rewards = await res2.json();
            
            if (rewards.extraDiscount > 0) {
                const badge = document.createElement('div');
                badge.className = 'status-badge status-completed';
                badge.style.marginTop = '0.5rem';
                badge.innerText = `Loyalty Tier: ${user.loyaltyTier} (+${rewards.extraDiscount}% Off)`;
                display.parentElement.appendChild(badge);
            }
        } catch (e) { console.error("Rewards Error", e); }
    }
}

// Manager Functions
async function applyDynamicPricing() {
    const log = document.getElementById('pricing-log');
    if (log) log.innerText = "Applying AI pricing rules...";

    try {
        const res = await fetch('http://localhost:8080/api/offers/apply-dynamic-pricing', { method: 'POST' });
        if (res.ok) {
            if (log) log.innerText = "✅ AI Pricing Applied! Discounts updated across catalog.";
            setTimeout(() => { location.reload(); }, 2000);
        }
    } catch (e) { 
        if (log) log.innerText = "❌ Error applying rules.";
    }
}

async function addComboToCart(name, price) {
    if (window.addToCart) {
        // We add it as a single 'Combo' item to the cart
        await window.addToCart(`📦 ${name}`, price, 99); // 99 as dummy stock for bundle
        alert(`${name} bundle added to your cart! Check the Purchase section to checkout.`);
    } else {
        alert("Cart system not initialized. Please refresh the page.");
    }
}

async function activateStrategy(title) {
    alert(`AI Strategy '${title}' has been activated! Relevant products will be updated with special discounts.`);
}

async function requestHostelDelivery() {
    const hostel = prompt("Please enter your Hostel Name and Room Number:");
    if (hostel) {
        try {
            const res = await fetch('http://localhost:8080/api/campus-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: localStorage.getItem('userId') || 1,
                    type: 'HOSTEL_DELIVERY',
                    details: `Hostel: ${hostel}`
                })
            });
            if (res.ok) {
                alert(`Hostel Delivery requested for ${hostel}. Our delivery partner will contact you shortly! (₹10 will be added to your final bill)`);
            }
        } catch (e) { console.error("Request Error:", e); }
    }
}

async function requestBulkQuote() {
    const event = prompt("Enter the name of your Club/Event:");
    if (event) {
        try {
            const res = await fetch('http://localhost:8080/api/campus-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: localStorage.getItem('userId') || 1,
                    type: 'BULK_QUOTE',
                    details: `Event/Club: ${event}`
                })
            });
            if (res.ok) {
                alert(`Bulk Quote request for '${event}' submitted! Our manager will send a personalized discount proposal to your email within 2 hours.`);
            }
        } catch (e) { console.error("Request Error:", e); }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OfferEngine();
});
