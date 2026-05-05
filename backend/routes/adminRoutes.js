const express = require('express');
const router = express.Router();
const { deleteProduct, getPendingOrders, processOrder, getProcessedOrders, clearProcessedLog} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

//routes automatically prefixed with /api/admin by server.js

router.delete('/products/:id', protect, admin, deleteProduct);
router.get('/orders/pending', protect, admin, getPendingOrders);
router.get('/orders/processed', protect, admin, getProcessedOrders);
router.delete('/orders/processed/clear', protect, admin, clearProcessedLog);
router.put('/orders/:id/process', protect, admin, processOrder);

//allow access if the token is valid and user is admin, otherwise return 200
router.get('/admin/dashboard', protect, admin, (req, res) => {
    res.status(200).json({ message: 'Admin access confirmed' });
});

module.exports = router;