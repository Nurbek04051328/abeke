const {Schema, model} = require('mongoose')

const typeprice = new Schema({
    userId: String,
    title: {
        type: String
    },
    type: Number,
    realisators: Array,
    clients: Array,
    createdAt: Date,
    updateAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Typeprice',typeprice)