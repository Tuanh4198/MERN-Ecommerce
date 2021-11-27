const catchAsyncErrors = require('./catchAsyncErrors');
const ErrorHandler = require('../utils/errorhandler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
	const { token } = req.cookies;
	if(!token) {
		return next(new ErrorHandler("Please login"), 401);
	}
	const decodeedData = jwt.verify(token, process.env.JWT_SECRET);
	req.user = await User.findById(decodeedData.id);
	next();
})

exports.authorizeRoles = (...roles) => {
	return (req, rea, next) => {
		if(!roles.includes(req.user.role)) {
			return next(
				new ErrorHandler(`Roles: ${req.user.role} is not allowed to access this resouce`, 403)
			)
		}
		next();
	}
}
