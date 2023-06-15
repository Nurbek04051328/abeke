const {Schema, model} = require('mongoose')

const typeproduct = new Schema({
    userId: String,
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    typeprice: {
        type: Schema.Types.ObjectId,
        ref: 'Typeprice',
        default: null
    },
    price: Number,
    status: {
        type: Number,
        default:1
    },
    createdTime:Date
})


module.exports = model('Typeproduct',typeproduct)