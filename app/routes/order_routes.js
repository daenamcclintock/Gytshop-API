// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for order
const Order = require('../models/order')
const Product = require('../models/product')

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
const { ObjectId, deleteMany } = require('mongodb')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

/******************** ROUTES *******************/
// INDEX -> GET /orders/624b4a97d257eac6012ac1fb - will get the order of the logged in user
router.get('/orders/:ownerId', requireToken, (req,res,next) => {

    // req.body.order.owner = req.user.id
    console.log('this is req.user', req.user._id)
    // req.body.owner = req.user._id
    const ownerid = req.params.ownerId
    
    Order.findOne({owner: ownerid})
        //this will populate items in the users current cart
        .populate('owner')
        .populate('productsOrdered')
        //once populated, if there are items in the users cart we will load them
        // `orders` will be an array of Mongoose documents
        // .populate('productsOrdered')
        // we want to convert each one to a POJO, so we use `.map` to
        // apply `.toObject` to each one
        // .then(orders => {
        //     return orders.productsOrdered.map(order => order.toObject())
        // })
        .then( order => {
            const productsInCart = order.productsOrdered
            return order
        })
        .then(orders => res.status(200).json({orders:orders}))
        .catch(next)
})

//INDEX Route get items in cart, send to checkout page
router.get('/orders/:userId', requireToken, (req,res,next) => {
    Order.findById(req.params.id)
        //this will populate items in the users current cart
        .then(handle404)
        //if item found, it will show 
        .then(order=> res.status(200).json({order:order.toObject()}))
        .catch(next)
})

//GET Route to show the orders in confirmation page after checking out 
router.get('/orders/:userId/confirmation', requireToken, (req,res,next) => {
    const ownerid = req.params.userId
    Order.findOne({owner: ownerid})
    .populate('productsOrdered')
    .then( order => {
        const productsInCart = order.productsOrdered
        return productsInCart
    })
    // if an error occurs, pass it to the handler
    .then(orders => res.status(200).json({orders:orders}))
    .catch(next)
})


// UPDATE -> PATCH /order/5a7db6c74d55bc51bdf39793
router.patch('/orders/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.order.owner

	Order.findById(req.params.id)
		.then(handle404)
		.then((order) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, order)

			// pass the result of Mongoose's `.update` to the next `.then`
			return order.updateOne(req.body.order)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DELETE one product item from cart
router.delete('/orders/:ownerId/:productId', requireToken, (req, res, next) => {
    const ownerid = req.params.ownerId
    const productid = req.params.productId
    
    Product.findOne({_id: req.params.productId})
        .then( product => {
            console.log('product: ', product)
            console.log('product ID: ', productid)
            console.log('owner ID: ', req.params.ownerId)
            product.stock++
            return product.save()
        })

    Order.findOne({owner: ownerid})
        .populate('productsOrdered')
        .then(handle404)
        .then((order) => {
            // Error if current user does not own the order
            const productsInCart = order.productsOrdered
            console.log('array', productsInCart)
            // Delete the order ONLY IF the above didn't error
            productsInCart.splice(productid, 1)
            console.log('array after splice', productsInCart)
            order.quantity--
            return order.save()
        })
        // yo fool
        // send back 204 and no content if the deletion succeeded
        .then(() => res.sendStatus(204))
        // if an error occurs, pass it to the handler
        .catch(next)
        
})

// DESTROY -> DELETE /order/5a7db6c74d55bc51bdf39793 - Removes all the product items from the cart
router.delete('/orders/:ownerId', requireToken, (req, res, next) => {
    const ownerid = req.params.ownerId

	Order.findOne({owner: ownerid})
        .populate('productsOrdered')
		.then(handle404) 
		.then((order) => {
			// Error if current user does not own the order
			const productsInCart = order.productsOrdered
            // Increment the product stock for each product in productsInCart
            productsInCart.forEach( product => {
                console.log('product: ', product)
                Product.findByIdAndUpdate({_id: product._id}, {$inc: { stock: 1 }})
                    .then( () => {
                        console.log('stock incremented by 1')
                    })
            });
            console.log('array', productsInCart)
			// Delete the order ONLY IF the above didn't error
            productsInCart.splice(0, productsInCart.length)
            // reset the order quantity back to 0
            order.quantity = 0
            console.log('array after splice', productsInCart)
            return order.save()

		})
        
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
        
})

// PATCH -> 
router.patch('/orders/:orderId/totalPrice', (req, res, next) => {
    const orderid = req.params.orderId

    Order.findById(orderid)
        .then( order => {
            console.log('Updated order with price: ', order)
            console.log('req.body.order ', req.body.order)
            order.totalPrice = req.body.order

            return order.save()
        })
        .catch(next)
})
/***********************************************/

module.exports = router