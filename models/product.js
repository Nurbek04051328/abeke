const {Schema, model} = require('mongoose')

const product = new Schema({
    userId: String,
    code: String,
    title: {
        type: String
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    unit: Number,
    weight: Number,
    price: Number,
    count: Number,
    photo: String,
    createdTime: Date,
    updateTime: Date,
    status: {
        type: Number,
        default: 1
    }
})

// units
    //1- kg
    //2- шт
    //1- литр
module.exports = model('Product',product)
