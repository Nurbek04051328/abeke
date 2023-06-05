const {Schema, model} = require('mongoose')

const category = new Schema({
    userId: String,
    title: String,
    createdTime: Date,
    updateTime: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Category',category)