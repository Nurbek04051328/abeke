const {Schema, model} = require('mongoose')

const notification = new Schema({
    from: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    to: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    body: {
        type:String,
        default: 'Нет названия'
    },
    data: Data,
    img: String,
    createdAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Notification',notification)