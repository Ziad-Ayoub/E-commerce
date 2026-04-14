// Gallery Functionality
const thumbnails = document.querySelectorAll('.thumb');
const mainImg = document.getElementById('current-img');

thumbnails.forEach(thumb => {
    thumb.addEventListener('click', function() {
        // Change Source
        mainImg.src = this.src;
        
        // Update active state
        thumbnails.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Simple animation
        mainImg.style.opacity = '0.5';
        setTimeout(() => { mainImg.style.opacity = '1'; }, 100);
    });
});

// Wishlist Toggle
const wishlistBtn = document.getElementById('wishlist-trigger');
wishlistBtn.addEventListener('click', () => {
    const icon = wishlistBtn.querySelector('i');
    icon.classList.toggle('fa-regular');
    icon.classList.toggle('fa-solid');
    
    if (icon.classList.contains('fa-solid')) {
        console.log("Added to wishlist");
    }
});
// Review Form Logic
const reviewForm = document.getElementById('review-form');
const reviewsList = document.getElementById('reviews-display-list');

reviewForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get values from input
    const rating = document.getElementById('user-rating').value;
    const comment = document.getElementById('user-comment').value;
    const stars = "⭐".repeat(rating);

    // Create new review HTML structure
    const newReview = document.createElement('div');
    newReview.classList.add('review-item');
    newReview.innerHTML = `
        <div class="review-header">
            <span class="review-user">You (Guest)</span>
            <span class="review-stars">${stars}</span>
        </div>
        <p class="review-text">${comment}</p>
    `;

    // Add to the top of the list
    reviewsList.prepend(newReview);

    // Clear the form
    reviewForm.reset();
    alert("Thank you for your review!");
});