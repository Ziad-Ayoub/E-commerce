const Order = require('../models/Order');

//create order by user
exports.createOrder = async (req, res) => {
    try {
        const { customer, qty, item, total } = req.body;
        //generate timestamp
        const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const order = await Order.create({ customer, qty, item, total, timestamp });
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};