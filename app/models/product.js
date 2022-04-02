const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
			required: true
		},
		category: {
			type: String,
			required: true
		},
		stock: {
			type: Number,
			required: true
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		// reviews: [reviewSchema]
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Product', productSchema)