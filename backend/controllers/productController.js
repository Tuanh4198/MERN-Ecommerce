const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apifeatures');

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
	req.body.user = req.user.id;
	const product = await Product.create(req.body);
	res.status(201).json({
		success: true,
		product
	})
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
	let product = Product.findById(req.params.id);
	if(!product) {
		return next(new ErrorHandler("Project not found", 404))
	}
	product = await Product.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
		useFindAndModify: false
	});
	res.status(200).json({
		success: true,
		product
	})
});

exports.getAllProducts = catchAsyncErrors(async (req, res) => {
	const resultPerPage = 8;
	const productCount = await Product.countDocuments();
	const apiFeatures = new ApiFeatures(Product.find(), req.query)
		.search()
		.filter()
		.pagination(resultPerPage);
	const products = await apiFeatures.query;
	let filteredProductsCount = products.length;
	res.status(200).json({
		success: true,
		products,
		productCount,
		resultPerPage,
		filteredProductsCount
	})
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.params.id);
	if(!product) {
		return next(new ErrorHandler("Project not found", 404))
	}
	await product.remove();
	res.status(200).json({
		success: true, 
		message: 'Product delete successfull'
	})
});

exports.getProductDetail = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.params.id);
	if(!product) {
		return next(new ErrorHandler("Project not found", 404))
	}
	res.status(200).json({
		success: true,
		product
	})
});

exports.createProductReview = catchAsyncErrors(async (req, res) => {
	const { rating, comment, productId } = req.body;
	const newReview = {
		user: req.user._id,
		name: req.body.name,
		rating: Number(rating),
		comment
	};
	const product = await Product.findById(productId);
	const isReview = product.reviews.find(
		(rev) => rev.user.toString() === req.user._id.toString()
	)

	if(isReview) {
		product.reviews.forEach((rev) => {
			if(rev.user.toString() === req.user._id.toString())
				(rev.rating = rating), (rev.comment = comment);
		});
	} else {
		product.reviews.push(newReview);
		product.numOfReviews = product.reviews.length;
	}

	let avg = 0;
	product.reviews.forEach((rev) => {
		avg += rev.rating;
	}) 
	product.ratings = avg / product.reviews.length;

	await product.save({ validateBeforeSave: false });
	res.status(200).json({
		success: true
	})
});

exports.getAllProductRevews = catchAsyncErrors(async (req, res) => {
	const product = await Product.findById(req.query.productId);
	if(!product) {
		return next(new ErrorHandler("Project not found", 404))
	}
	res.status(200).json({
		success: true,
		reviews: product.reviews
	})
})

exports.deleteReview = catchAsyncErrors(async (req, res) => {
	const product = await Product.findById(req.query.productId);
	if(!product) {
		return next(new ErrorHandler("Project not found", 404))
	}
	const reviewList = product.reviews.filter(
		(rev) => rev._id.toString() !== req.query.id.toString()
	);
	let avg = 0;
	reviewList.forEach((rev) => {
		avg += rev.rating;
	});
	const ratings = avg / reviewList.length;
	const numOfReviews = reviewList.length;
	await Product.findByIdAndUpdate(
		req.query.productId,
		{
			reviews: reviewList,
			ratings,
			numOfReviews
		},
		{
			new: true,
			runValidators: true,
			useFindAndModify: false
		}
	)
	res.status(200).json({
		success: true
	})
})
