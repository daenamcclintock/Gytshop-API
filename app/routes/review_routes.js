// import our dependecies, middleware and models 
const express = require('express')
const passport = require('passport')
const Product = require('../models/product')
const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const requireToken = passport.authenticate('bearer', { session: false })
const removeBlanks = require('../../lib/remove_blank_fields')

const router = express.Router()


/******************** ROUTES *******************/

// POST -> create a review
// POST /reviews/<product_id>
router.post('/reviews/:productId', (req, res, next) => {
    // get our review from req.body
    const review = req.body.review
    // get our reviewId from req.params.id
    const productId = req.params.productId
    Product.findById(productId)
        // handle what happens if no review is found
        .then(handle404)
        .then(product => {
            console.log('this is the product', product)
            console.log('this is the review', review)
            // push the review to the reviews array
            product.reviews.push(review)
            return product.save()
        })
        .then(product => res.status(201).json({ product: product }))
        // catch errors and send to the handler
        .catch(next)
})


// // UPDATE
// // PATCH /reviews/<product>/<review_id>
// router.patch('/reviews/:productId/:reviewId', requireToken, removeBlanks, (req, res, next) => {
//     const reviewId = req.params.reviewId
//     const productId = req.params.productId

//     Product.findById(productId)
//         .then(handle404)
//         .then(product => {
//             const theReview = product.reviews.id(reviewId)
//             console.log('this is the original review', theReview)
//             requireOwnership(req, product)
//             theReview.set(req.body.review)

//             return product.save()
//         })
//         .then(() => res.sendStatus(204))
//         .catch(next)

// })

// DELETE -> delete a review
// DELETE /reviews/<productId>/<reviewId>
router.delete('/reviews/:productId/:reviewId', requireToken,(req, res, next) => {
    // saving both ids to variables for easy ref later
    const reviewId = req.params.reviewId
    const productId = req.params.productId
    // find the product in the db
    Product.findById(productId)

        // if product not found throw 404
        .then(handle404)
        .then(product => {
            // get the specific subdocument by its id
            const theReview = product.reviews.id(reviewId)
            requireOwnership(req, product)
            // call remove on the review we got on the line above requireOwnership
            theReview.remove()

            // return the saved product
            return product.save()
        })
        // send 204 no content
        .then(() => res.sendStatus(204))
        .catch(next)
})


module.exports = router