const Product = require ('../models/Product');

//get all products
exports.getProducts = async (req, res) => {
    try {
        //build query object based on filters(minprice, maxprice, category)
        let query = {};
        if (req.query.category) query.category = {$in: req.query.category.split(',')}; // Support multiple categories
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }

        let queryObj = Product.find(query);

        // Sorting
        if (req.query.sort) queryObj = queryObj.sort(req.query.sort.split(',').join(' ')); // Support multiple sort fields
        if (req.query.limit) queryObj = queryObj.limit(Number(req.query.limit));

        const products = await queryObj;
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//get single product by id
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//add new review to product
exports.addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        };

        product.reviews.push(review);
        //calculate average rating
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        await product.save();
        res.json({ message: 'Review added successfully', review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
