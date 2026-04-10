const mongoose = require('mongoose');
const productModel = require('../Model/productModel');
const Category = require('../Model/categoryModel');

/*
==============================
Get All Products
==============================
*/

exports.getAllproducts = async (req, res) => {
    try {
        // =========================
        // 1) Filtering
        // =========================
        const queryObj = { ...req.query };

        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);

        // fix operators (gte, gt, lte, lt)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let filter = JSON.parse(queryStr);

        // custom category filter
        if (req.query.categories) {
            filter.category = {
                $in: req.query.categories.split(',')
            };
        }

        let query = productModel.find(filter);

        // =========================
        // 2) Sorting
        // =========================
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt'); // default sort
        }

        // =========================
        // 3) Field Limiting
        // =========================
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // =========================
        // 4) Pagination
        // =========================
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // check if page exists
        const totalDocs = await productModel.countDocuments(filter);
        if (skip >= totalDocs) {
            return res.status(400).json({
                status: 'fail',
                message: 'This page does not exist'
            });
        }

        query = query.skip(skip).limit(limit);

        // =========================
        // 5) Populate
        // =========================
        query = query.populate('category');

        // =========================
        // 6) Execute Query
        // =========================
        const products = await query;

        // =========================
        // 7) Response
        // =========================
        res.status(200).json({
            status: 'success',
            results: products.length,
            page: page,
            data: products
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/*
==============================
Get Single Product
==============================
*/

exports.getProuduct = async (req, res) => {

    try {

        const findProduct = await productModel.findById(req.params.id);

        if (!findProduct) {
            return res.status(404).json({
                status: 'fail',
                success: false
            });
        }

        res.status(200).json({
            status: 'success',
            data: findProduct
        });

    } catch (error) {

        res.status(400).json({
            status: 'fail',
            message: 'Invalid Id'
        });
    }
};

/*
==============================
Create Product
==============================
*/

exports.createProuducts = async (req, res) => {

    try {

        const category = await Category.findById(req.body.category);

        if (!category) {
            return res.status(400).send('Invalid Category');
        }

        const setProducts = await productModel.create({
            name: req.body.name,
            discription: req.body.discription,
            richDiscription: req.body.richDiscription,
            image: req.body.image,
            images: req.body.images,
            price: req.body.price,
            brand: req.body.brand,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            isFeatured: req.body.isFeatured,
            dateCreated: req.body.dateCreated
        });

        res.status(201).json({
            status: 'success',
            data: setProducts
        });

    } catch (error) {

        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

/*
==============================
Delete Product
==============================
*/

exports.DeleteProducts = async (req, res) => {

    try {

        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid Product ID format'
            });
        }

        const deletedProduct = await productModel.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully'
        });

    } catch (error) {

        res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    }
};

/*
==============================
Update Product              
==============================
*/

exports.UpdateProduct = async (req, res) => {

    try {

        const category = await Category.findById(req.body.category);

        if (!category) {
            return res.status(400).send('Invalid Category');
        }

        const editProduct = await productModel.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                discription: req.body.discription,
                richDiscription: req.body.richDiscription,
                image: req.body.image,
                images: req.body.images,
                price: req.body.price,
                brand: req.body.brand,
                category: req.body.category,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                isFeatured: req.body.isFeatured,
                dateCreated: req.body.dateCreated
            },
            { new: true }
        );

        if (!editProduct) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({
            status: 'success',
            data: editProduct
        });

    } catch (error) {

        res.status(500).json({
            status: 'fail',
            message: 'Internal server error'
        });
    }
};

exports.ProductsCount = async (req,res)=>{
    const count = req.params.count ? req.params.count : 0;

    const countAProduct = await productModel
        .find({isFeatured:true})
        .limit(+count);

    if(!countAProduct){
        return res.status(500).json({success:false});
    }

    res.send({result: countAProduct});
};


