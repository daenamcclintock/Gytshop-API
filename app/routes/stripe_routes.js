// Import Dependecies, Middleware and Models 
const express = require('express')
const passport = require('passport')
const Product = require('../models/product')
const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const requireToken = passport.authenticate('bearer', { session: false })
const removeBlanks = require('../../lib/remove_blank_fields')

// Stripe Dependencies
require("dotenv").config()
const stripe = require("stripe")('sk_test_51KlisSJAF3e1vqKyLl7zRDSoXZEGqvzlkkmzSfSjw5r05HD91P7HOzYOtVuHShAGB3C3mUIx5chnkrz6EzngO9dY00myKBu9nc')
const cors = require("cors")

// instantiate a router (mini app that only handles routes)
const router = express.Router()

router.post("/payment", cors(), async (req, res) => {
	let { amount, id } = req.body
	try {
		const payment = await stripe.paymentIntents.create({
			amount,
			currency: "USD",
			description: "GytShop Payment",
			payment_method: id,
			confirm: true
		})
		console.log("Payment", payment)
		res.json({
			message: "Payment successful",
			success: true
		})
	} catch (error) {
		console.log("Error", error)
		res.json({
			message: "Payment failed",
			success: false
		})
	}
})

module.exports = router