const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { protect } = require('./middlewares/authMiddleware');
const { getCart, addToCart, removeFromCart, getWishlist, addToWishlist, removeFromWishlist} = require('./controllers/authController');
const { addReview } = require('./controllers/productController');
// Load environment variables
dotenv.config();
// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({origin: '*'})); // Allow CORS from any origin
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

//custom mapping for frontend
//cart routes
app.get('/api/cart', protect, getCart);
app.post('/api/cart', protect, addToCart);
app.delete('/api/cart/:productId', protect, removeFromCart);
//wishlist routes
app.get('/api/wishlist', protect, getWishlist);
app.post('/api/wishlist', protect, addToWishlist);
app.delete('/api/wishlist/:productId', protect, removeFromWishlist);
//review routes
app.post('/api/reviews', protect, addReview);

//Global error handler
app.use(require('./middlewares/errorMiddleware'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});