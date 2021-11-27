const mongoose = require('mongoose');

const productShema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please enter product name"],
		trim: true
	},
	description: {
		type: String,
		required: [true, "Please enter description"]
	},
	price: {
		type: Number,
		required: [true, "Please enter price"],
		maxLength: [8, "Price cannot exceed 2 characters"]
	},
	ratings: {
		type: Number,
		default: 0
	},
	images: [
		{
			public_id: {
				type: String,
				required: true
			},
			url:{
				type: String,
				required: true
			}
		}
	],
	category: {
		type: String,
		required: [true, "Please enter category"],
	},
	stock: {
		type: Number,
		required: [true, "Please enter stock"],
		maxLength: [4, "Stock cannot exceed 4 characters"],
		default: 1
	},
	numOfReviews: {
		type: Number,
		default: 0
	},
	reviews: [
		{
			user: {
				type: mongoose.Schema.ObjectId,
				ref: "user",
				required: true
			},
			name: {
				type: String,
				required: true
			},
			rating: {
				type: Number,
				required: true
			},
			comment: {
				type: String,
				required: true
			}
		}
	],
	user: {
		type: mongoose.Schema.ObjectId,
		ref: "user",
		required: true
	},
	createAt: {
		type: Date,
		default: Date.now()
	}
})

module.exports = mongoose.model("Product", productShema);
