const {Schema, model} = require('mongoose')

const factor = new Schema({
    userId: String,
    user: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    name: {
        type:String,
        required: true,
        default: 'Нет названия'
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    createdAt: Date,
    updateAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Factor',factor)