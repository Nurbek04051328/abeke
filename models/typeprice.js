const {Schema, model} = require('mongoose')

const typeprice = new Schema({
    userId: String,
    title: String,
    type: Number,
    realisators: Array,
    clients: Array,
    createdTime: Date,
    updateTime: Date,
    status: {
        type: Number,
        default: 1
    }
})

// type = 1 realisators
// type = 2 clients


module.exports = model('Typeprice',typeprice)