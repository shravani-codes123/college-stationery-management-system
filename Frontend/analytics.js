/**
 * 📊 Sales Analytics Dashboard
 * Using Chart.js to visualize daily, monthly sales and top products.
 */

class SalesAnalytics {
    constructor() {
        this.dailyCtx = document.getElementById('dailySalesChart')?.getContext('2d');
        this.monthlyCtx = document.getElementById('monthlySalesChart')?.getContext('2d');
        this.topCtx = document.getElementById('topProductsChart')?.getContext('2d');

        if (this.dailyCtx) {
            this.init();
        }
    }

    async init() {
        showChartLoading();
        await Promise.all([
            this.loadDailySales(),
            this.loadMonthlySales(),
            this.loadTopProducts(),
            this.loadSalesInsights()
        ]);
    }

    async loadSalesInsights() {
        try {
            const response = await fetch('http://localhost:8080/api/insights/dashboard');
            if (!response.ok) return;
            const insights = await response.json();

            // 1. Best Seller
            if (insights.bestSeller) {
                document.getElementById('best-seller-name').innerText = insights.bestSeller.name;
                const tag = insights.bestSeller.seasonalTag || 'General Demand';
                document.getElementById('best-seller-reason').innerText = `High demand: ${tag}`;
            }

            // 2. Low-Performing Alert
            if (insights.lowPerforming && insights.lowPerforming.length > 0) {
                const lp = insights.lowPerforming[0];
                const lpAlert = document.getElementById('low-performing-alert');
                if (lpAlert) {
                    lpAlert.style.display = 'block';
                    document.getElementById('low-performer-name').innerText = lp.name;
                    document.getElementById('low-performer-reason').innerText = `High stock (${lp.quantity}), but low sales (${lp.salesCount || 0}).`;
                }
            }

            // 3. Profit Margin
            document.getElementById('profit-margin').innerText = `${insights.profitMargin}%`;
            
            // --- NEW: Profitability Stats ---
            if (insights.profitability) {
                document.getElementById('total-revenue').innerText = `₹${insights.profitability.totalRevenue}`;
                document.getElementById('total-profit').innerText = `₹${insights.profitability.totalProfit}`;
            }

            // 4. Offer Recommendations
            const recContainer = document.getElementById('ai-recommendations');
            if (recContainer && insights.recommendations) {
                recContainer.innerHTML = '';
                insights.recommendations.forEach(rec => {
                    recContainer.innerHTML += `
                        <div style="background: #fdfce8; border-left: 4px solid #f59e0b; padding: 1rem; border-radius: 4px; margin-bottom: 0.5rem;">
                            <h4 style="margin: 0; color: #b45309; font-size: 0.95rem;">${rec.productName}</h4>
                            <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; color: #78350f;">${rec.suggestion}</p>
                        </div>
                    `;
                });
            }

            // --- NEW: Demand Prediction Chart ---
            if (insights.demandPrediction) {
                this.renderDemandChart(insights.demandPrediction.forecast);
                this.renderDemandInsights(insights.demandPrediction.insights, insights.demandPrediction.alerts);
            }

            // --- NEW: Peak Hours Heatmap (Simplified) ---
            if (insights.peakHours) {
                this.renderPeakHoursChart(insights.peakHours);
            }

            // --- NEW: Product Lifecycle ---
            if (insights.lifecycle) {
                this.renderLifecycleList(insights.lifecycle);
            }

        } catch (error) {
            console.error("Error loading insights", error);
        }
    }

    renderDemandChart(forecast) {
        const ctx = document.getElementById('demandPredictionChart')?.getContext('2d');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: forecast.map(f => f.name),
                datasets: [
                    {
                        label: 'Current Monthly Sales',
                        data: forecast.map(f => f.current),
                        borderColor: '#94a3b8',
                        fill: false
                    },
                    {
                        label: 'Predicted Next Month',
                        data: forecast.map(f => f.predicted),
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    renderPeakHoursChart(peakHours) {
        const ctx = document.getElementById('peakHoursChart')?.getContext('2d');
        if (!ctx) return;
        const labels = Object.keys(peakHours);
        const data = Object.values(peakHours);
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Orders per Hour',
                    data: data,
                    backgroundColor: data.map(v => v > 5 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.5)'),
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    renderLifecycleList(lifecycle) {
        const container = document.getElementById('product-lifecycle-list');
        if (!container) return;
        container.innerHTML = lifecycle.map(l => `
            <div style="display:flex; justify-content:space-between; padding:0.5rem; border-bottom:1px solid #f1f5f9;">
                <span style="font-size:0.9rem;">${l.name}</span>
                <span class="badge ${this.getBadgeClass(l.stage)}">${l.stage}</span>
            </div>
        `).join('');
    }

    renderDemandInsights(insights, alerts) {
        const container = document.getElementById('demand-insights-list');
        if (!container) return;
        let html = alerts.map(a => `<p style="color:#dc2626; font-size:0.85rem; font-weight:600;">⚠️ ${a}</p>`).join('');
        html += insights.map(i => `<p style="color:#2563eb; font-size:0.85rem;">💡 ${i}</p>`).join('');
        container.innerHTML = html;
    }

    getBadgeClass(stage) {
        if (stage.includes('Maturity')) return 'badge-success';
        if (stage.includes('Growth')) return 'badge-info';
        if (stage.includes('Introduction')) return 'badge-warning';
        return 'badge-secondary';
    }

    async loadDailySales() {
        try {
            const data = await this.fetchData('http://localhost:8080/api/analytics/sales/daily');
            new Chart(this.dailyCtx, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.label),
                    datasets: [{
                        label: 'Daily Sales (₹)',
                        data: data.map(d => d.value),
                        backgroundColor: 'rgba(37, 99, 235, 0.6)',
                        borderColor: 'rgb(37, 99, 235)',
                        borderWidth: 1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        } catch (e) { console.error("Daily Sales Error:", e); }
    }

    async loadMonthlySales() {
        try {
            const data = await this.fetchData('http://localhost:8080/api/analytics/sales/monthly');
            new Chart(this.monthlyCtx, {
                type: 'bar', // Mixed chart
                data: {
                    labels: data.map(d => d.month),
                    datasets: [
                        {
                            label: 'Monthly Revenue (₹)',
                            data: data.map(d => d.revenue),
                            backgroundColor: 'rgba(16, 185, 129, 0.4)',
                            borderColor: '#10b981',
                            borderWidth: 1,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Total Orders',
                            data: data.map(d => d.orderCount),
                            type: 'line',
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            fill: false,
                            tension: 0.3,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: 'Revenue (₹)' }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            title: { display: true, text: 'Order Count' }
                        }
                    }
                }
            });
        } catch (e) { console.error("Monthly Sales Error:", e); }
    }

    async loadTopProducts() {
        try {
            const data = await this.fetchData('http://localhost:8080/api/analytics/top-products');
            new Chart(this.topCtx, {
                type: 'pie',
                data: {
                    labels: data.map(d => d.label),
                    datasets: [{
                        data: data.map(d => d.value),
                        backgroundColor: [
                            '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'
                        ]
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        } catch (e) { console.error("Top Products Error:", e); }
    }

    async fetchData(url) {
        const res = await fetch(url);
        return await res.json();
    }
}

function showChartLoading() {
    // Optional: Add loading spinners to canvas parents
}

document.addEventListener('DOMContentLoaded', () => {
    new SalesAnalytics();
});
