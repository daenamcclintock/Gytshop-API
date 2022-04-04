const mongoose = require('mongoose')
const Product = require('./product')

const db = require('../../config/db')

const startProducts = [
    { name: 'MacBook Pro 2020', price: 1099, description: 'Brand new 2020 Mac book', category: 'electronics', stock: 5, image:'https://www.backmarket.com/cdn-cgi/image/format=auto,quality=75,width=640/https://d28i4xct2kl5lp.cloudfront.net/product_images/None_41c5fc19-5524-410f-a0d5-29503ed78651.jpg', owner:"6248a4487bd5d5ed9504b988" },
    { name: 'CryptoPunks', price: 500, description: 'Buy a random NFT card', category: 'collectibles', stock:20, image:'https://cdn.decrypt.co/resize/1024/height/512/wp-content/uploads/2021/12/cryptopunks-4156-nft-gID_7.png', owner:"6248a4487bd5d5ed9504b988"},
    { name: 'Levi\'s Blue Jeans', price: 50, description: 'Blue jeans for everyday styling', category: 'clothing', stock:13, image:'https://i.pinimg.com/originals/e3/5e/37/e35e37b89a0793dc8beb58e162dea697.jpg', owner:"6248a4487bd5d5ed9504b988"},
    { name: 'Levi\'s Black Jeans', price: 50, description: 'Black jeans for everyday styling', category: 'clothing', stock:12, image: 'https://i.pinimg.com/originals/c7/ee/88/c7ee881348717661775f77f511a45a6e.jpg', owner:"6248a4487bd5d5ed9504b988"},
    { name: 'Gap Blue Jeans', price: 50, description: 'Blue jeans for everyday styling', category: 'clothing', stock:15, image: 'https://www.gap.com/webcontent/0018/714/462/cn18714462.jpg', owner:"6248a4487bd5d5ed9504b988"},
    { name: 'Gap Black Jeans', price: 50, description: 'Black jeans for everyday styling', category: 'clothing', stock:10, image: 'https://oldnavy.gap.com/webcontent/0027/023/144/cn27023144.jpg', owner:"6248a4487bd5d5ed9504b988"},
    { name: 'Sony 50 inch Wide-Screen T.V', price: 399, description: 'Brand new Sony HD TV', category: 'electronics', stock: 3, image: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6453/6453619_rd.jpg', owner:"6248a4487bd5d5ed9504b988" },
    { name: 'Beach painting', price: 50, description: 'Art Work painted by Bob Ross', category: 'collectibles', stock:2, image: 'https://bluebeachhouseart.com/wp-content/uploads/2019/10/REA071-Props-square.jpg', owner:"6248a4487bd5d5ed9504b988"},
    { name: 'iPhone 10', price: 999, description: 'Apple iPhone 10', category: 'electronics', stock:4, image: 'https://i5.walmartimages.com/asr/289f2e32-8dcd-4572-9908-00fe73d7dde6.a826fb645acd38e266e4732cf05fdab7.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', owner:"6248a4487bd5d5ed9504b988"},
    { name: 'Bored Ape Yacht Club', price: 15000, description: 'Rare Bored Ape NFT', category: 'collectibles', stock:1, image: 'https://lh3.googleusercontent.com/mR3DK98FGoGxse3Ue3u9MOt2fr1oPFmm342AL8B-INSvOj9X4cVqxgM4LziXihS1wRxFCxgFF0ITf1Q5M3Afr93rbypUFpjcYXu7_SU=w600', owner:"6248a4487bd5d5ed9504b988"}
]

// first we connect to the db via mongoose
mongoose.connect(db, {
	useNewUrlParser: true,
})
    .then(() => {
        // then we remove all the products except the ones that have an owner
        Product.deleteMany({ owner: null })
            .then(deletedProduct => {
                console.log('deleted products', deletedProduct)
                // we'll use console logs to check if it's working or if there are errors
                Product.create(startProducts)
                    .then(newProducts => {
                        mongoose.connection.close()
                    })
                    .catch(err => {
                        console.log(err)
                        mongoose.connection.close()
                    })
            })
            .catch(error => {
                console.log(error)
                mongoose.connection.close()
            })
    })
    // then at the end, we close our connection to the db
    .catch(error => {
        console.log(error)
        mongoose.connection.close()
    })