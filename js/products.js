//Product data
const products = [
    {id: 1, title: " test product", price : 99 , category: "Glasses", image: "https://m.media-amazon.com/images/I/41Aug9VNcfL._AC_SX679_.jpg"  }
    ,{id: 2, title: " test product", price : 199 , category: "Shoes", image:"https://m.media-amazon.com/images/I/71VTEP9+P4L._AC_SY695_.jpg" }
    ,{id: 3, title: " test product", price : 299 , category: "Clothing", image:"https://m.media-amazon.com/images/I/71suPUcIWyL._AC_SY606_.jpg" }
    ,{id: 4, title: " test product", price : 399 , category: "Accessories", image: "https://m.media-amazon.com/images/I/4117LwSvhjL._AC_SX569_.jpg"}
    ,{id: 5, title: " test product", price : 499 , category: "Glasses", image: "https://m.media-amazon.com/images/I/41xVB9WJrEL._AC_SX679_.jpg"}
    ,{id: 6, title: " test product", price : 599 , category: "Glasses", image: "https://m.media-amazon.com/images/I/31l5KGLk0KL._AC_SX522_.jpg"}
    ,{id: 7, title: " test product", price : 699 , category: "Glasses", image: "https://m.media-amazon.com/images/I/51CEIkGZY2L._AC_SX569_.jpg"}
    ,{id: 8, title: " test product", price : 799 , category: "Glasses", image: "https://m.media-amazon.com/images/I/61HRzMH53hL._AC_UL480_FMwebp_QL65_.jpg"}
    ,{id: 9, title: " test product", price : 899 , category: "Glasses", image: "https://m.media-amazon.com/images/I/31zsmiF41UL._AC_UL480_FMwebp_QL65_.jpg"}
    ,{id: 10, title: " test product", price : 999 , category: "Glasses", image: "https://m.media-amazon.com/images/I/51pTNz63fGL._AC_UL480_FMwebp_QL65_.jpg"}
];

let filteredProducts = [...products];

// Products Grid Render
function renderProducts(productsToShow = filteredProducts) {
    const grid = document.getElementById('productsGrid');
    document.getElementById('resultCount').textContent = productsToShow.length;
    document.getElementById('totalProducts').textContent = products.length;
    
    grid.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">$${product.price.toLocaleString()}</div>
            </div>
        </div>
    `).join('');

    document.getElementById('resultCount').textContent = productsToShow.length;
    document.getElementById('totalProducts').textContent = products.length;
}

// Update the filter count badge
function updateFilterCount() {
    let count = document.querySelectorAll('input[type="checkbox"]:checked').length;
    const minPrice = document.getElementById('minPrice')?.value;
    const maxPrice = document.getElementById('maxPrice')?.value;


    if (minPrice || maxPrice) count++;

    const countEle = document.getElementById ('filterCount');
    const applyBtn = document.getElementById ('applyFilters');

    if (countEle) {
        countEle.textContent = count;
        countEle.style.display = count > 0 ? 'flex' : 'none';
    }
    if (applyBtn) {
        applyBtn.disabled = false;
    }
}


// Apply all filters
function applyFilters() {
    let results = [...products];

    // Category filters
    const selectedCategories= Array.from(document.querySelectorAll('input[data-filter="Category"]:checked')).map(cb => cb.dataset.value);

    if(selectedCategories.length > 0) {
        results = results.filter(product => selectedCategories.includes(product.category));
    }

    // Price range filters
    const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || Infinity;    
    results = results.filter(product => product.price >= minPrice && product.price <= maxPrice);
    
    // Results output
    filteredProducts = results;
    renderProducts(results);
}


// Clear All Filters
function clearFilters() {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => { checkbox.checked =false; });

    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';

    const searchInput = document.getElementById('searchInput');
    const searchBar = document.getElementById('searchBar')
    if (searchInput) searchInput.value = '';
    if (searchBar) searchBar.classList.remove('active');

    updateFilterCount();
    applyFilters();
}
// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args){
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait)
    };
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    // Initial render
    renderProducts();
    updateFilterCount();
    // Filter event listners
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateFilterCount)
    });
    document.getElementById('minPrice')?.addEventListener('input', debounce(updateFilterCount,200));
    document.getElementById('maxPrice')?.addEventListener('input', debounce(updateFilterCount,200));

    // Apply Filter btn
    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);

    // Clear All button
    document.getElementById('clearFilters')?.addEventListener('click', clearFilters);
});

// Search function
function performSearch(){
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    let results = filteredProducts;

    if(searchTerm) {
        results =results.filter(product => 
            product.title.toLowerCase().includes(searchTerm) || product.category.toLowerCase().includes(searchTerm)
        );
    }
    renderProducts(results);
}

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchButton');
const searchBar = document.getElementById('searchBar');
if (searchInput) {
    searchInput.addEventListener('keypress',(e) => {
        if (e.key === 'Enter') {performSearch()}
    }
    );
    searchInput.addEventListener('input', debounce(() => {
        if (searchBar) {
            searchBar.classList.toggle('active',searchInput.value.length > 0);
        }
    },100))
}
if (searchBtn) {searchBtn.addEventListener('click',performSearch)}

document.addEventListener('click', (e) => {
    if (e.target.closest('.product-card')) {
        const productId = e.target.closest('.product-card').dataset.productId;
        if(productId) {
            window.location.href = `details.html?id=${productId}`;
        }
    }
});

// Export to other files
window.products =products;
window.renderProducts = renderProducts;
window.applyFilters = applyFilters;