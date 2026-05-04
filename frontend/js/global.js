

// Check user role and show Admin navbar link if authorized
document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
        const user = JSON.parse(userStr);
        
        // Check if the user is an admin (handles both common database setups: role === 'admin' OR isAdmin === true)
        if (user.role === 'admin' || user.isAdmin === true) {
            const adminLink = document.getElementById('admin-nav-item');
            if (adminLink) {
                adminLink.style.display = 'block'; // Unhide the link!
            }
        }
    }
});
//Global Cache for Wishlist IDs
window.userWishlistIds = null; 

window.syncWishlistUI = async function() {
    const token = localStorage.getItem('authToken');
    if (!token) return; // Stop if not logged in

    // Fetch from backend ONLY if we haven't already cached it
    if (window.userWishlistIds === null) {
        try {
            const res = await fetch(`${API_URL}/wishlist`, { headers: getAuthHeaders() });
            if (res.ok) {
                const wishlist = await res.json();
                // Store just the IDs in our global array
                window.userWishlistIds = wishlist.map(item => item._id || item);
            } else {
                window.userWishlistIds = [];
            }
        } catch (error) {
            console.error('Error syncing wishlist UI:', error);
            window.userWishlistIds = [];
        }
    }

    // Apply the filled stars to the UI
    const wishedIds = window.userWishlistIds || [];
    document.querySelectorAll('.add-to-wishlist').forEach(btn => {
        const productId = btn.dataset.id;
        const icon = btn.querySelector('i');
        
        if (wishedIds.includes(productId)) {
            btn.classList.add('active');
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid'); // Fill the star/heart!
        } else {
            btn.classList.remove('active');
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular'); // Empty the star/heart!
        }
    });
};

//makes clicking on product, leads to it's details page
document.addEventListener('click', async (e) => {
    const cartBtn= e.target.closest('.add-to-cart');
    const wishlistbtn = e.target.closest('.add-to-wishlist');
    const productCard = e.target.closest('.product-card');
    
    //for clicking on "Add to cart" btn
    if (cartBtn) {
        const productId = cartBtn.dataset.id;
        
        try {
            const response = await fetch(`${API_URL}/cart`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ productId })
            });
            if (response.ok) {
                showToast('Product added to cart!');
            } else {
                const errData = await response.json();
                showToast(`Backend Error: ${errData.message}`);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showToast('Failed to add product to cart. Please try again later.');
        }
    }

    //for clicking on "Add to Wishlist" btn
    else if (wishlistbtn){
        const productId = wishlistbtn.dataset.id;
        const icon = wishlistbtn.querySelector('i');

        //if the icon is regular (empty star), we add to wishlist and change to solid star, else we remove from wishlist and change back to regular star
        const isAdding = icon.classList.contains('fa-regular');

        try {
            const method = isAdding ? 'POST' : 'DELETE';
            const url = isAdding ? `${API_URL}/wishlist` : `${API_URL}/wishlist/${productId}`;
            const body = isAdding ? JSON.stringify({ productId }) : null; 

            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: body
            });

            if (response.ok) {
                // Toggle the CSS only if the DB update was successful
                wishlistbtn.classList.toggle('active');
                icon.classList.toggle('fa-regular');
                icon.classList.toggle('fa-solid');

                if (window.userWishlistIds !== null){
                    if (isAdding) {
                        window.userWishlistIds.push(productId)
                        showToast(`Product added to your WishList`);
                    } else {
                        window.userWishlistIds = window.userWishlistIds.filter(id => id !== productId)
                        showToast(`Product removed from your WishList`);
                    }
                }
                
            } else{
                const errData = await response.json();
                showToast(`Backend Error: ${errData.message}`);
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
            showToast('Failed to update wishlist. Please try again later.');
        }
    }
    

    //for clicking on Card
    else if (productCard) {
        const productId = productCard.dataset.productId;
        if(productId) {
            window.location.href = `details.html?id=${productId}`;
        }
    }
});

/* ────────────────────────────────────────────
   TOAST NOTIFICATION
──────────────────────────────────────────── */
function showToast(message, type = "success") {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const icons = { success: "fa-circle-check", error: "fa-circle-xmark", warn: "fa-triangle-exclamation" };
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.success}" style="margin-right:8px;"></i>${message}`;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}