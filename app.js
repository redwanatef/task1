const express = require("express")
const mongoose = require("mongoose")
const Redis = require("redis")


const app = express()

app.use(express.json())

const url = 'mongodb://localhost:27017/Products';

const redisClient = Redis.createClient()

mongoose
    .connect(url)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    category: String
}, { collection: 'Products' });

const Product = mongoose.model('Products', productSchema)

// function generateDummyProducts() {
//     const products = [];

//     for (let i = 1; i <= 1000; i++) {
//         const product = {
//             name: `Product ${i}`,
//             price: Math.floor(Math.random() * 100) + 1,
//             description: `This is the description for Product ${i}`,
//             category: `Category ${Math.floor(Math.random() * 10) + 1}`,
//         };

//         products.push(product);
//     }
//     Product.insertMany(products)
// }

// app.get('/generateDummyProducts', async function (req, res) {
//     await generateDummyProducts()
//     res.send("Products added")
// })

app.get('/products/:page?/:limit?', async function (req, res) {
    let page = parseInt(req.params.page) || 1;

    let totalItems = await Product.countDocuments();

    const limit = parseInt(req.params.limit) || 10;
    totalPages = Math.ceil(totalItems / limit);

    redisClient.get(`products-page${page}-limit${limit}`, async (error, result) => {
        if (error) console.error(error)
        if (result != null) {
            return res.json(JSON.parse(result))
        } else {
            var products = await Product.find()
                .limit(limit)
                .skip((page - 1) * limit);
            redisClient.setnx(`products-page${page}-limit${limit}`, JSON.stringify(products))
        }
        res.send({ data: products, currentPage: page, totalPages })
    })


});

module.exports = app;