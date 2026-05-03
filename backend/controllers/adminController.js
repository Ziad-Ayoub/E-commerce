const Product = require('../models/Product');
const Order = require('../models/Order');

//product creation by admin
exports.createProduct = async (req, res) => {
    try {
        const { title, description, price, category, stock } = req.body;
        let imageFiles = ['default.jpg']; // Default image
        if (req.files && req.files.length > 0) {
            imageFiles = req.files.map(file => file.filename);
        }
        
        const product = await Product.create({ title, description, price, category, stock, images: imageFiles });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//product deletion by admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//get pending orders for admin
exports.getPendingOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'pending' }).sort({createdAt: 1});
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//process order by admin
exports.processOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: 'processed' }, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order processed successfully', order });  
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//not yet implemented fully
//get all products for admin
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get processed orders for admin log
exports.getProcessedOrders = async (req, res) => {
    try {
        // Find processed orders, sort by newest first (descending), limit to last 50 so the log doesn't get massive
        const orders = await Order.find({ status: 'processed' }).sort({ updatedAt: -1 }).limit(50);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear all processed orders from the database
exports.clearProcessedLog = async (req, res) => {
    try {
        // deleteMany will find all orders matching the filter and delete them at once
        await Order.deleteMany({ status: 'processed' });
        res.json({ message: 'Processed orders log cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};