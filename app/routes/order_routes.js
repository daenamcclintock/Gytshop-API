// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for order
const Order = require('../models/order')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
const user = require('../models/user')
const product = require('../models/product')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

/******************** ROUTES *******************/
    //Routes needed
    //Index route for showing items in cart
    //Update route for updating items in cart
    //Delete route for deleting items in cart

    //once a user clicks on the cart tab, they should be brought to their own cart
    //cart should display items that user added by themselves
    //when a user clicks on the add to cart button via show page, 
    //the productId will need to be pushed into the productsOrdered schema 
    //which is an empty array 
    //each user has a specific productsOrdered 

//index Route for showing items in our cart
router.get('/orders', requireToken, (req,res,next) => {

    // req.body.order.owner = req.user.id
    console.log('this is req.user', req.user._id)
    req.body.owner = req.user._id
    
    Order.find()
        //this will populate items in the users current cart
        .populate('productsOrdered')
        //once populated, if there are items in the users cart we will load them
        // `orders` will be an array of Mongoose documents
        // .populate('productsOrdered')
        // we want to convert each one to a POJO, so we use `.map` to
        // apply `.toObject` to each one
        .then(orders => {
            return orders.productsOrdered.map(order => order.toObject())
        })
        .then(orders=> res.status(200).json({orders:orders}))
        .catch(next)
})

//INDEX Route to show the orders in the My Orders page
router.get('/orders/:userId', requireToken, (req,res,next) => {
    Order.findById(req.params.id)
        //this will populate items in the users current cart
        .then(handle404)
        //if item found, it will show 
        .then(order=> res.status(200).json({order:order.toObject()}))
        .catch(next)
})

// CREATE order
//POST /orders
router.post('/orders/:productId', requireToken, (req, res, next) => {

    req.body.owner = req.user.id
    // get owner ID (which is the currently logged in user ID)
    // const ownerId = req.user.id
    console.log('owner id: ', req.body.owner)
    const order = req.body.order
    // get product ID
    const productid = req.params.productId

    // Find the order that belongs to the currently logged in user
    Order.find({owner: req.body.owner})
        // .populate('owner')
        .then(handle404)
        .then( order => {
            console.log('this is the product', productid)
            console.log('this is the order', order)
            console.log('this is the productsOrdered', order[0].productsOrdered)
            // Push the product to the productsOrdered array
            order[0].productsOrdered.push(productid)
            return order[0].save()
        })
        // Then we send the pet as json
        .then( order => res.status(201).json({ order: order }))
        // Catch errors and send to the handler
        .catch(next)

    // This adds an order manually through postman
    // Order.create(req.body.order)
    //     .then((order) => {
    //         // send a successful response like this
    //         res.status(201).json({ order: order.toObject() })
    //     })
    //     // if an error occurs, pass it to the error handler
    //     .catch(next)
    })


// // UPDATE -> PATCH /order/5a7db6c74d55bc51bdf39793
// router.patch('/orders/:productId/:orderId', requireToken, removeBlanks, (req, res, next) => {
//     const orderId = req.params.orderId
//     const productId = req.params.productId
// 	Product.findById(productId)
// 		.then(handle404)
// 		.then(product => {
//             const theProduct = product.order.id(orderId)
// 			requireOwnership(req, product)
// 			// pass the result of Mongoose's `.update` to the next `.then`
//             theProduct.set(req.body.order)
// 			return product.save()
// 		})
// 		// if that succeeded, return 204 and no JSON
// 		.then(() => res.sendStatus(204))
// 		// if an error occurs, pass it to the handler
// 		.catch(next)
// })

// DESTROY -> DELETE /order/
router.delete('/orders/:id', requireToken, (req, res, next) => {
    const orderId = req.params.orderId
    const productId = req.params.productId
	Product.findById(productId)
		.then(handle404)
		.then(product => {
            const theOrder = product.order.id(orderId)
			requireOwnership(req, product)
			// Delete the order ONLY IF the above didn't error
            theOrder.remove()
            return product.save()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})


<<<<<<< HEAD
=======
// // UPDATE -> PATCH /orders/5a7db6c74d55bc51bdf39793
router.patch('/orders', requireToken, (req, res, next) => {
    // Add productID to the productsOrdered []. (WE NEED THE PRODUCTID)
    // increment quantity filed in Order and decrement stock filed in Product
})

// First, click on product to enter SHOW page
// Create a form in the show page of the product 
// On show page, select product amount (this should be added to the quantity field in Order)
// Add product to cart by adding the product's ID to the cart(this has an ID) - productsOwned array

>>>>>>> 7d4f430 (fixed merge issue)
/***********************************************/

module.exports = router