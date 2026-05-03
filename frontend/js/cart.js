let cartData = [];
let deletedItemsStack = [];


async function renderCart() {
    const tableBody = document.getElementById('cart-table-body');
    const totalPriceElement = document.getElementById('total-price');
    const undoBtn = document.getElementById('undo-btn');
    
    if (!tableBody) return; 

    tableBody.innerHTML = ""; // Clear existing rows
    try {
        const res = await fetch(`${API_URL}/cart`, {headers: getAuthHeaders()});
        const cartResponse = await res.json();
        cartData = cartResponse; //store cart items in a global variable for easy access

        let total = 0;

        cartData.forEach((item, index) => {
            total += (item.product.price * item.quantity);
            tableBody.innerHTML += `
                <tr>
                    <td>${item.product.title} (x${item.quantity})</td>
                    <td>${item.product.price * item.quantity} EGP</td>
                    <td><button onclick="deleteItem(${index})">Remove</button></td>
                </tr>
            `;
        });

        if (totalPriceElement) totalPriceElement.innerText = total;
        if (undoBtn) undoBtn.style.display = deletedItemsStack.length > 0 ? "inline-block" : "none";
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="3">Please Log in to view your cart.</td></tr>';
    }
}

async function deleteItem(index) {
    const removedItem = cartData.splice(index, 1)[0];
    if (!removedItem) return;

    try {
        const response = await fetch(`${API_URL}/cart/${removedItem._id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.ok) {
            deletedItemsStack.push(removedItem);
            renderCart();
        }
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}


async function undoDelete() {
    if (deletedItemsStack.length > 0) return;
    let lastItem = deletedItemsStack.pop();
    
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId: lastItem._id })
        });
        if (response.ok) {
            renderCart();
        }else {
            console.error('Failed to restore item');
            deletedItemsStack.push(lastItem); // Push it back if restore failed
        }
    } catch (error) {
        console.error('Error restoring item:', error);
    }
}

async function checkout() {
    if (!cartData || cartData.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // 1. Calculate totals and format the items for the database
    let totalAmount = 0;
    let totalQty = 0;
    let itemNames = [];

    cartData.forEach(item => {
        totalAmount += (item.product.price * item.quantity);
        totalQty += item.quantity;
        itemNames.push(`${item.quantity}x ${item.product.title}`);
    });

    // Join the item names into a single string (e.g., "2x Shoes, 1x Hat")
    const itemString = itemNames.join(', ');
    
    // Get the user's name from localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    try {
        // 2. Send the order to the backend
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                customer: user.name,
                qty: totalQty,
                item: itemString,
                total: totalAmount
            })
        });

        if (response.ok) {
            alert('Order placed successfully! Thank you for your purchase.');
            
            // 3. Clear the cart items from the database one-by-one
            for (const item of cartData) {
                await fetch(`${API_URL}/cart/${item.product._id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
            }
            
            // 4. Re-render the empty cart
            renderCart();
        } else {
            const errData = await response.json();
            alert(`Checkout failed: ${errData.message}`);
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('An error occurred during checkout. Please try again.');
    }
}




renderCart();