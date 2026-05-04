============================================
ShopGo E-commerce Project.
============================================

made using:
1. HTML, CSS, JavaScript for the Front-end
2. Express.JS and Node.js for the Back-end
3. MongoDB for DataBase

============================================
Needs to render the project:
============================================

1. VS code
2. Node.js (when opening the folder, to run back-end, change directory to Back-end then write [npm run dev])
3. MongoDB Compass (database URI: mongodb://127.0.0.1:27017/MyStore)

============================================
1. BACKEND ARCHITECTURE (Node.js & Express)
============================================

Core Server Files

server.js: The central entry point of the application. It establishes the Express server, connects to MongoDB, configures global middleware (CORS, JSON parser), mounts all route handlers, and sets up static file serving for uploaded images.

.env: Stores environment variables (Port, MongoDB URI, JWT Secret) to keep sensitive credentials secure and out of the source code.

Configuration (/config)

db.js: Handles the asynchronous connection logic to the MongoDB database using Mongoose.

Models (/models) - Defines the MongoDB database schemas

User.js: Defines the user structure (name, email, role, hashed passwords) and embeds the user's specific cart and wishlist arrays.

Product.js: Defines the product catalog structure (title, price, stock, images) and embeds the review schema for product ratings.

Order.js: Defines the structure for processed and pending orders, tracking the customer, quantities, items, and total price.

Controllers (/controllers) - The "brains" of the application handling business logic

authController.js: Manages user registration, login, JWT token generation, profile updates, and the user-specific logic for modifying carts and wishlists.

productController.js: Handles fetching the public product catalog, applying search/price/category filters, sorting, and adding customer reviews.

orderController.js: Securely calculates checkout totals based on database prices, decrements purchased stock from the inventory, creates new orders, and empties the user's cart.

adminController.js: Handles privileged admin actions, including product creation, secure product deletion (simultaneously cleaning orphaned images and scrubbing user carts/wishlists), and processing the FIFO order queue.

Middlewares (/middlewares)

authMiddleware.js: Contains the protect function (verifies JWTs to ensure a user is logged in) and the admin function (blocks non-admin users from accessing privileged routes).

uploadMiddleware.js: Configures Multer to handle image file uploads, ensuring files are uniquely named and stored in the /uploads directory.

errorMiddleware.js: A global error catcher that formats backend crashes into readable JSON responses.

Routes (/routes) - Maps URL endpoints to controller functions

authRoutes.js: Endpoints for login, registration, and profile updates.

productRoutes.js: Endpoints for fetching products and adding new ones.

orderRoutes.js: Endpoints for triggering the checkout process.

adminRoutes.js: Endpoints exclusively reserved for admin dashboard operations.

============================================
2. FRONTEND ARCHITECTURE (HTML, CSS, Vanilla JS)
============================================

Global / Shared Files

css/global.css: Establishes the CSS variables (colors, fonts, shadows) and styles shared components like the navbar, footer, and buttons to ensure site-wide consistency.

js/global.js: Manages site-wide JavaScript state. It checks if the active user is an admin to toggle the navbar link, handles global click events for "Add to Cart" / "Wishlist" buttons, and synchronizes the wishlist UI (filled vs. empty stars) across all pages.

js/api.js: A utility file that stores the base API_URL and a helper function to easily attach the user's JWT token to protected fetch requests.

Pages & Page-Specific Logic

index.html & js/home.js: The landing page. JavaScript dynamically fetches the newest items for the "New Arrivals" section and passes category parameters via URL when a category card is clicked.

products.html & js/products.js: The main shop catalog. Uses JavaScript to dynamically render the product grid, handle client-side pagination, and apply complex filtering (search queries, price ranges, and category checkboxes).

details.html & js/details.js: The single product view. Fetches specific product data, renders dynamic customer reviews, and utilizes a custom Circular Doubly Linked List data structure to operate the interactive image gallery slider.

cart.html & js/cart.js: The user's shopping bag. Handles removing items, triggering the secure backend checkout, and utilizes a Stack data structure to allow users to "Undo" their last deletion.

wishlist.html & js/wishlist.js: Renders the user's saved items, allowing them to move products directly into their cart or remove them from the list.

profile.html & js/profile.js: Handles the UI for user authentication (toggling between login and register forms), displays active user data, and allows profile editing.

admin.html & js/admin.js: The command center for store owners. JavaScript handles live image previews for product uploads, updates statistical counters, and utilizes a Queue (FIFO) data structure to process incoming orders sequentially.