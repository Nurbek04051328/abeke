const {Schema, model} = require('mongoose')

const typeproduct = new Schema({
    userId: String,
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    typeprice: {
        type: Schema.Types.ObjectId,
        ref: 'Typeprice'
    },
    price: Number,
})


module.exports = model('Typeproduct',typeproduct)