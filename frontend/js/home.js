
async function renderNewArrivals() {
    const gridContainer = document.getElementById('new-arrivals-grid');
    gridContainer.innerHTML = '<p>Loading new arrivals...</p>';

try {
        const response = await fetch(`${API_URL}/products?sort=-createdAt&limit=3`);
        const products = await response.json();

        gridContainer.innerHTML = ''; // Clear loading text
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
        
            productCard.innerHTML = `
                <img src="http://localhost:5000/uploads/${product.images[0]}" alt="${product.title}" class="product-img">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">${product.price}</p>
                <a href="details.html?id=${product._id}" class="btn-details">View Details</a>
                <button class="btn-cart add-to-cart" data-id="${product._id}">Add to Cart</button>
            `;
        
            gridContainer.appendChild(productCard);
        });
    } catch (error) {
        gridContainer.innerHTML = '<p>Failed to load new arrivals. Please try again later.</p>';
        console.error('Error fetching new arrivals:', error);
    }

}
document.addEventListener('DOMContentLoaded', renderNewArrivals);