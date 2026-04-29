/**
 * 🎓 Student Smart Insights
 * Trending products, Budget planning, and Semester packs.
 */

class StudentInsights {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadTrending();
        this.initBudgetPlanner();
    }

    async loadTrending() {
        const container = document.getElementById('trending-products-list');
        if (!container) return;

        try {
            const response = await fetch('http://localhost:8080/api/analytics/top-products');
            const products = await response.json();

            container.innerHTML = products.slice(0, 3).map(p => `
                <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem; padding:0.5rem; background:#fff5f5; border-radius:8px;">
                    <div style="background:#fee2e2; color:#ef4444; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.8rem;">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div>
                        <h4 style="font-size:0.85rem; margin:0;">${p.label}</h4>
                        <p style="font-size:0.75rem; color:#991b1b; margin:0;">${p.value} sold this week</p>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            console.error("Trending Load Error", e);
        }
    }

    initBudgetPlanner() {
        const budgetInput = document.getElementById('budget-limit');
        const budgetProgress = document.getElementById('budget-progress');
        const budgetStatus = document.getElementById('budget-status');

        if (!budgetInput) return;

        const updateBudget = async () => {
            const limit = parseFloat(budgetInput.value) || 1000;
            // Mocking current spent - in real app would fetch from user's order total this month
            const spent = 450; 
            const percent = Math.min((spent / limit) * 100, 100);
            
            budgetProgress.style.width = `${percent}%`;
            budgetProgress.style.background = percent > 90 ? '#ef4444' : (percent > 70 ? '#f59e0b' : '#6366f1');
            budgetStatus.innerText = `You've spent ₹${spent} / ₹${limit}`;
        };

        budgetInput.oninput = updateBudget;
        updateBudget();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StudentInsights();
});
