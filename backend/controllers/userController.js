const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

exports.registerUser = catchAsyncErrors( async (req, res, next) => {
	const {name, email, password} = req.body;
	const user = await User.create({
		name, 
		email, 
		password,
		avatar: {
			public_id: "123",
			url: "profilepicUrl"
		}
	})

	sendToken(user, 200, res);
});

exports.loginUser = catchAsyncErrors( async (req, res, next) => {
	const {email, password} = req.body;
	if(!email | !password) {
		return next(new ErrorHandler("Please enter email & password"), 400);
	}

	const user = await User.findOne({ email }).select("+password");
	if(!user) {
		return next(new ErrorHandler("Invalid email or password"),  401);
	}

	const isPasswordMatched = await user.comparePassword(password);
	if(!isPasswordMatched) {
		return next(new ErrorHandler("Invalid email ot password"), 401);
	}

	sendToken(user, 200, res);
});

exports.Logout = catchAsyncErrors( async (req, res, next) => {
	res.cookie("token", null, {
		expires: new Date(Date.now()),
		httpOnly: true
	});
	res.status(200).json({
		success: true,
		message: "Logged Out"
	})
});

exports.forgotPassword = catchAsyncErrors( async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if(!user) {
		return next(new ErrorHandler('User not found', 404));
	}
	// get reset password token
	const resetToken = user.getResetPasswordToken();
	await user.save({ validateBeforeSave: false });
	const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
	const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
	try {
		await sendEmail({
			email: user.email,
			subject: `Ecommerce password recovery`,
			message
		})
		res.status(200).json({
			success: true,
			message: `Email sent to ${user.email} successfully`
		})
	} catch (error) {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		await user.save({ validateBeforeSave: false });
		return next(new ErrorHandler(error.message, 500))
	}
});

exports.resetPassword = catchAsyncErrors( async (req, res, next) => {
	const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() }
	})
	if(!user) {
		return next(new ErrorHandler("Reset password token is invalid or has been expired"),  404);
	}
	if(req.body.password !== req.body.confirmPassword) {
		return next(new ErrorHandler("Password and confirm password does not match"),  400);
	}
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save();
	sendToken(user, 200, res);
});

exports.getUserDetail = catchAsyncErrors( async (req, res, next) => {
	const user = await User.findById(req.user.id);
	if(!user) {
		return next(new ErrorHandler('User not found', 404));
	}
	res.status(200).json({
		success: true,
		user
	})
});

exports.updatePassword = catchAsyncErrors( async (req, res, next) => {
	const user = await User.findById(req.user.id).select("+password");
	const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
	
	if(!isPasswordMatched) {
		return next(new ErrorHandler('Old password is incorrect', 400));
	}
	if(req.body.newPassword !== req.body.confirmPassword) {
		return next(new ErrorHandler("Password does not match"),  400);
	}
	
	user.password = req.body.newPassword;
	await user.save();
	sendToken(user, 200, res);
});

exports.updateProfile = catchAsyncErrors( async (req, res, next) => {
	const newProfile = {
		name: req.body.name,
		email: req.body.email
	}
	await User.findByIdAndUpdate(req.user.id, newProfile, {
		new: true,
		runValidators: true,
		useFindAndModify: false
	});
	res.status(200).json({
		success: true,
	})
});

exports.getAllUser = catchAsyncErrors( async (req, res, next) => {
	const users = await User.find();
	res.status(200).json({
		success: true,
		users
	})
});

exports.getSimpleUser = catchAsyncErrors( async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if(!user) {
		return next(new ErrorHandler('User not exist with ID: ' + req.params.id));
	}
	res.status(200).json({
		success: true,
		user
	})
});

exports.updateUserRole = catchAsyncErrors( async (req, res, next) => {
	const newProfile = {
		name: req.body.name,
		email: req.body.email,
		role: req.body.role,
	}
	await User.findByIdAndUpdate(req.user.id, newProfile, {
		new: true,
		runValidators: true,
		useFindAndModify: false
	});
	res.status(200).json({
		success: true,
	})
});

exports.deleteUser = catchAsyncErrors( async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if(!user) {
		return next(new ErrorHandler('User not exist with ID: ' + req.params.id));
	}
	user.remove();
	res.status(200).json({
		success: true,
	})
});
