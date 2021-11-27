const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
	const { 
		shippingInfo, 
		orderItems,
		paymentInfo, 
		itemsPrice,
		taxPrice, 
		shippingPrice, 
		totalPrice
	} = req.body;
	const order = await Order.create({
		shippingInfo, 
		orderItems,
		paymentInfo, 
		itemsPrice,
		taxPrice, 
		shippingPrice, 
		totalPrice,
		paidAt: Date.now(),
		user: req.user._id
	})
	res.status(201).json({
		success: true,
		order
	})
})

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
	const order = await Order.findById(req.params.id).populate(
		"user", 
		"name email"
	);
	if(!order) {
		return next(new ErrorHandler(`Order not found with ID: ${req.params.id}`, 404)) 
	}
	res.status(200).json({
		success: true,
		order
	})
})

exports.getMyOrder = catchAsyncErrors(async (req, res, next) => {
	const orders = await Order.find({user: req.user._id});
	res.status(200).json({
		success: true,
		orders
	})
})

exports.getAllOrder = catchAsyncErrors(async (req, res, next) => {
	const orders = await Order.find();
	let totalAmount = 0;
	orders.forEach((order) => {
		totalAmount += order.totalPrice
	})
	res.status(200).json({
		success: true,
		totalAmount,
		orders
	})
})

exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
	const order = await Order.findById(req.params.í);
	if(!order) {
		return next(new ErrorHandler(`Order not found with ID: ${req.params.id}`, 404)) 
	}
	if(order.orderStatus === "Delivered") {
		return next(new ErrorHandler(`You have already delivered this order`, 400)) 
	}
	order.orderItems.forEach(item => {
		updateStock(item.product, item.quantity);
	})
	order.orderStatus = req.body.status;
	if(req.body.status === "Delivered") {
		order.deliveredAt = Date.now();
	}
	await order.save({ validateBeforeSave: false });
	res.status(200).json({
		success: true
	})
})

async function updateStock(id, qty) {
	const product = await Product.findById(id);
	product.stock -= qty;
	await product.save({ validateBeforeSave: false });
}

exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
	const order = await Order.findById(req.params.í);
	if(!order) {
		return next(new ErrorHandler(`Order not found with ID: ${req.params.id}`, 404)) 
	}
	order.remove();
	res.status(200).json({
		success: true
	})
})
