/**
 * 🔔 Notifications System
 * Handles real-time alerts for Low Stock, New Orders, and Print Requests.
 */

class NotificationSystem {
    constructor() {
        this.userId = localStorage.getItem('userId') || 1; // Default to 1 for Manager
        this.bell = document.getElementById('notification-bell');
        this.badge = document.getElementById('notif-badge');
        this.dropdown = document.getElementById('notif-dropdown');
        this.list = document.getElementById('notif-list');
        this.markReadBtn = document.getElementById('mark-all-read');
        this.lastCount = 0;
        this.notifSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Professional notification sound

        if (this.bell) {
            this.init();
        }
    }

    init() {
        // Toggle Dropdown
        this.bell.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dropdown.classList.toggle('active');
        });

        // Close on outside click
        document.addEventListener('click', () => {
            this.dropdown.classList.remove('active');
        });

        // Mark all as read
        if (this.markReadBtn) {
            this.markReadBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.markAllAsRead();
            });
        }

        // Initial fetch and poll every 10 seconds
        this.fetchNotifications();
        setInterval(() => this.fetchNotifications(), 10000);
    }

    async fetchNotifications() {
        try {
            const response = await fetch(`http://localhost:8080/api/notifications/unread?userId=${this.userId}`);
            const notifications = await response.json();
            
            // Play sound if new notifications arrived
            if (notifications.length > this.lastCount) {
                this.notifSound.play().catch(e => console.log("Sound play blocked by browser"));
            }
            this.lastCount = notifications.length;
            
            this.updateUI(notifications);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }

    updateUI(notifications) {
        // Update Badge safely
        if (this.badge) {
            if (notifications.length > 0) {
                this.badge.innerText = notifications.length;
                this.badge.style.display = 'block';
            } else {
                this.badge.style.display = 'none';
            }
        }

        // Update List
        if (notifications.length === 0) {
            this.list.innerHTML = '<p class="no-notif">No new notifications</p>';
            return;
        }

        this.list.innerHTML = notifications.map(n => `
            <div class="notif-item unread">
                <p>${n.message}</p>
                <small>${new Date(n.createdAt).toLocaleString()}</small>
            </div>
        `).join('');
    }

    async markAllAsRead() {
        try {
            const response = await fetch(`http://localhost:8080/api/notifications/mark-read?userId=${this.userId}`, {
                method: 'PUT'
            });
            if (response.ok) {
                if (this.badge) this.badge.style.display = 'none';
                this.list.innerHTML = '<p class="no-notif">No new notifications</p>';
                this.fetchNotifications(); // Refresh
            }
        } catch (error) {
            console.error("Failed to mark read:", error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NotificationSystem();
});
