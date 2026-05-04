const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    _id :{ type:String},
    customer: {type: String, required: true},
    qty: {type: Number, required: true},
    item: {type: String, required: true},
    total: {type: Number, required: true},
    status: {type: String, enum: ['pending', 'processed'], default: 'pending'},
    timestamp: {type: String}
}, {timestamps: true});

module.exports = mongoose.model('Order', orderSchema);