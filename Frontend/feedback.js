/**
 * ⭐️ Feedback & Rating System
 * Handles product reviews and average rating display.
 */

let currentProductId = null;
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', () => {
    const starSelector = document.getElementById('star-selector');
    if (starSelector) {
        const stars = starSelector.querySelectorAll('i');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.getAttribute('data-rating'));
                stars.forEach(s => {
                    const r = parseInt(s.getAttribute('data-rating'));
                    if (r <= selectedRating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });
    }
});

window.openFeedbackModal = (productId) => {
    currentProductId = productId;
    selectedRating = 0;
    document.getElementById('feedback-comment').value = '';
    document.querySelectorAll('#star-selector i').forEach(s => s.classList.remove('active'));
    document.getElementById('feedback-modal').style.display = 'block';
};

window.closeFeedbackModal = () => {
    document.getElementById('feedback-modal').style.display = 'none';
};

window.submitFeedback = async () => {
    if (selectedRating === 0) {
        alert("Please select a star rating!");
        return;
    }

    const comment = document.getElementById('feedback-comment').value;
    const userId = localStorage.getItem('userId') || 101;

    try {
        const response = await fetch('http://localhost:8080/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(userId),
                productId: currentProductId,
                rating: selectedRating,
                comment: comment
            })
        });

        if (response.ok) {
            alert("Thank you for your feedback!");
            closeFeedbackModal();
            // Optionally refresh the specific product card's rating
            location.reload(); 
        }
    } catch (error) {
        console.error("Feedback submission error:", error);
    }
};

/**
 * Helper to fetch and display average rating for a product card
 */
window.loadProductRatings = async (productId, elementId) => {
    try {
        const response = await fetch(`http://localhost:8080/api/feedback/${productId}/average`);
        const data = await response.json();
        const element = document.getElementById(elementId);
        if (element && data.count > 0) {
            element.innerHTML = `
                <div class="rating-stars">
                    ${generateStarHtml(data.average)}
                    <span style="color: var(--text-muted); font-size: 0.75rem;">(${data.count})</span>
                </div>
            `;
        } else if (element) {
            element.innerHTML = `
                <div class="rating-stars" style="color: #d1d5db;">
                    <i class="far fa-star"></i> No ratings yet
                </div>
            `;
        }
    } catch (e) { console.error(e); }
};

function generateStarHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            html += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            html += '<i class="fas fa-star-half-alt"></i>';
        } else {
            html += '<i class="far fa-star"></i>';
        }
    }
    return html;
}
