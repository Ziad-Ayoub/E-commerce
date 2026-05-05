const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');


router.put('/profile', protect, updateProfile);
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;