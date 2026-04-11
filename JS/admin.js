/* ============================================
   admin.js – Admin Dashboard Logic
   Location:  js/admin.js
   Depends on: js/data.js (loaded before this in HTML)
   Data Structure: Queue (FIFO) for Order Processing
   ============================================ */

"use strict";

/* ────────────────────────────────────────────
   QUEUE CLASS (FIFO)
   enqueue(order)  → add to back
   dequeue()       → remove from front  ← FIFO
   peek()          → see front without removing
   isEmpty()       → boolean check
   size()          → count
   toArray()       → read-only snapshot
──────────────────────────────────────────── */
class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift();
    }

    peek() {
        return this.isEmpty() ? null : this.items[0];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    toArray() {
        return [...this.items];
    }
}

/* ────────────────────────────────────────────
   STATE
──────────────────────────────────────────── */
const orderQueue    = new Queue();
let processedOrders = [];
let orderIdCounter  = 1000;

/* ────────────────────────────────────────────
   PRODUCTS – uses localStorage
   Falls back to data.js mock data if empty
──────────────────────────────────────────── */
function getProducts() {
    const raw = localStorage.getItem("products");
    if (raw) return JSON.parse(raw);

    // Fall back to data.js mock data if available, else use defaults
    if (typeof mockProducts !== "undefined") return mockProducts;
    return getDefaultProducts();
}

function saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
}

function getDefaultProducts() {
    return [
        { id: 1, name: "Wireless Headphones",  price: 89.99,  stock: 24, category: "Electronics", image: "" },
        { id: 2, name: "Leather Wallet",        price: 39.99,  stock: 3,  category: "Clothing",     image: "" },
        { id: 3, name: "Ceramic Mug Set",       price: 24.99,  stock: 50, category: "Home & Living", image: "" },
        { id: 4, name: "Running Shoes",         price: 119.99, stock: 15, category: "Sports",        image: "" },
        { id: 5, name: "JavaScript: The Book",  price: 34.99,  stock: 8,  category: "Books",         image: "" },
    ];
}

/* ────────────────────────────────────────────
   ADD PRODUCT
──────────────────────────────────────────── */
/* Holds the base64 string of the chosen image */
let selectedImageBase64 = "";

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        selectedImageBase64 = e.target.result;

        const preview        = document.getElementById("image-preview");
        const previewWrapper = document.getElementById("image-preview-wrapper");
        const uploadText     = document.getElementById("file-upload-text");

        preview.src          = selectedImageBase64;
        previewWrapper.style.display = "block";
        uploadText.textContent       = file.name;
    };
    reader.readAsDataURL(file);
}

function clearImagePreview() {
    selectedImageBase64 = "";
    document.getElementById("prod-image").value          = "";
    document.getElementById("image-preview").src         = "";
    document.getElementById("image-preview-wrapper").style.display = "none";
    document.getElementById("file-upload-text").textContent = "Click to choose an image from your PC";
}

function addProduct(event) {
    event.preventDefault();

    const name     = document.getElementById("prod-name").value.trim();
    const price    = parseFloat(document.getElementById("prod-price").value);
    const stock    = parseInt(document.getElementById("prod-stock").value);
    const category = document.getElementById("prod-category").value;

    if (!name || isNaN(price) || isNaN(stock) || !category) {
        showToast("Please fill in all required fields.", "error");
        return;
    }

    const products = getProducts();
    products.push({ id: Date.now(), name, price, stock, category, image: selectedImageBase64 });
    saveProducts(products);

    document.getElementById("product-form").reset();
    clearImagePreview();
    renderProducts();
    updateStats();
    showToast(`"${name}" added successfully!`);
}

/* ────────────────────────────────────────────
   DELETE PRODUCT
──────────────────────────────────────────── */
function deleteProduct(id) {
    const products = getProducts().filter(p => p.id !== id);
    saveProducts(products);
    renderProducts();
    updateStats();
    showToast("Product removed.");
}

/* ────────────────────────────────────────────
   RENDER PRODUCT LIST
──────────────────────────────────────────── */
function renderProducts() {
    const container = document.getElementById("product-list");
    const searchVal = document.getElementById("search-products").value.toLowerCase();
    let products    = getProducts();

    if (searchVal) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(searchVal) ||
            p.category.toLowerCase().includes(searchVal)
        );
    }

    if (products.length === 0) {
        container.innerHTML = `<p class="empty-msg">No products found.</p>`;
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="product-item">
            ${p.image
                ? `<img src="${p.image}" class="product-img" alt="${p.name}"
                        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                   <div class="product-img-placeholder" style="display:none;"><i class="fa-solid fa-image"></i></div>`
                : `<div class="product-img-placeholder"><i class="fa-solid fa-box"></i></div>`
            }
            <div class="product-details">
                <div class="product-name">${p.name}</div>
                <div class="product-meta">${p.category}</div>
            </div>
            <span class="stock-badge ${p.stock <= 5 ? "stock-low" : "stock-ok"}">
                ${p.stock} ${p.stock <= 5 ? "⚠" : "in stock"}
            </span>
            <span class="product-price">$${p.price.toFixed(2)}</span>
            <button class="btn-delete" onclick="deleteProduct(${p.id})" title="Delete product">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join("");
}

