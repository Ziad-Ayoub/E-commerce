const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.registerUser = async (req, res) => {
    try{
        const { name, email, password } = req.body;
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = await User.create({ name, email, password });
        res.status(201).json({
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                token: generateToken(user._id),
                user: {
                    
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                    
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.password) {

            //just assign raw text, and userSchema.pre('save') hook will automatically hash it
            user.password = req.body.password;
        }
        await user.save();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Cart and wishlist logic
exports.getCart = async (req, res) => {
    try {
        // Populate cart with product details
        const user = await User.findById(req.user._id).populate('cart.product');
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const {productId, quantity} = req.body;
        const user = await User.findById(req.user._id);
        const itemIndex = user.cart.findIndex(item => item.product.toString() === productId);

        // if qty is provided, use it. otherwise, default is 1.
        const qtyToAdd = quantity ? Number(quantity) : 1;
        
        if (itemIndex > -1) {
            user.cart[itemIndex].quantity += 1; // Increment quantity if product already in cart
        } else {
            user.cart.push({ product: productId, quantity: qtyToAdd }); // Add new product to cart
        }
        await user.save();
        res.status(201).json(user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
        await user.save();
        res.json({ message: 'Product removed from cart' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//add to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        //only add to wishlist if not already present
        if (!user.wishlist.some(id => id.toString() === productId)) {
            user.wishlist.push(productId);
            await user.save();
        }
        res.status(200).json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//remove from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        //filter out the product to be removed from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
        await user.save();
        res.json({ message: 'Product removed from wishlist' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
