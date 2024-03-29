const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please enter your name"],
		maxLength: [30, "Name cannot exceed 30 characters"],
		minLength: [6, "Name should have more than 6 characters"],
	},
	email: {
		type: String,
		required: [true, "Please enter your email"],
		unique: true,
		validate: [validator.isEmail, "Please enter a valid email"]
	},
	password: {
		type: String,
		required: [true, "Please enter your password"],
		select: true
	},
	avatar: {
		public_id: {
			type: String,
			required: true
		},
		url:{
			type: String,
			required: true
		}
	},
	role: {
		type: String,
		default: "user"
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date
});

// mã hóa password trước khi tạo mới
userSchema.pre("save", async function (next) {
	// check password modified
	if(!this.isModified("password")) {
		next();
	}
	//  mã hóa password
	this.password = await bcrypt.hash(this.password, 10)
})

// func getJWTToken jwt token
userSchema.methods.getJWTToken = function() {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	})
}

// compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
}

// genarating password reset token
userSchema.methods.getResetPasswordToken = function() {
	// genarating token
	const resetToken = crypto.randomBytes(20).toString("hex");
	// hashing and adding resetPasswordToken to userSchema
	this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
	this.resetPasswordToken = Date.now() + 15 * 60 * 1000;
	return resetToken;
}

module.exports = mongoose.model("User", userSchema);