/* ────────────────────────────────────────────
   QUEUE – SIMULATE NEW ORDER (ENQUEUE)
──────────────────────────────────────────── */
const sampleCustomers = ["Ahmed", "Sara", "Mohamed", "Nour", "Omar", "Layla", "Youssef"];
const sampleItems = [
    { name: "Wireless Headphones", price: 89.99 },
    { name: "Leather Wallet",       price: 39.99 },
    { name: "Running Shoes",        price: 119.99 },
    { name: "Ceramic Mug Set",      price: 24.99 },
    { name: "JavaScript: The Book", price: 34.99 },
    { name: "Smart Watch",          price: 199.99 },
    { name: "Sunglasses",           price: 59.99 },
];

function enqueueRandomOrder() {
    const customer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
    const item     = sampleItems[Math.floor(Math.random() * sampleItems.length)];
    const qty      = Math.floor(Math.random() * 3) + 1;

    const order = {
        id:        `ORD-${++orderIdCounter}`,
        customer,
        item:      item.name,
        total:     (item.price * qty).toFixed(2),
        qty,
        timestamp: new Date().toLocaleTimeString()
    };

    orderQueue.enqueue(order);   // → added to BACK of queue
    renderQueue();
    updateStats();
    showToast(`New order ${order.id} added to queue.`);
}

/* ────────────────────────────────────────────
   QUEUE – PROCESS NEXT ORDER (DEQUEUE / FIFO)
──────────────────────────────────────────── */
function processNextOrder() {
    if (orderQueue.isEmpty()) {
        showToast("Queue is empty! No orders to process.", "warn");
        return;
    }

    const order = orderQueue.dequeue();  // ← removed from FRONT (FIFO)
    processedOrders.unshift(order);

    renderQueue();
    renderProcessedLog();
    updateStats();
    showToast(`Order ${order.id} processed successfully!`);
}

/* ────────────────────────────────────────────
   RENDER ORDER QUEUE
──────────────────────────────────────────── */
function renderQueue() {
    const container = document.getElementById("order-queue");
    const orders    = orderQueue.toArray();

    if (orders.length === 0) {
        container.innerHTML = `<p class="empty-msg">Queue is empty. Simulate orders above.</p>`;
        return;
    }

    container.innerHTML = orders.map((order, index) => `
        <div class="order-item ${index === 0 ? "order-first" : ""}">
            <div class="order-number">${index + 1}</div>
            <div class="order-details">
                <div class="order-id">${order.id} — ${order.customer}</div>
                <div class="order-meta">${order.qty}x ${order.item} &nbsp;·&nbsp; ${order.timestamp}</div>
            </div>
            <span class="order-total">$${order.total}</span>
        </div>
    `).join("");
}

/* ────────────────────────────────────────────
   RENDER PROCESSED LOG
──────────────────────────────────────────── */
function renderProcessedLog() {
    const container = document.getElementById("processed-log");

    if (processedOrders.length === 0) {
        container.innerHTML = `<p class="empty-msg">No orders processed yet.</p>`;
        return;
    }

    container.innerHTML = processedOrders.map(order => `
        <div class="log-item">
            <i class="fa-solid fa-circle-check"></i>
            <span><span class="log-id">${order.id}</span> — ${order.customer} ($${order.total})</span>
            <span class="log-time">${order.timestamp}</span>
        </div>
    `).join("");
}

/* ────────────────────────────────────────────
   CLEAR PROCESSED LOG
──────────────────────────────────────────── */
function clearProcessedLog() {
    processedOrders = [];
    renderProcessedLog();
    updateStats();
}

/* ────────────────────────────────────────────
   UPDATE STATS CARDS
──────────────────────────────────────────── */
function updateStats() {
    const products = getProducts();
    document.getElementById("stat-products").textContent  = products.length;
    document.getElementById("stat-queue").textContent     = orderQueue.size();
    document.getElementById("stat-processed").textContent = processedOrders.length;
    document.getElementById("stat-lowstock").textContent  = products.filter(p => p.stock <= 5).length;
}

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

/* ────────────────────────────────────────────
   INIT
──────────────────────────────────────────── */
function init() {
    if (!localStorage.getItem("products")) {
        saveProducts(getDefaultProducts());
    }

    // Pre-populate queue with sample orders on first load
    enqueueRandomOrder();
    enqueueRandomOrder();

    renderProducts();
    renderQueue();
    renderProcessedLog();
    updateStats();
}

document.addEventListener("DOMContentLoaded", init);