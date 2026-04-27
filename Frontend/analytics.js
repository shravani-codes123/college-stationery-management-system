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
            this.loadTopProducts()
        ]);
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
