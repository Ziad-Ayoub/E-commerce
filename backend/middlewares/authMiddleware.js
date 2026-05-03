
// middlewares/authMiddleware.js to protect routes and handle admin access
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//protect routes
exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            //find user in DB
            req.user = await User.findById(decoded.id).select('-password');

            //if token is valid but user was deleted
            if (!req.user) {
                return res.status(401).json({ message: 'User no longer exists. Please log out and register again.'})
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

//Admin only routes
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access only' });
    }
};